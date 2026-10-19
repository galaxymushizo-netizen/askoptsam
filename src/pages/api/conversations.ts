import type { APIRoute } from 'astro';
import { apiError, jsonResponse } from '../../lib/http/api';
import { createRequestSupabase } from '../../lib/supabase/server';

export const prerender = false;

export const GET: APIRoute = async (context) => {
  if (!context.locals.user) {
    return apiError('auth_required', 'Sign in to see saved conversations.', 401);
  }
  const supabase = createRequestSupabase(context);
  if (!supabase) return apiError('accounts_unavailable', 'Accounts are unavailable.', 503);

  const { data, error } = await supabase
    .from('conversations')
    .select('id,title,lang,created_at,updated_at,messages(count)')
    .order('updated_at', { ascending: false })
    .limit(100);

  if (error) return apiError('history_unavailable', 'Could not load saved conversations.', 500);

  return jsonResponse({
    ok: true,
    conversations: (data ?? []).map((row) => {
      const messages = Array.isArray(row.messages) ? row.messages[0] : null;
      const count =
        messages && typeof messages === 'object' && 'count' in messages
          ? Number((messages as { count?: number }).count ?? 0)
          : 0;
      return {
        id: row.id as string,
        title: row.title as string,
        lang: row.lang as string,
        createdAt: row.created_at as string,
        updatedAt: row.updated_at as string,
        messageCount: count,
      };
    }),
  });
};

export const DELETE: APIRoute = async (context) => {
  if (!context.locals.user) {
    return apiError('auth_required', 'Sign in to delete saved conversations.', 401);
  }
  if (context.url.searchParams.get('all') !== 'true') {
    return apiError('confirmation_required', 'Use ?all=true to delete every conversation.', 400);
  }
  const supabase = createRequestSupabase(context);
  if (!supabase) return apiError('accounts_unavailable', 'Accounts are unavailable.', 503);

  const { data, error } = await supabase
    .from('conversations')
    .delete()
    .eq('user_id', context.locals.user.id)
    .select('id');

  if (error) return apiError('delete_failed', 'Could not delete saved conversations.', 500);
  return jsonResponse({ ok: true, deleted: data?.length ?? 0 });
};

export const POST: APIRoute = async () =>
  apiError('method_not_allowed', 'Conversations are created by the chat endpoint.', 405, {
    Allow: 'GET, DELETE',
  });
