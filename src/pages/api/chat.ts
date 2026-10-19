import type { APIRoute } from 'astro';
import { streamChat, type ChatDoneEvent } from '../../lib/ai/service';
import {
  apiError,
  chatRequestSchema,
  clientIdentifier,
  readJson,
  validationError,
  type ChatRequestInput,
} from '../../lib/http/api';
import { buildLimitRules, checkLimits, hashIdentifier } from '../../lib/security/rate-limit';
import { createRequestSupabase } from '../../lib/supabase/server';
import type { ProviderMessage } from '../../lib/ai/provider';

export const prerender = false;

function titleFor(message: string): string {
  const compact = message.replace(/\s+/g, ' ').trim();
  return compact.length > 64 ? `${compact.slice(0, 61)}…` : compact || 'Eye-health conversation';
}

function sseFrame(event: string, data: unknown): Uint8Array {
  return new TextEncoder().encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function metadataFor(done: ChatDoneEvent, lang: string): Record<string, unknown> {
  return {
    lang,
    mode: done.mode,
    providerLabel: done.providerLabel,
    model: done.model,
    demoReason: done.demoReason,
    sources: done.sources,
    usedSourceIndexes: done.usedSourceIndexes,
    followUps: done.followUps,
    cautionApplied: done.cautionApplied,
    triage: done.triage,
    truncated: done.truncated ?? false,
    warningCode: done.warningCode ?? null,
    policyVersion: process.env.POLICY_VERSION || '2026-10-19',
  };
}

async function preparePersistence(
  context: Parameters<APIRoute>[0],
  input: ChatRequestInput,
  user: NonNullable<App.Locals['user']>,
): Promise<
  | { ok: true; conversationId: string | null; history: ProviderMessage[] }
  | { ok: false; response: Response }
> {
  const supabase = createRequestSupabase(context);
  if (!supabase) {
    return {
      ok: false,
      response: apiError(
        'accounts_unavailable',
        'Saved history is not configured on this deployment.',
        503,
      ),
    };
  }

  let conversationId: string | null = input.conversationId;
  let history: ProviderMessage[] = [];

  if (conversationId) {
    const { data: conversation, error } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', conversationId)
      .maybeSingle();
    if (error) {
      return {
        ok: false,
        response: apiError('conversation_unavailable', 'Could not open that conversation.', 500),
      };
    }
    if (!conversation) {
      return {
        ok: false,
        response: apiError('not_found', 'That conversation was not found.', 404),
      };
    }

    const { data: messages } = await supabase
      .from('messages')
      .select('role,content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(24);

    history = (messages ?? [])
      .filter(
        (message): message is { role: 'user' | 'assistant'; content: string } =>
          (message.role === 'user' || message.role === 'assistant') &&
          typeof message.content === 'string',
      )
      .slice(-8);
  } else {
    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        title: titleFor(input.message),
        lang: input.lang,
      })
      .select('id')
      .single();
    if (error || !conversation) {
      return {
        ok: false,
        response: apiError(
          'save_failed',
          'The conversation could not be saved. Please try again or continue without saving.',
          500,
        ),
      };
    }
    conversationId = conversation.id as string;
  }

  const { error: insertError } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    user_id: user.id,
    role: 'user',
    content: input.message,
    metadata: { lang: input.lang },
  });
  if (insertError) {
    return {
      ok: false,
      response: apiError('save_failed', 'The message could not be saved.', 500),
    };
  }

  // Consent is recorded once per policy version. Duplicate inserts are ignored.
  await supabase.from('consent_records').insert({
    user_id: user.id,
    kind: 'history_storage',
    policy_version: process.env.POLICY_VERSION || '2026-10-19',
  });

  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  return { ok: true, conversationId, history };
}

export const POST: APIRoute = async (context) => {
  const { request, locals } = context;
  const user = locals.user;
  const body = await readJson(request);
  if (body === null) {
    return apiError('invalid_json', 'Send a JSON request body.', 400);
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);
  const input = parsed.data;

  if (input.save && !user) {
    return apiError(
      'auth_required',
      'Sign in before saving a conversation. You can continue without an account.',
      401,
    );
  }
  if (input.conversationId && !user) {
    return apiError('auth_required', 'Sign in to open a saved conversation.', 401);
  }

  const identifier = hashIdentifier(
    user ? `user:${user.id}` : clientIdentifier(context),
  );
  const limits = checkLimits(buildLimitRules(identifier, user ? 2 : 1));
  if (!limits.allowed) {
    return apiError(
      'rate_limited',
      'You have reached the question limit for now. Please try again later.',
      429,
      { 'Retry-After': String(limits.retryAfterSeconds) },
    );
  }

  let conversationId = input.conversationId;
  let history: ProviderMessage[] = input.history;
  let saved = false;

  if (input.save && user) {
    const persistence = await preparePersistence(context, input, user);
    if (!persistence.ok) return persistence.response;
    conversationId = persistence.conversationId;
    history = persistence.history;
    saved = true;
  }

  const supabase = saved && user ? createRequestSupabase(context) : null;
  let persistenceWarning: string | null = null;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const send = (event: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(sseFrame(event, data));
        } catch {
          closed = true;
        }
      };

      const close = () => {
        if (closed) return;
        closed = true;
        try {
          controller.close();
        } catch {
          // The client may already have disconnected.
        }
      };

      send('session', {
        conversationId: saved ? conversationId : null,
        saving: saved,
      });

      try {
        for await (const event of streamChat({
          message: input.message,
          lang: input.lang,
          history,
          signal: request.signal,
          remaining: limits.remaining,
        })) {
          if (event.type === 'meta') {
            send('meta', event);
            continue;
          }
          if (event.type === 'triage') {
            send('triage', event.guidance);
            continue;
          }
          if (event.type === 'delta') {
            send('delta', event.text);
            continue;
          }
          if (event.type === 'error') {
            send('error', event);
            continue;
          }

          if (event.type === 'done') {
            if (saved && user && supabase && conversationId) {
              const { data: inserted, error: assistantError } = await supabase
                .from('messages')
                .insert({
                  conversation_id: conversationId,
                  user_id: user.id,
                  role: 'assistant',
                  content: event.text,
                  metadata: metadataFor(event, input.lang),
                })
                .select('id')
                .single();

              if (assistantError) {
                persistenceWarning = 'assistant_save_failed';
              }

              await supabase
                .from('conversations')
                .update({ updated_at: new Date().toISOString(), lang: input.lang })
                .eq('id', conversationId);

              send('done', {
                ...event,
                conversationId: saved ? conversationId : null,
                saved,
                messageId: inserted?.id ?? null,
                persistenceWarning,
              });
            } else {
              send('done', {
                ...event,
                conversationId: conversationId ?? null,
                saved: false,
                messageId: null,
                persistenceWarning: null,
              });
            }
          }
        }
      } catch (error) {
        // Do not log message text or provider bodies. Only a generic client
        // error event is emitted.
        const aborted = request.signal.aborted || (error as Error)?.name === 'AbortError';
        if (!aborted) {
          send('error', {
            type: 'error',
            code: 'stream_failed',
            message: 'The assistant could not complete that response.',
          });
        }
      } finally {
        close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-store, no-transform',
      connection: 'keep-alive',
      'x-accel-buffering': 'no',
      'x-request-id': context.locals.requestId,
    },
  });
};

export const GET: APIRoute = async () =>
  apiError('method_not_allowed', 'Use POST for chat requests.', 405, { Allow: 'POST' });

export type { ChatRequestInput };
