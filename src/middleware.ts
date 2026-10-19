import { defineMiddleware } from 'astro:middleware';
import { randomUUID } from 'node:crypto';
import { LANG_COOKIE, normalizeLang } from './i18n/config';
import {
  createRequestSupabase,
  getSupabaseConfig,
  type SessionUser,
} from './lib/supabase/server';

function hasAuthCookie(cookieHeader: string | null): boolean {
  if (!cookieHeader) return false;
  return cookieHeader
    .split(';')
    .some((part) => {
      const name = part.slice(0, part.indexOf('=')).trim();
      return name.startsWith('sb-') && name.includes('auth-token');
    });
}

function addSecurityHeaders(headers: Headers, url: URL): void {
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  if (url.protocol === 'https:') {
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
}

export const onRequest = defineMiddleware(async (context, next) => {
  const requestId = randomUUID();
  context.locals.requestId = requestId;
  context.locals.lang = normalizeLang(context.cookies.get(LANG_COOKIE)?.value);
  context.locals.user = null;

  if (getSupabaseConfig() && hasAuthCookie(context.request.headers.get('cookie'))) {
    try {
      const supabase = createRequestSupabase(context);
      if (supabase) {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          const user: SessionUser = { id: data.user.id, email: data.user.email ?? null };
          context.locals.user = user;
        }
      }
    } catch {
      // A broken or expired session must not take the whole page down. Routes
      // that require auth check `locals.user` and redirect to sign-in.
      context.locals.user = null;
    }
  }

  const response = await next();
  addSecurityHeaders(response.headers, context.url);
  response.headers.set('X-Request-ID', requestId);
  return response;
});
