# Supabase setup

1. Create a project at <https://supabase.com>.
2. In **Project settings → API**, copy:
   - Project URL → `SUPABASE_URL`
   - `anon` public key → `SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server only; required for complete account deletion)
3. Run `supabase/migrations/0001_initial.sql` in the SQL editor, or use the Supabase CLI:

   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```

4. In **Authentication → URL configuration**:
   - Site URL: your canonical `PUBLIC_SITE_URL`
   - Redirect URLs: `https://your-domain/api/auth/callback`
   - For local development: `http://localhost:4321/api/auth/callback`
5. Decide whether email confirmation is required. If it is, configure an SMTP
   provider; Supabase's default email sending is rate-limited and not suitable
   for production.

## Security notes

- RLS is enabled on every table. Only the `authenticated` role receives table
  grants, and policies compare `auth.uid()` with the row owner.
- The service-role key bypasses RLS. It is used only by the account-deletion
  endpoint and must never appear in client code or `PUBLIC_*` variables.
- Account deletion uses `auth.admin.deleteUser`, which cascades to profiles,
  conversations, messages, and consent records.
- If `SUPABASE_SERVICE_ROLE_KEY` is absent, deletion returns a clear error
  instead of pretending the account was removed.
- Sessions are server-managed httpOnly cookies via `@supabase/ssr`. There is no
  browser Supabase client, so the anon key is not exposed in this MVP.
- Test RLS with two separate accounts before launch: each account must be unable
  to read, update, or delete the other's conversation or messages.

## Local-only alternative

Temporary chat works without Supabase. If the variables are missing, auth and
saved history are disabled and the UI says so. Do not advertise saved history in
that configuration.
