# Local setup and deployment

This guide covers a local demo, optional Supabase accounts, optional live AI, and
a production Node deployment. For variable-by-variable details, see
[CONFIGURATION.md](CONFIGURATION.md).

> The safe default is demo mode with no accounts. Do not enable live AI or claim
> image analysis just to make a demonstration look more complete.

## 1. Prerequisites

- **Node.js 22.22.0+**. The workspace was verified with Node 24.20.0.
- npm, using the committed `package-lock.json`.
- A modern browser with JavaScript for the chat.
- Optional: a Supabase project for accounts and saved history.
- Optional: a reviewed AI provider account for live mode.

Check versions:

```powershell
node --version
npm --version
```

## 2. Local demo

```powershell
cd askoptsam
npm ci
Copy-Item .env.example .env
npm run dev
```

Open <http://localhost:4321>.

You can also skip `.env` entirely: the application defaults to demo mode and
temporary chat. Copying the template makes the available settings visible.

Expected local state with blank Supabase and AI credentials:

- `/` and `/learn` render normally.
- `/chat` works with labelled demo answers and deterministic safety triage.
- `/signin`, `/signup`, `/account`, and `/history` explain that accounts are not
  configured.
- `/api/image` returns HTTP 503 with `image_disabled`.
- `/status` reports demo mode, image explanation disabled, privacy review
  pending, and clinical review pending.

Useful checks:

```powershell
npm run check
npm test
npm run verify:sources
```

For browser tests:

```powershell
npx playwright install chromium
npm run test:e2e
```

`npm run test:e2e` builds the app, then Playwright starts a preview server on
port 4327. If a preview server is already running locally, Playwright will reuse
it outside CI; make sure it serves the latest build before trusting the result.

For a production-style local check:

```powershell
npm run build
npm run smoke
npm run preview -- --host 127.0.0.1 --port 4327
```

`npm run smoke` starts its own standalone server on port 4331 and checks public
pages, headers, demo SSE, triage SSE, the language cookie, image refusal, and 404
behaviour.

## 3. Environment loading

There are two categories of configuration:

1. **Build-time values.** `PUBLIC_SITE_URL` is used in `astro.config.mjs`.
   Changing it requires a new build.
2. **Runtime values.** Supabase, AI provider, budgets, rate limits, and policy
   version are read through `process.env` by the standalone server.

Set the complete environment before both the build and the runtime. The
standalone Node entry point does **not** read `.env` automatically. For a local
production start, use Node's environment-file flag:

```powershell
npm run build
node --env-file=.env ./dist/server/entry.mjs
```

In production, provide variables through your process manager, container
environment, or hosting platform. Never commit `.env`.

After changing `PUBLIC_SITE_URL`, rebuild. After changing runtime values,
restart the process.

## 4. Optional Supabase setup

Temporary chat needs no Supabase project. Accounts and saved history do.

1. Create a Supabase project.
2. Run `supabase/migrations/0001_initial.sql` in the SQL editor, or use the
   Supabase CLI as described in [../supabase/README.md](../supabase/README.md).
3. Set:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only; required for complete account
     deletion)
4. In **Authentication → URL configuration**, set:
   - Site URL: your canonical `PUBLIC_SITE_URL`
   - Redirect URL: `https://your-domain/api/auth/callback`
   - Local redirect: `http://localhost:4321/api/auth/callback`
5. Configure SMTP/email confirmation before production. Supabase's default email
   delivery is rate-limited and not intended as a production mail service.
6. Decide whether email confirmation is required. The sign-up flow supports both
   outcomes:
   - Session returned immediately → `/account`.
   - Confirmation required → `/signin?check_email=1`.

`SUPABASE_URL` must be HTTPS unless it is a localhost URL. The application does
not expose the anon key to the browser; all session work happens on the server
through httpOnly cookies.

### Verify RLS before launch

The supplied tests check the migration statically. They cannot prove that your
deployed project is configured correctly. Use two real accounts:

1. Sign in as account A and save a conversation.
2. Copy its conversation URL or ID.
3. Sign in as account B in a separate browser profile.
4. Request the same conversation ID, history list, rename, and delete endpoints.
5. Expect no access (`404` or an empty list), not another user's data.
6. Use the account page as account B to confirm deletion only affects B.

Also confirm account deletion in a non-production project. Without
`SUPABASE_SERVICE_ROLE_KEY` the app deliberately returns an error instead of
claiming deletion succeeded.

## 5. Optional live AI

Do not enable a provider until its current terms, data-retention practices, and
cross-border processing have been reviewed for sensitive health information. A
privacy approval is a recorded operational decision, not a compliance badge.

Set one of the following:

### Gemini

```dotenv
AI_PROVIDER=gemini
AI_MODEL=gemini-2.5-flash
GEMINI_API_KEY=...
AI_PRIVACY_APPROVED=true
AI_PRIVACY_REVIEWED_AT=2026-10-19
```

### OpenAI-compatible

The base URL must be the API prefix, without a trailing slash. The adapter appends
`/chat/completions`.

```dotenv
AI_PROVIDER=openai-compatible
AI_MODEL=...
OPENAI_COMPATIBLE_BASE_URL=https://provider.example/v1
OPENAI_COMPATIBLE_API_KEY=...
AI_PRIVACY_APPROVED=true
AI_PRIVACY_REVIEWED_AT=2026-10-19
```

Keep `AI_ENABLED=true`, or set it to `false` as a kill switch. Demo and safety
responses continue to work when live AI is disabled.

After restart, check `/status`. It must report `live` only when every gate passes.
Run a harmless question and a red-flag question. The red-flag question must
return deterministic safety guidance even if the provider is down.

## 6. Production deployment

The shipped adapter is `@astrojs/node` in standalone mode. Deploy to a Node host
that supports long-lived HTTP responses for Server-Sent Events. This project is
not configured for serverless/edge deployment; doing so requires an appropriate
adapter and a shared rate-limit/budget store.

### Build and start

```bash
npm ci
npm run build
HOST=0.0.0.0 PORT=4321 node ./dist/server/entry.mjs
```

PowerShell equivalent:

```powershell
npm ci
npm run build
$env:HOST = "0.0.0.0"
$env:PORT = "4321"
node ./dist/server/entry.mjs
```

Or use `npm start`, which runs `node ./dist/server/entry.mjs`. It expects
environment variables to be injected by the host.

Set:

- `PUBLIC_SITE_URL=https://your-domain.example` **before building**.
- All runtime secrets in the hosting environment.
- `TRUST_PROXY=true` **only** when a trusted reverse proxy overwrites
  `X-Forwarded-For`. If clients can set that header themselves, leave it false.
- An HTTPS reverse proxy. HSTS is only emitted for HTTPS requests.

### Reverse proxy requirements

The proxy must:

- Terminate HTTPS.
- Pass the original `Host` and scheme.
- Replace, not append to untrusted client-supplied forwarding headers.
- Disable response buffering for `/api/chat` so SSE reaches the client.

Example Nginx block:

```nginx
location / {
    proxy_pass http://127.0.0.1:4321;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_buffering off;
    proxy_read_timeout 90s;
}
```

If you use this configuration, set `TRUST_PROXY=true` and ensure Nginx is only
reachable through the trusted proxy path.

### Health and readiness

- `/api/health` returns a minimal health response and is suitable for a load
  balancer.
- `/api/status` reports mode, provider category, budget counters, source count,
  accounts configuration, and disabled image analysis. It does not expose secrets.

Use `/api/health` for liveness/readiness, and `/api/status` for an operator-level
check.

### Single-instance constraint

Rate limits and AI budgets live in process memory. With two instances:

- each instance enforces its own limits;
- limits reset on restart;
- the effective global budget can be multiplied by the number of instances.

Use one instance for the MVP, or replace both stores with a shared atomic store
(for example Redis or PostgreSQL) before horizontal scaling. Do not expose
multiple instances and claim the configured caps are global.

## 7. Post-deployment checklist

- [ ] `GET /api/health` returns 200.
- [ ] `GET /api/status` shows the intended mode and no unexpected live AI.
- [ ] HTTPS is enforced; no mixed content.
- [ ] `TRUST_PROXY` matches the actual proxy setup.
- [ ] The rate limit salt is a real random secret, at least 32 characters.
- [ ] A red-flag question returns safety guidance and never waits for AI.
- [ ] `/api/image` returns 503 for GET and POST.
- [ ] Sign-up, sign-in, email callback, save, history, and account deletion were
      tested in a non-production Supabase project.
- [ ] RLS was tested with two accounts.
- [ ] The AI provider privacy review date is recorded.
- [ ] Budget counters behave correctly after a restart and are monitored.
- [ ] Privacy, terms, and clinical review gates are complete before public launch.

## 8. Troubleshooting

**Accounts are unavailable.** `SUPABASE_URL` and `SUPABASE_ANON_KEY` are missing,
malformed, or the URL is not HTTPS/localhost.

**Live mode never activates.** Check `/status` and the demo reason. Common causes:
`AI_PROVIDER=demo`, missing key/model/base URL, missing privacy approval date, or
the request budget is exhausted.

**Chat responses arrive all at once.** A proxy is buffering. Disable buffering
for the chat route and check `x-accel-buffering: no` reaches the client.

**429 after a few questions.** The default anonymous limit is 6 questions per
minute and 80 per day per IP hash. Signed-in users receive a 2× multiplier.
Restarting the server clears in-memory counters, which is not a production
solution.

**Account deletion returns 503.** Configure `SUPABASE_SERVICE_ROLE_KEY` on the
server or perform deletion manually in Supabase. Never put this key in browser
code.

**E2E tests hang or reuse old code.** Stop any manual preview server, then run
`npm run test:e2e` again. The test script builds before Playwright starts.
