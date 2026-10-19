import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST as chatPOST } from '../../src/pages/api/chat';
import { GET as healthGET } from '../../src/pages/api/health';
import { GET as imageGET, POST as imagePOST } from '../../src/pages/api/image';
import { GET as statusGET } from '../../src/pages/api/status';
import { GET as signinGET, POST as signinPOST } from '../../src/pages/api/auth/signin';
import { resetRateLimitForTests } from '../../src/lib/security/rate-limit';
import { resetBudgetForTests } from '../../src/lib/ai/budget';
import { fakeContext, parseSSE } from '../helpers/context';

async function readSSE(response: Response) {
  const raw = await new Response(response.body).text();
  return { raw, events: parseSSE(raw) };
}

describe('API endpoints', () => {
  beforeEach(() => {
    vi.stubEnv('AI_PROVIDER', 'demo');
    vi.stubEnv('TRUST_PROXY', 'false');
    vi.stubEnv('RATE_LIMIT_PER_MINUTE', '20');
    vi.stubEnv('RATE_LIMIT_PER_DAY', '200');
    vi.stubEnv('SUPABASE_URL', '');
    vi.stubEnv('SUPABASE_ANON_KEY', '');
    resetRateLimitForTests();
    resetBudgetForTests();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetRateLimitForTests();
    resetBudgetForTests();
  });

  it('rejects chat without JSON or consent', async () => {
    const missingJson = await chatPOST(
      fakeContext({ body: undefined, method: 'POST' }),
    );
    expect(missingJson.status).toBe(400);

    const noConsent = await chatPOST(
      fakeContext({
        body: { message: 'My eyes itch', lang: 'en', consent: false },
      }),
    );
    expect(noConsent.status).toBe(422);
    const payload = (await noConsent.json()) as {
      error: { code: string; fields: Array<{ path: string }> };
    };
    expect(payload.error.code).toBe('invalid_input');
    expect(payload.error.fields.map((field) => field.path)).toContain('consent');
  });

  it('requires sign-in before saving a conversation', async () => {
    const response = await chatPOST(
      fakeContext({
        body: { message: 'My eyes itch', lang: 'en', consent: true, save: true },
      }),
    );
    expect(response.status).toBe(401);
  });

  it('streams demo content as SSE with meta, delta, and done events', async () => {
    const response = await chatPOST(
      fakeContext({
        body: {
          message: 'My eyes are dry when I use a computer',
          lang: 'en',
          consent: true,
        },
      }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/event-stream');
    expect(response.headers.get('cache-control')).toContain('no-store');

    const { raw, events } = await readSSE(response);
    expect(raw).toContain('event: meta');
    expect(raw).toContain('event: delta');
    expect(raw).toContain('event: done');

    const meta = events.find((event) => event.event === 'meta')?.data as {
      mode: string;
      demoReason: string;
    };
    expect(meta.mode).toBe('demo');
    expect(meta.demoReason).toBe('demo_requested');

    const done = events.find((event) => event.event === 'done')?.data as {
      text: string;
      sources: unknown[];
    };
    expect(done.text).toContain('Demo mode');
    expect(done.sources.length).toBeGreaterThan(0);
  });

  it('streams deterministic triage for red flags', async () => {
    const response = await chatPOST(
      fakeContext({
        body: {
          message: 'I got bleach in my eye',
          lang: 'en',
          consent: true,
        },
      }),
    );
    expect(response.status).toBe(200);
    const { events } = await readSSE(response);
    const meta = events.find((event) => event.event === 'meta')?.data as {
      mode: string;
    };
    expect(meta.mode).toBe('safety');
    expect(events.some((event) => event.event === 'triage')).toBe(true);
    const done = events.find((event) => event.event === 'done')?.data as {
      mode: string;
      text: string;
    };
    expect(done.mode).toBe('safety');
    expect(done.text).toMatch(/rinse/i);
  });

  it('enforces the chat rate limit', async () => {
    vi.stubEnv('RATE_LIMIT_PER_MINUTE', '1');
    resetRateLimitForTests();

    const makeRequest = () =>
      chatPOST(
        fakeContext({
          body: { message: 'My eyes itch', lang: 'en', consent: true },
          ip: '198.51.100.7',
        }),
      );

    const first = await makeRequest();
    expect(first.status).toBe(200);
    await new Response(first.body).text();

    const second = await makeRequest();
    expect(second.status).toBe(429);
    expect(second.headers.get('retry-after')).toBeTruthy();
  });

  it('refuses image explanation without touching an image', async () => {
    for (const handler of [imageGET, imagePOST]) {
      const response = await handler(fakeContext());
      expect(response.status).toBe(503);
      const payload = (await response.json()) as {
        error: { code: string; message: string };
      };
      expect(payload.error.code).toBe('image_disabled');
      expect(payload.error.message).toContain('No image was received');
    }
  });

  it('reports safe runtime status', async () => {
    const health = await healthGET(fakeContext({ path: 'http://localhost:4321/api/health' }));
    expect(health.status).toBe(200);
    const healthBody = (await health.json()) as { ok: boolean; mode: string };
    expect(healthBody.ok).toBe(true);
    expect(healthBody.mode).toBe('demo');

    const status = await statusGET(fakeContext({ path: 'http://localhost:4321/api/status' }));
    const statusBody = (await status.json()) as {
      mode: string;
      imageExplanation: { enabled: boolean };
      sources: { count: number; clinicalReview: string };
      accountsConfigured: boolean;
    };
    expect(statusBody.mode).toBe('demo');
    expect(statusBody.imageExplanation.enabled).toBe(false);
    expect(statusBody.sources.count).toBeGreaterThan(0);
    expect(statusBody.sources.clinicalReview).toBe('pending');
    expect(statusBody.accountsConfigured).toBe(false);
  });

  it('returns a useful error when accounts are not configured', async () => {
    const response = await signinPOST(
      fakeContext({
        body: { email: 'person@example.com', password: 'long-enough-password' },
      }),
    );
    expect(response.status).toBe(503);
    const payload = (await response.json()) as { error: { code: string } };
    expect(payload.error.code).toBe('accounts_unavailable');

    const getResponse = await signinGET(fakeContext());
    expect(getResponse.status).toBe(405);
  });
});
