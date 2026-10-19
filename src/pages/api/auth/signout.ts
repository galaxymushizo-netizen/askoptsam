import type { APIRoute } from 'astro';
import { apiError, jsonResponse } from '../../../lib/http/api';
import { createRequestSupabase, isSupabaseConfigured } from '../../../lib/supabase/server';

export const prerender = false;

function isFormRequest(request: Request): boolean {
  const type = request.headers.get('content-type') || '';
  return (
    type.includes('application/x-www-form-urlencoded') || type.includes('multipart/form-data')
  );
}

export const POST: APIRoute = async (context) => {
  const form = isFormRequest(context.request);
  if (isSupabaseConfigured()) {
    const supabase = createRequestSupabase(context);
    if (supabase) {
      await supabase.auth.signOut();
    }
  }
  if (form) {
    return new Response(null, {
      status: 303,
      headers: { location: '/', 'cache-control': 'no-store' },
    });
  }
  return jsonResponse({ ok: true });
};

export const GET: APIRoute = async () =>
  apiError('method_not_allowed', 'Use POST to sign out.', 405, { Allow: 'POST' });
