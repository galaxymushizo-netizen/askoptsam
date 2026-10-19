import type { APIRoute } from 'astro';
import { LANG_COOKIE, isLang } from '../../i18n/config';
import { safeRedirectPath } from '../../lib/http/api';

export const prerender = false;

export const GET: APIRoute = async (context) => {
  const lang = context.url.searchParams.get('lang');
  const next = safeRedirectPath(context.url.searchParams.get('next'), '/');
  if (isLang(lang)) {
    context.cookies.set(LANG_COOKIE, lang, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
      secure: context.url.protocol === 'https:',
      httpOnly: false,
    });
  }
  return new Response(null, {
    status: 303,
    headers: { location: next, 'cache-control': 'no-store' },
  });
};
