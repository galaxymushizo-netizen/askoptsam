# Security and privacy design

> This is an engineering description of the MVP, not a certification or legal
> opinion. The product has not had an independent penetration test, a formal data
> protection impact assessment, or East African legal review.

## Safety first

- Red-flag triage runs locally before any provider call.
- Chemical exposure, sudden vision loss, severe eye pain, penetrating injury,
  retinal warning patterns, and other urgent patterns receive deterministic
  bilingual guidance.
- Safety messages do not depend on AI availability and are not labelled as AI.
- The system never triages an image.
- A model response is sanitised on the server before streaming to the browser:
  URLs, HTML, images, email addresses, markdown headings, invented citation IDs,
  confident diagnosis sentences, and false-reassurance sentences are removed or
  replaced.
- The model is instructed to use only selected registry sources, cite with
  `[S1]`-style tokens, decline diagnosis, avoid doses, and direct urgent cases to
  emergency care.
- The output guard cannot verify medical accuracy. It is a safety net, not a
  clinical reviewer.

## Threat and control summary

| Threat | Current control | Residual risk |
| --- | --- | --- |
| Missed emergency | Deterministic triage, explicit warning copy, safety prompt | Natural-language coverage is finite; unusual phrasing can be missed. Clinical review is pending. |
| Harmful or diagnostic output | Source prompt, output sanitizer, replacement caution, demo fallback | Subtle false claims or unsafe advice can pass. No clinical evaluation. |
| Prompt injection | User content framed as untrusted; no tools or secrets accessible to model; output guard | The model can still be influenced or produce off-topic text. |
| Cost abuse | Per-identifier rate limits, global live budgets, timeout, max output tokens, `AI_ENABLED` kill switch | Counters are in memory, per process, and reset on restart. |
| Flooding | 64 KB body limit, 2,000-character message limit, auth endpoint limits | No distributed/WAF-level DDoS protection is included. |
| Secret exposure | Server-only env, no browser Supabase client, no provider calls from browser, secret regex tests | Host or proxy misconfiguration can still leak env or logs. |
| Cross-account data access | RLS policies on all user tables, request-scoped clients, owner checks | Must be tested with a real Supabase deployment. Service-role misuse would bypass RLS. |
| Auth abuse | Password minimum 10 chars, sign-in and sign-up rate limits, httpOnly session cookies, redirect sanitisation | No MFA, password-reset flow, or account lockout beyond rate limiting. Email confirmation depends on deployment settings. |
| XSS / clickjacking | Astro origin checks, explicit CSP, no inline style attributes, no `dangerouslySetInnerHTML`, nosniff, `frame-ancestors 'none'`, `X-Frame-Options: DENY` | CSP correctness can regress; browser extensions are outside scope. |
| Unverified business claims | No contact/location fields are configured; prompts forbid inventing Optsam details; visible "pending confirmation" copy | Do not add details without owner verification. |
| Image privacy | No image upload path; `/api/image` refuses every request; status always says disabled | A future implementation needs a separate review. |

## Browser and transport controls

- `checkOrigin: true` in Astro rejects cross-origin non-GET form/API actions.
- Explicit CSP includes `default-src 'self'`, `base-uri 'self'`, `object-src
  'none'`, `frame-ancestors 'none'`, `form-action 'self'`, and `connect-src
  'self'`. There is no third-party analytics or font host.
- `X-Content-Type-Options: nosniff`, `Referrer-Policy:
  strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, a restrictive
  `Permissions-Policy`, COOP, and CORP are set by middleware.
- HSTS is added only when the request is already HTTPS. A TLS-terminating proxy
  must forward the original scheme for this to work.
- The Node adapter limits request bodies to 64 KB.
- API responses use `cache-control: no-store`; chat SSE also sets
  `no-store, no-transform` and disables proxy buffering.
- API errors use generic codes and messages. Chat text and provider bodies are
  not written to application logs.

## Input and redirect handling

- All chat requests use Zod: message 2–2,000 characters, language `en`/`sw`,
  consent must be exactly true, save must be boolean, conversation IDs must be
  UUID-shaped, and history is capped at 8 × 3,000 characters.
- Auth and account payloads are schema-validated.
- Redirect targets must start with a single `/`, cannot start with `//`, cannot
  contain `\`, and are length-limited.
- Conversation title length is constrained again by the database.
- The chat persistence query uses the user-scoped Supabase client, so RLS is the
  final authorization boundary.

## Accounts and row-level security

The migration at `supabase/migrations/0001_initial.sql`:

- Enables RLS on `profiles`, `conversations`, `messages`, and
  `consent_records`.
- Revokes all table privileges from `anon`.
- Grants only scoped operations to `authenticated`.
- Uses `auth.uid() = user_id` or `auth.uid() = id` in policies.
- Requires a message's `conversation_id` to belong to the same user on insert.
- Makes consent records append-only for users.
- Cascades deletion from `auth.users` to profiles, conversations, messages, and
  consent records.

Sessions are handled server-side:

- The browser receives Supabase auth cookies only, marked httpOnly and SameSite
  Lax, with `secure` when the Supabase URL is HTTPS.
- There is no Supabase JS client in the browser bundle.
- The anon key and service-role key remain server-side.
- The service-role client is only used for `auth.admin.deleteUser`. Account
  deletion fails loudly if the key is absent.

## Data inventory and retention

| Data | Where it lives | Retention / control |
| --- | --- | --- |
| Language choice | `askoptsam_lang` cookie | 1 year; not httpOnly because it is a preference; cleared by browser controls. |
| Temporary chat | Browser `sessionStorage` key `askoptsam.chat.session.v1` | Current tab; cleared by New chat or closing the tab. |
| Chat message during a request | Server memory and, in live mode, the configured provider | Not logged by application code; provider retention depends on the reviewed provider. |
| IP-derived rate key | Server memory as an HMAC hash | Sliding windows of 1 minute and 24 hours; raw IP not stored by the app. |
| Saved conversation | Supabase Postgres | Until the user deletes it or the account; requires signed-in user + save consent. |
| Consent record | Supabase Postgres | Append-only; removed on account deletion; includes policy version, not symptom text. |
| Provider keys | Server environment | Never bundled into client code; rotate after suspected exposure. |
| Standard infrastructure logs | Host/proxy | Outside application control; configure retention and avoid request-body logging. |

No advertising trackers, third-party analytics, session replay, or external fonts
are included.

## Consent

The chat consent card states that the assistant is educational and that a message
may be sent to a third-party provider when live AI is enabled. Saving is a
separate explicit choice, available only to signed-in users. A `consent_records`
row is inserted with the policy version when saving is used.

This is product-level notice and consent, not a substitute for a documented legal
basis, DPIA, controller/processor mapping, or local-law review.

## Deployment requirements

- Serve only over HTTPS in public environments.
- Keep `.env` and service-role keys out of source control and build artifacts.
- Set a strong `RATE_LIMIT_SALT`.
- Set `TRUST_PROXY=true` only when a trusted proxy overwrites forwarded headers.
- Configure Supabase Auth redirect URLs precisely; avoid wildcard production URLs.
- Configure SMTP and email verification before taking real registrations.
- Review AI provider terms, retention, training use, and processing locations
  before enabling live mode.
- Use a shared rate-limit/budget store before running more than one instance.
- Back up only what is necessary; define a retention schedule for backups and
  infrastructure logs.

## Known gaps

- No independent security audit or load test.
- No multi-instance rate-limit or budget consistency.
- No automated password reset or MFA.
- No formal CSRF-token scheme beyond origin checks, SameSite cookies, and
  method/route design.
- No data export flow.
- No automated retention job for infrastructure logs or backups.
- No content-security-policy reporting endpoint.
- No live Supabase/RLS or live AI integration test was possible in this
  workspace because credentials were not provided.
- Clinical review and legal review remain launch blockers.
