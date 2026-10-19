import type { APIRoute } from 'astro';
import {
  apiError,
  clientIdentifier,
  jsonResponse,
  readBody,
  safeRedirectPath,
  siteUrl,
  signInSchema,
  validationError,
} from '../../../lib/http/api';
import { checkLimits, hashIdentifier } from '../../../lib/security/rate-limit';
import { createRequestSupabase, isSupabaseConfigured } from '../../../lib/supabase/server';

export const prerender = false;

function isFormRequest(request: Request): boolean {
  const type = request.headers.get('content-type') || '';
  return (
    type.includes('application/x-www-form-urlencoded') || type.includes('multipart/form-data')
  );
}

function formRedirect(url: string, status = 303): Response {
  return new Response(null, { status, headers: { location: url, 'cache-control': 'no-store' } });
}

export const POST: APIRoute = async (context) => {
  if (!isSupabaseConfigured()) {
    return apiError(
      'accounts_unavailable',
      'Accounts are not configured on this deployment. Temporary chat still works.',
      503,
    );
  }

  const body = await readBody(context.request);
  if (body === null || typeof body !== 'object') {
    return apiError('invalid_input', 'Send an email and password.', 400);
  }
  const parsed = signInSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const form = isFormRequest(context.request);
  const limit = checkLimits([
    {
      key: `auth-signin:${hashIdentifier(
        `${clientIdentifier(context)}:${parsed.data.email}`,
      )}`,
      limit: 8,
      windowMs: 15 * 60 * 1000,
    },
  ]);
  if (!limit.allowed) {
    if (form) return formRedirect('/signin?error=rate_limited');
    return apiError('rate_limited', 'Too many attempts. Please wait and try again.', 429, {
      'Retry-After': String(limit.retryAfterSeconds),
    });
  }

  const supabase = createRequestSupabase(context);
  if (!supabase) {
    return apiError('accounts_unavailable', 'Accounts are not configured.', 503);
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    if (form) return formRedirect('/signin?error=credentials');
    return apiError('invalid_credentials', 'The email or password is incorrect.', 401);
  }

  const next = safeRedirectPath((body as Record<string, unknown>).next, '/account');
  if (form) return formRedirect(next);
  return jsonResponse({ ok: true, redirect: next });
};

export const GET: APIRoute = async () =>
  apiError('method_not_allowed', 'Use POST to sign in.', 405, { Allow: 'POST' });

export { siteUrl };
