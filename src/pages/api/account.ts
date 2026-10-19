import type { APIRoute } from 'astro';
import {
  accountPatchSchema,
  apiError,
  deleteAccountSchema,
  jsonResponse,
  readBody,
  readJson,
  validationError,
} from '../../lib/http/api';
import {
  createAdminSupabase,
  createRequestSupabase,
  isSupabaseConfigured,
} from '../../lib/supabase/server';

export const prerender = false;

interface ProfileRow {
  preferred_lang: string | null;
  save_history_default: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

function requireUser(context: Parameters<APIRoute>[0]) {
  if (!context.locals.user) {
    return {
      user: null,
      response: apiError('auth_required', 'Sign in to manage your account.', 401),
    };
  }
  return { user: context.locals.user, response: null };
}

export const GET: APIRoute = async (context) => {
  const auth = requireUser(context);
  if (!auth.user) return auth.response!;

  if (!isSupabaseConfigured()) {
    return jsonResponse({
      ok: true,
      profile: { preferredLang: 'en', saveHistoryDefault: false },
      accountsConfigured: false,
    });
  }

  const supabase = createRequestSupabase(context);
  if (!supabase) return apiError('accounts_unavailable', 'Accounts are unavailable.', 503);

  const { data, error } = await supabase
    .from('profiles')
    .select('preferred_lang, save_history_default, created_at, updated_at')
    .eq('id', auth.user.id)
    .maybeSingle<ProfileRow>();

  if (error) return apiError('profile_unavailable', 'Could not load your profile.', 500);

  return jsonResponse({
    ok: true,
    accountsConfigured: true,
    email: auth.user.email,
    profile: {
      preferredLang: data?.preferred_lang === 'sw' ? 'sw' : 'en',
      saveHistoryDefault: Boolean(data?.save_history_default),
      createdAt: data?.created_at ?? null,
      updatedAt: data?.updated_at ?? null,
    },
  });
};

export const PATCH: APIRoute = async (context) => {
  const auth = requireUser(context);
  if (!auth.user) return auth.response!;

  const body = await readJson(context.request);
  if (body === null) return apiError('invalid_json', 'Send a JSON request body.', 400);
  const parsed = accountPatchSchema.safeParse(body);
  if (!parsed.success) return validationError(parsed.error);

  const supabase = createRequestSupabase(context);
  if (!supabase) return apiError('accounts_unavailable', 'Accounts are unavailable.', 503);

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (parsed.data.preferredLang) update.preferred_lang = parsed.data.preferredLang;
  if (parsed.data.saveHistoryDefault !== undefined) {
    update.save_history_default = parsed.data.saveHistoryDefault;
  }

  const { error } = await supabase.from('profiles').upsert(
    { id: auth.user.id, ...update },
    { onConflict: 'id' },
  );
  if (error) return apiError('profile_update_failed', 'Could not save your preferences.', 500);

  return jsonResponse({ ok: true });
};

export const DELETE: APIRoute = async (context) => {
  const auth = requireUser(context);
  if (!auth.user) return auth.response!;

  const body = await readBody(context.request);
  if (body === null) return apiError('invalid_input', 'Type DELETE to confirm.', 400);
  const parsed = deleteAccountSchema.safeParse(body);
  if (!parsed.success) {
    return apiError('confirmation_required', 'Type DELETE to confirm account deletion.', 400);
  }

  const admin = createAdminSupabase();
  if (!admin) {
    return apiError(
      'service_role_missing',
      'Account deletion requires the server-side SUPABASE_SERVICE_ROLE_KEY. Ask the operator to configure it, or contact the operator to complete deletion.',
      503,
    );
  }

  const { error } = await admin.auth.admin.deleteUser(auth.user.id);
  if (error) {
    return apiError('delete_failed', 'The account could not be deleted. Please contact the operator.', 500);
  }

  try {
    const supabase = createRequestSupabase(context);
    await supabase?.auth.signOut();
  } catch {
    // The user no longer exists; clearing cookies is best effort.
  }

  return jsonResponse({ ok: true });
};

export const POST: APIRoute = async () =>
  apiError('method_not_allowed', 'Use PATCH or DELETE.', 405, { Allow: 'GET, PATCH, DELETE' });
