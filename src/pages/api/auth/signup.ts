import type { APIRoute } from 'astro';
import {
  apiError,
  clientIdentifier,
  jsonResponse,
  readBody,
  safeRedirectPath,
  siteUrl,
  signUpSchema,
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

function formRedirect(url: string): Response {
  return new Response(null, { status: 303, headers: { location: url, 'cache-control': 'no-store' } });
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

  const raw = body as Record<string, unknown>;
  const normalized = {
    ...raw,
    acceptTerms:
      raw.acceptTerms === true ||
      raw.acceptTerms === 'true' ||
      raw.acceptTerms === 'on' ||
      raw.acceptTerms === '1',
  };
  const parsed = signUpSchema.safeParse(normalized);
  if (!parsed.success) return validationError(parsed.error);

  const form = isFormRequest(context.request);
  const limit = checkLimits([
    {
      key: `auth-signup:${hashIdentifier(clientIdentifier(context))}`,
      limit: 5,
      windowMs: 60 * 60 * 1000,
    },
  ]);
  if (!limit.allowed) {
    if (form) return formRedirect('/signup?error=rate_limited');
    return apiError('rate_limited', 'Too many attempts. Please wait and try again.', 429, {
      'Retry-After': String(limit.retryAfterSeconds),
    });
  }

  const supabase = createRequestSupabase(context);
  if (!supabase) return apiError('accounts_unavailable', 'Accounts are not configured.', 503);

  const redirectTo = `${siteUrl(context)}/api/auth/callback?next=${encodeURIComponent(
    safeRedirectPath(raw.next, '/account'),
  )}`;
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: redirectTo,
      data: {
        terms_accepted_at: new Date().toISOString(),
        policy_version: process.env.POLICY_VERSION || '2026-10-19',
      },
    },
  });

  if (error) {
    const code = error.code || '';
    if (form) return formRedirect(`/signup?error=${encodeURIComponent(code || 'generic')}`);
    return apiError(
      code === 'user_already_exists' ? 'account_exists' : 'signup_failed',
      code === 'user_already_exists'
        ? 'An account with that email already exists. Try signing in.'
        : 'The account could not be created. Please try again.',
      code === 'user_already_exists' ? 409 : 400,
    );
  }

  const needsConfirmation = !data.session;
  if (form) return formRedirect(needsConfirmation ? '/signin?check_email=1' : '/account');
  return jsonResponse({ ok: true, needsConfirmation, redirect: needsConfirmation ? null : '/account' });
};

export const GET: APIRoute = async () =>
  apiError('method_not_allowed', 'Use POST to create an account.', 405, { Allow: 'POST' });
