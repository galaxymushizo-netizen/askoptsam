# Environment reference

Copy `.env.example` to `.env` for local work. Never commit `.env`. The
standalone production server does not load `.env` by itself; see
[SETUP.md](SETUP.md).

## Build-time versus runtime

| Variable group | Read at | Action after change |
| --- | --- | --- |
| `PUBLIC_SITE_URL` | Build (canonical metadata) and runtime (some redirects) | Rebuild and restart |
| Supabase | Runtime | Restart |
| AI provider and budgets | Runtime | Restart |
| Rate limits | Runtime | Restart |
| `POLICY_VERSION` | Runtime | Restart; also review consent implications |

Set every variable for both build and runtime so the two views cannot disagree.

## Site

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `PUBLIC_SITE_URL` | Production: yes | `http://localhost:4321` | Canonical site URL used by Astro metadata and auth redirect construction. Use the exact public HTTPS origin with no trailing slash. |

## Supabase (optional)

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `SUPABASE_URL` | For accounts | empty | Supabase project URL. Must be HTTPS, except localhost. |
| `SUPABASE_ANON_KEY` | For accounts | empty | Public anon key. Used only by the server client in this MVP. |
| `SUPABASE_SERVICE_ROLE_KEY` | For complete deletion | empty | Bypasses RLS. Server-only. Used only by `auth.admin.deleteUser`. Never expose it to the browser or logs. |

If URL or anon key is missing, accounts are disabled but temporary chat remains
available. The UI and `/api/status` report that accounts are not configured.

Do not use the service-role key for ordinary user-scoped queries. The migration
enables RLS on all user tables and the application uses request-scoped,
cookie-backed clients for normal reads and writes.

## AI provider

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `AI_PROVIDER` | No | `demo` | `demo`, `gemini`, or `openai-compatible`. Unsupported values fall back to demo. |
| `AI_ENABLED` | No | `true` | Set to `false` to force live-capable providers onto demo responses. It is a kill switch, not a way to enable live AI. |
| `AI_MODEL` | Gemini: no; OpenAI-compatible: yes | `gemini-2.5-flash` for Gemini | Provider model identifier. |
| `AI_PRIVACY_APPROVED` | For live AI | `false` | Must be exactly `true`. |
| `AI_PRIVACY_REVIEWED_AT` | For live AI | empty | A real, non-empty review date. Live AI requires both approval variables. |
| `AI_PROVIDER_TERMS_URL` | No | empty | Operator bookkeeping for the provider terms reviewed. Not currently rendered in the UI. |
| `GEMINI_API_KEY` | Gemini: yes | empty | Server-only API key. |
| `OPENAI_COMPATIBLE_BASE_URL` | OpenAI-compatible: yes | empty | API prefix such as `https://provider.example/v1`. The adapter adds `/chat/completions`. |
| `OPENAI_COMPATIBLE_API_KEY` | OpenAI-compatible: yes | empty | Server-only API key. |
| `AI_MAX_OUTPUT_TOKENS` | No | `700` | Clamped to 64–2000. |
| `AI_TIMEOUT_MS` | No | `45000` | Clamped to 5,000–120,000 ms. |
| `AI_DAILY_REQUEST_LIMIT` | No | `300` | Live-provider requests per UTC day, per process. |
| `AI_MONTHLY_REQUEST_LIMIT` | No | `3000` | Live-provider requests per UTC month, per process. |

Live mode requires **all** live gates to pass. See `/status` for the current
non-secret state and a demo reason.

`AI_PRIVACY_APPROVED=true` is not evidence of legal compliance. Record the actual
provider, terms version, data location, retention terms, and reviewer. Provider
policies change; review them again before launch and periodically afterward.

Demo and deterministic safety replies do not consume the live AI budget. A
request to a live provider reserves budget even if the response is later
discarded, truncated, or replaced by a demo fallback.

## Abuse protection

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `RATE_LIMIT_PER_MINUTE` | No | `6` | Per-identifier chat requests per minute. Signed-in users receive a 2× multiplier. |
| `RATE_LIMIT_PER_DAY` | No | `80` | Per-identifier chat requests per rolling 24 hours. Signed-in users receive a 2× multiplier. |
| `RATE_LIMIT_SALT` | Production: strongly recommended | random per process | HMAC secret used to hash IP-derived identifiers. Use at least 32 random characters. If absent, a random value is generated and all counters are lost on restart. |
| `TRUST_PROXY` | No | `false` | Trust `X-Forwarded-For`/`X-Real-IP`. Enable only behind a trusted proxy that overwrites these headers. |

The chat identifier is a salted hash; raw IP addresses are not stored by the
application. Rate-limit counters are held in process memory.

Separate fixed auth limits apply:

- Sign-in: 8 attempts per 15 minutes per IP + email hash.
- Sign-up: 5 attempts per hour per IP hash.

These values are not environment-configurable in the MVP.

## Validation and limits

| Limit | Value |
| --- | --- |
| Chat message | 2–2,000 characters |
| Client-supplied history | up to 8 messages, 3,000 characters each |
| Request body | 64 KB, enforced by the Node adapter |
| Conversation title | 1–120 characters in the database; chat titles truncate to 64 |
| Database message content | 1–12,000 characters |
| Stored history sent back to provider | last 8 messages |

## Policy and consent

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `POLICY_VERSION` | No | `2026-10-19` | Version recorded with saved-history consent and chat metadata. Bump it when consent wording materially changes. |

## Image explanation

There are no image environment flags. Image explanation is intentionally absent
from this MVP:

- `/api/image` refuses every request with HTTP 503 `image_disabled`.
- No upload bytes are read, stored, or forwarded.
- `/status` always reports image explanation as disabled.
- A future implementation needs a real endpoint, storage policy, provider
  review, retention rules, and a separate privacy assessment. Do not add a flag
  that merely makes the UI claim the feature exists.

## Contact details

No contact, location, hours, or emergency phone variables are configured. Do not
add unverified Optsam details. The footer and About page correctly say that
public contact information is pending verification.
