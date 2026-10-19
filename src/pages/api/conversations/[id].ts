import type { APIRoute } from 'astro';
import {
  apiError,
  conversationPatchSchema,
  jsonResponse,
  readJson,
  validationError,
} from '../../../lib/http/api';
import { createRequestSupabase } from '../../../lib/supabase/server';

export const prerender = false;

function notSignedIn() {
  return apiError('auth_required', 'Sign in to open a saved conversation.', 401);
}

export const GET: APIRoute = async (context) => {
  if (!context.locals.user) return notSignedIn();
  const id = context.params.id;
  if (!id) return apiError('invalid_input', 'Conversation id is missing.', 400);

  const supabase = createRequestSupabase(context);
  if (!supabase) return apiError('accounts_unavailable', 'Accounts are unavailable.', 503);

  const { data: conversation, error } = await supabase
    .from('conversations')
    .select('id,title,lang,created_at,updated_at')
    .eq('id', id)
    .maybeSingle();

  if (error) return apiError('history_unavailable', 'Could not load the conversation.', 500);
  if (!conversation) return apiError('not_found', 'Conversation not found.', 404);

  const { data: messages, error: messageError } = await supabase
    .from('messages')
    .select('id,role,content,metadata,created_at')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true });

  if (messageError) return apiError('history_unavailable', 'Could not load messages.', 500);

  return jsonResponse({
    ok: true,
    conversation,
    messages: messages ?? [],
  });
};

export const PATCH: APIRoute = async (context) => {
  if (!context.locals.user) return notSignedIn();
  const id = context.params.id;
  if (!id) return apiError('invalid_input', 'Conversation id is missing.', 400);

  const body = await readJson(context.request);
  if (body === null) return apiError('invalid_json', 'Send a JSON request body.', 400);
  const parsed = conversationPatchSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const supabase = createRequestSupabase(context);
  if (!supabase) return apiError('accounts_unavailable', 'Accounts are unavailable.', 503);

  const { data, error } = await supabase
    .from('conversations')
    .update({ title: parsed.data.title, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id,title')
    .maybeSingle();

  if (error) return apiError('rename_failed', 'Could not rename the conversation.', 500);
  if (!data) return apiError('not_found', 'Conversation not found.', 404);
  return jsonResponse({ ok: true, conversation: data });
};

export const DELETE: APIRoute = async (context) => {
  if (!context.locals.user) return notSignedIn();
  const id = context.params.id;
  if (!id) return apiError('invalid_input', 'Conversation id is missing.', 400);

  const supabase = createRequestSupabase(context);
  if (!supabase) return apiError('accounts_unavailable', 'Accounts are unavailable.', 503);

  const { data, error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle();

  if (error) return apiError('delete_failed', 'Could not delete the conversation.', 500);
  if (!data) return apiError('not_found', 'Conversation not found.', 404);
  return jsonResponse({ ok: true });
};

export const POST: APIRoute = async () =>
  apiError('method_not_allowed', 'Use GET, PATCH, or DELETE.', 405, {
    Allow: 'GET, PATCH, DELETE',
  });
