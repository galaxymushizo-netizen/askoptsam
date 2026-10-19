# AskOptsam

Bilingual (English / Kiswahili) eye-health information for Optsam Eye Care, built with Astro and TypeScript.

> **Status: pre-launch MVP.** Demo mode is the default. The product has not been
> clinically validated, legally reviewed, or independently security-tested. It is
> not a medical device, a diagnostic service, or an emergency service. Do not
> promote it as any of those things until the launch gates in
> [docs/OPERATIONS.md](docs/OPERATIONS.md) are complete.

## What this MVP does

- Answers general eye-health questions in English or Kiswahili.
- Runs deterministic red-flag triage **before** any AI provider is called.
- Returns urgent-care guidance for chemical exposure, sudden vision loss, severe
  pain, penetrating injury, and other emergency patterns.
- Clearly labels every demo reply. Demo mode does not call an AI provider.
- Supports a curated 10-article education library with 22 linked sources.
- Optionally supports Supabase accounts, saved conversations, consent records,
  and account deletion.
- Keeps temporary chat working without an account.
- Refuses all image upload and image-analysis requests by design.
- Publishes its runtime mode, provider privacy review, rate limits, source count,
  and clinical-review status at `/status`.
- Ships privacy, terms, medical-disclaimer, and warning-signs pages as review
  drafts, not finished legal advice.

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Astro 7, server output |
| Language | TypeScript |
| Interactive UI | Preact islands |
| Styling | Custom CSS design system |
| Node adapter | `@astrojs/node` standalone |
| Validation | Zod |
| Accounts | Supabase Auth + PostgreSQL (optional) |
| Tests | Vitest + Playwright |
| AI providers | Demo, Google Gemini, or an OpenAI-compatible endpoint |

## Quick start

Requirements:

- Node.js **22.22.0 or newer** (this workspace was verified on Node 24).
- npm (the repository includes `package-lock.json`).

```powershell
cd askoptsam
npm ci
Copy-Item .env.example .env
npm run dev
```

Open <http://localhost:4321>.

The app works without Supabase or an AI key. In that configuration it runs in
clearly labelled demo mode, temporary chat works, and account links explain that
accounts are not configured. Do not describe demo content as live AI.

### First useful commands

```powershell
npm run check          # Astro + TypeScript diagnostics
npm test               # Vitest unit and contract tests
npx playwright install chromium
npm run test:e2e       # Build, start preview, run Playwright
npm run build          # Production build
npm run smoke          # Production smoke test; run after build
npm run verify:sources # Source registry integrity check
```

`npm run test:e2e` performs the build itself, then Playwright starts only the
preview server. `npm run smoke` starts its own standalone server on port 4331.

## Runtime modes

AskOptsam has three visible modes:

| Mode | When it is used | Provider call? | Label in UI |
| --- | --- | --- | --- |
| `safety` | Deterministic triage matches a red flag | No | Safety guidance |
| `demo` | Default, kill switch, missing provider, privacy review not recorded, or AI budget exhausted | No | Demo content |
| `live` | All live-AI gates pass | Yes | Configured provider name |

Live AI requires **all** of the following:

1. `AI_PROVIDER` is `gemini` or `openai-compatible`.
2. `AI_ENABLED` is not `false`.
3. `AI_PRIVACY_APPROVED=true`.
4. `AI_PRIVACY_REVIEWED_AT` contains a real review date.
5. The provider key, model, and (for OpenAI-compatible endpoints) base URL are set.
6. The deployment is under its daily and monthly live-request budgets.

If a provider fails or returns an unusable stream, the app falls back to a
clearly labelled demo response. A partially streamed response that fails is
closed as truncated and exposed with a retry path.

## Request flow

1. Browser sends a JSON request with validated message, language, and consent.
2. The endpoint applies rate limits and validates input.
3. Deterministic triage checks for red flags. A match returns safety guidance and
   never calls an AI provider.
4. Otherwise the source selector chooses up to five relevant sources.
5. In demo mode, a pre-written, labelled response streams over SSE.
6. In live mode, the provider streams a response using the server-only prompt.
7. The streaming output guard checks citations, strips links and markup, and
   applies diagnosis/reassurance guards before text reaches the browser.
8. If the user is signed in and explicitly opted in, the conversation and an
   append-only consent record are saved.

## Project layout

```text
askoptsam/
├─ src/
│  ├─ components/         # Astro shells and Preact islands
│  ├─ config/             # Brand and feature constants
│  ├─ content/            # Legal/content drafts
│  ├─ data/               # Articles and topics
│  ├─ i18n/               # English/Kiswahili UI dictionary
│  ├─ layouts/
│  ├─ lib/
│  │  ├─ ai/              # Mode selection, providers, prompt, budgets
│  │  ├─ safety/          # Deterministic triage and output guard
│  │  ├─ security/        # In-memory rate limits
│  │  ├─ sources/         # Source registry and selection
│  │  └─ supabase/        # Server-only Supabase clients
│  ├─ pages/              # Pages and API routes
│  ├─ styles/
│  └─ middleware.ts       # Request ID, language, session, security headers
├─ supabase/
│  ├─ migrations/         # RLS schema
│  └─ README.md
├─ tests/
│  ├─ unit/
│  └─ e2e/
├─ scripts/
│  ├─ smoke.mjs
│  └─ verify-sources.mjs
├─ docs/
├─ .env.example
└─ playwright.config.ts
```

## Documentation

- [Local setup and deployment](docs/SETUP.md)
- [Environment variable reference](docs/CONFIGURATION.md)
- [Security and privacy design](docs/SECURITY.md)
- [Operations, costs, and launch gates](docs/OPERATIONS.md)
- [Clinical and editorial review](docs/CONTENT-REVIEW.md)
- [Supabase setup](supabase/README.md)

## Important limitations

- **Clinical review is pending** for all articles and safety copy.
- **Legal review is pending** for privacy, terms, and medical-disclaimer drafts.
- **No live Supabase deployment or live AI provider was exercised in this
  workspace.** The code paths exist but need credential-backed integration tests.
- **Rate limits and AI budgets are in memory.** They reset on restart and are not
  shared between multiple instances.
- **Image explanation is not implemented.** `/api/image` always refuses requests.
- **No password-reset flow** is implemented.
- **Account deletion requires** a server-only Supabase service-role key.
- **Contact details, addresses, hours, and emergency phone numbers are not
  configured.** Pending Optsam details must not be published without written
  verification.
- **No claim of regulatory compliance** (including health-data or data-protection
  compliance) is made.

## Data-handling summary

- Temporary conversations are kept in browser `sessionStorage` for the current tab.
- Questions are sent to the configured AI provider only in live mode and only
  after provider privacy review is recorded.
- Saved conversations require an account, explicit save consent, and Supabase.
- The app does not include advertising trackers or third-party analytics.
- A short-lived, salted hash derived from the IP address is used for rate limiting.
- Server code does not log chat message text.

See [docs/SECURITY.md](docs/SECURITY.md) for the full model and residual risks.

## Contact and affiliation

AskOptsam is presented as a product associated with Optsam Eye Care. No medical
credentials, staff details, appointments, prices, opening hours, locations, or
phone numbers are claimed or displayed. Public contact details remain pending
verification by the business owner.

## Tests

The test suite covers deterministic triage, output sanitisation, demo labelling,
source selection, rate limits, request schemas, service orchestration, API
guardrails, RLS migration structure, image refusal, bilingual content, and the
main browser flows. See [docs/OPERATIONS.md](docs/OPERATIONS.md) for the exact
commands and what is not covered.
