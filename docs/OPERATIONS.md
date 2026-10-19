# Operations, costs, and launch gates

This document is for the operator of an AskOptsam deployment. It describes the
current MVP honestly: what is tested, what costs money, what is unfinished, and
what must happen before public launch.

## 1. Current status

- Demo mode is the default and is fully usable without external services.
- Deterministic safety triage, demo streaming, output sanitisation, bilingual UI,
  article library, source registry, and refusal paths are implemented.
- Supabase account and history code is implemented but was not exercised against
  a live Supabase project in this workspace.
- Live AI adapters are implemented but were not exercised with real provider keys.
- Image explanation is intentionally not implemented.
- Clinical review is pending.
- Legal review is pending.
- Public contact details are intentionally not configured.

## 2. Cost model

### Demo mode

There is no AI provider cost. Costs are limited to:

- Node hosting.
- Optional Supabase project.
- Domain and TLS.
- Email delivery if accounts with confirmation are enabled.
- Monitoring/backups, if used.

A low-volume internal demo can often run on free tiers. Free tiers are not a
production SLA and may pause, throttle, or delete data. Budget for paid services
before inviting the public.

### Live AI

AskOptsam does not bundle a cost estimator and cannot quote provider prices.
Provider prices change. Calculate:

```text
monthly provider cost =
  live_requests
  × (input_tokens / 1,000,000 × input_price_per_million
     + output_tokens / 1,000,000 × output_price_per_million)
```

Defaults and hard caps:

- Live requests: 300/day and 3,000/month per process.
- Output: at most 700 tokens by default, capped at 2,000.
- Timeout: 45 seconds by default.
- User message: at most 2,000 characters.
- Client history: up to 8 messages × 3,000 characters.
- Source context is added to every live request.

Illustrative arithmetic **only** — not a provider quote:

At 3,000 requests/month, 4,000 input tokens and 700 output tokens per request,
and hypothetical list prices of $0.30/M input and $2.50/M output:

```text
3,000 × (4,000 × 0.30 / 1,000,000 + 700 × 2.50 / 1,000,000)
= 3,000 × (0.0012 + 0.00175)
= $8.85/month
```

Longer conversations, larger source prompts, retries, and provider price changes
increase this. Check the provider's current pricing and billing units yourself.

### Critical cost caveats

- The application budget counts **attempts**, not successful tokens. A blocked,
  failed, truncated, or replaced response may still be billed by the provider.
- The 3,000/month limit is in process memory. Restarting resets it, and multiple
  instances each have their own cap.
- Configure a **provider-side hard spend cap and alerts** as the real financial
  backstop. Do not rely only on application counters.
- Demo and deterministic safety responses do not consume the live AI budget, but
  they are still subject to chat rate limits.

## 3. Monitoring

### Endpoints

- `GET /api/health` — minimal health response for a load balancer.
- `GET /api/status` — intended public operator view; no API keys or raw messages.
- `/status` — human-readable equivalent.

The status view includes:

- runtime mode and provider label;
- demo reason, if any;
- whether provider privacy review is recorded;
- account configuration state;
- image explanation disabled;
- rate limits and current in-memory budget counters;
- source count and clinical-review status.

### What to alert on

- Health check failures.
- Elevated 5xx responses or SSE aborts.
- A sudden drop from live to demo mode.
- Provider authentication, quota, or timeout errors.
- Live AI budget at 70% and 90% of daily/monthly caps.
- Rate-limit 429 spikes.
- Supabase authentication or database failures.
- Unexpected sign-up volume.

Do not send chat message text, full request bodies, cookies, authorization
headers, or API keys to a logging or monitoring vendor. If you add error tracking,
redact aggressively and document it in the privacy notice first.

## 4. Operating procedures

### Force demo mode during an incident

Set `AI_ENABLED=false` and restart the process. Safety guidance and temporary chat
continue without live AI. Confirm `/status` reports demo.

### Suspected key exposure

1. Revoke the provider key immediately.
2. Rotate the Supabase service-role or anon key if implicated.
3. Invalidate sessions if account security is in doubt.
4. Set `AI_ENABLED=false` while investigating.
5. Review proxy/provider logs without copying chat text into tickets.

### Account deletion request

Use the account page. If `SUPABASE_SERVICE_ROLE_KEY` is unavailable, deletion
returns 503. Complete it in Supabase Auth only after verifying the requester out
of band. Deleting the auth user cascades to profiles, conversations, messages, and
consent records.

### Delete saved conversations

The signed-in user can delete a conversation or all saved conversations from the
history/account UI. Verify the user-scoped client is being used; never perform
this with the service-role client.

### Restart behaviour

Restarting clears:

- in-memory rate-limit buckets;
- in-memory daily/monthly AI budgets;
- the generated fallback rate-limit salt, unless `RATE_LIMIT_SALT` is set.

This means a restart during a busy period can temporarily reset limits. Set a
persistent salt and account for this before production.

### Data retention

The MVP has no scheduled retention job. Define periods for:

- saved conversations and messages (until user deletion or account deletion);
- consent records;
- infrastructure/proxy logs;
- provider-side data;
- backups.

Do not collect data you do not need.

## 5. Launch gates

Public launch should remain blocked until all of these are true.

### Clinical safety

- [ ] A licensed optometrist or ophthalmologist has reviewed all 10 articles,
      both languages, triage copy, warning-sign copy, and AI prompt constraints.
- [ ] The reviewer has tested red-flag coverage and false-negative scenarios.
- [ ] Clinical review status and reviewer are recorded in the repository or
      release record.
- [ ] The product clearly remains educational and cannot be mistaken for a
      diagnosis or emergency service.

See [CONTENT-REVIEW.md](CONTENT-REVIEW.md).

### Legal, privacy, and consent

- [ ] Tanzanian/East African counsel has reviewed privacy, terms, medical
      disclaimer, consent wording, and data flows.
- [ ] Controller/processor roles and lawful basis are documented.
- [ ] Cross-border AI processing and provider terms are assessed.
- [ ] Retention, deletion, data-subject requests, and incident response are
      documented.
- [ ] No unverified Optsam details are published.
- [ ] A real contact channel for privacy and safety issues is confirmed.

### Security

- [ ] Production HTTPS and reverse proxy are configured.
- [ ] `TRUST_PROXY` matches the proxy.
- [ ] `RATE_LIMIT_SALT` is strong and persistent.
- [ ] A trusted proxy overwrites `X-Forwarded-For`.
- [ ] The CSP and headers are checked in the deployed environment.
- [ ] Two-account Supabase RLS tests pass.
- [ ] Account deletion passes with the service-role key configured.
- [ ] Provider-side spend cap and alerts are active.
- [ ] Secrets are stored only in the hosting secret manager.
- [ ] An independent security review or penetration test is completed if the
      launch risk warrants it.

### Accounts

- [ ] SMTP/email confirmation is configured for production.
- [ ] Email templates and sender identity are reviewed.
- [ ] Sign-in, sign-up, sign-out, callback, save, history, and deletion are tested
      end to end.
- [ ] Password reset is either implemented or the limitation is made explicit.

### AI provider

- [ ] Provider privacy review is recorded.
- [ ] `AI_PRIVACY_APPROVED=true` and `AI_PRIVACY_REVIEWED_AT` reflect a real review.
- [ ] A live test confirms provider streaming and failure fallback.
- [ ] A red-flag test confirms the provider is not called for emergencies.
- [ ] Output guard behaviour is sampled in both languages.

### Image explanation

- [ ] Remains disabled, or a fully reviewed image pipeline is implemented.
- [ ] No UI, marketing, or documentation claims image analysis in this MVP.

## 6. Unfinished integrations and known gaps

- **Contact details and location**: intentionally absent. Owner verification is
  still required. Do not restore candidate data from old notes.
- **Image explanation**: no upload, storage, analysis, or provider pipeline.
- **Appointments, WhatsApp, payments, and clinic booking**: not implemented.
- **Password reset**: not implemented.
- **Multi-instance rate limits/budgets**: not implemented.
- **Shared/distributed cache or queue**: not used.
- **Live Supabase integration test**: blocked in this workspace by missing
  credentials.
- **Live AI integration test**: blocked in this workspace by missing credentials
  and by the intentional privacy gate.
- **Clinical review**: pending.
- **Legal review**: pending.
- **Data export**: not implemented.
- **Automated retention**: not implemented.
- **Observability vendor**: none configured.
- **Accessibility audit with assistive technology**: not yet performed; a manual
  visual pass is not a substitute.
- **Load and soak testing**: not performed.
- **Offline and older-browser support**: not guaranteed.

## 7. Verification record

Update this section after each release. Use the actual commands and results.

| Check | Command | Last result |
| --- | --- | --- |
| Type/Astro diagnostics | `npm run check` | 0 errors, 0 warnings, 0 hints |
| Unit tests | `npm test` | Run before release |
| Production smoke | `npm run build; npm run smoke` | 12/12 checks |
| Source structure | `npm run verify:sources` | 22 sources, 43 article references |
| Browser tests | `npm run test:e2e` | 16 tests, requires Chromium |
| Visual review | Manual desktop/mobile screenshots | Home, chat, learn, article, warning signs, about, status, sources, privacy, 404 reviewed |
| Live Supabase | Manual, credentialed | **Not run** |
| Live AI provider | Manual, credentialed | **Not run** |

`npm run verify:sources -- --network` also fetches URLs. The structural check does
not prove clinical accuracy, and a successful HTTP response does not imply
endorsement.

## 8. Support boundaries

AskOptsam cannot:

- diagnose or rule out a condition;
- confirm that a symptom is harmless;
- prescribe or adjust medicine;
- replace an eye examination;
- handle an emergency;
- book an appointment or provide verified clinic hours;
- analyse a photo.

Support responses should direct clinical questions to an appropriate local
professional or emergency service, and privacy/security reports to the verified
operator contact once one exists.
