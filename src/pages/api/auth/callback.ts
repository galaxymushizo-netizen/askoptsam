import type { APIRoute } from 'astro';
import { safeRedirectPath } from '../../../lib/http/api';
import { createRequestSupabase, isSupabaseConfigured } from '../../../lib/supabase/server';

export const prerender = false;

function redirect(path: string): Response {
  return new Response(null, {
    status: 303,
    headers: { location: path, 'cache-control': 'no-store' },
  });
}

export const GET: APIRoute = async (context) => {
  const code = context.url.searchParams.get('code');
  const next = safeRedirectPath(context.url.searchParams.get('next'), '/account');
  const authError =
    context.url.searchParams.get('error') || context.url.searchParams.get('error_description');

  if (authError) return redirect('/signin?error=callback');
  if (!code || !isSupabaseConfigured()) return redirect('/signin?error=callback');

  const supabase = createRequestSupabase(context);
  if (!supabase) return redirect('/signin?error=callback');

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return redirect('/signin?error=callback');
  return redirect(next);
};
