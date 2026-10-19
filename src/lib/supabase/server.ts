import type { AstroCookies } from 'astro';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string | null;
}

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = (process.env.SUPABASE_URL || '').trim();
  const anonKey = (process.env.SUPABASE_ANON_KEY || '').trim();
  if (!url || !anonKey) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.hostname !== 'localhost') return null;
  } catch {
    return null;
  }
  return {
    url,
    anonKey,
    serviceRoleKey: (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim() || null,
  };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null;
}

export interface SupabaseRequestContext {
  cookies: AstroCookies;
  request: Request;
}

/**
 * Astro 7's AstroCookies has no enumeration API, so read the cookie header to
 * discover Supabase's chunked auth cookies, then decode each through Astro.
 */
function readRequestCookies(
  cookies: AstroCookies,
  header: string | null,
): Array<{ name: string; value: string }> {
  if (!header) return [];
  const seen = new Set<string>();
  const result: Array<{ name: string; value: string }> = [];
  for (const part of header.split(';')) {
    const name = part.slice(0, part.indexOf('=')).trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    const value = cookies.get(name)?.value;
    if (value !== undefined) result.push({ name, value });
  }
  return result;
}

/**
 * Creates a request-scoped Supabase client. Never share this across requests.
 * Cookies remain httpOnly because AskOptsam does not use a browser Supabase
 * client; all authentication flows pass through server endpoints.
 */
export function createRequestSupabase(
  context: SupabaseRequestContext,
): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config) return null;

  const { cookies, request } = context;

  return createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return readRequestCookies(cookies, request.headers.get('cookie'));
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          cookies.set(name, value, {
            ...options,
            path: '/',
            sameSite: 'lax',
            secure: new URL(config.url).protocol === 'https:',
            httpOnly: true,
          });
        }
      },
    },
    cookieOptions: {
      sameSite: 'lax',
      secure: new URL(config.url).protocol === 'https:',
      httpOnly: true,
    },
  });
}

/**
 * Service-role client for account deletion only. Must never be imported into
 * client code or used for ordinary user-scoped queries.
 */
export function createAdminSupabase(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config?.serviceRoleKey) return null;
  return createServerClient(config.url, config.serviceRoleKey, {
    cookies: {
      getAll() {
        return [];
      },
      setAll() {
        // Service-role operations do not need user cookies.
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export interface SessionUser {
  id: string;
  email: string | null;
}
