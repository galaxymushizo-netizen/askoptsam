import type { APIContext } from 'astro';

export interface FakeContextOptions {
  body?: unknown;
  method?: string;
  path?: string;
  ip?: string;
  user?: { id: string; email: string | null } | null;
  headers?: Record<string, string>;
  form?: URLSearchParams;
}

/**
 * Minimal APIContext for exercising route handlers without a running server.
 * Only the fields used by AskOptsam's endpoints are implemented.
 */
export function fakeContext(options: FakeContextOptions = {}): APIContext {
  const url = new URL(options.path ?? 'http://localhost:4321/api/chat');
  const headers = new Headers(options.headers ?? {});
  let body: BodyInit | null = null;

  if (options.form) {
    headers.set('content-type', 'application/x-www-form-urlencoded');
    body = options.form.toString();
  } else if (options.body !== undefined) {
    headers.set('content-type', 'application/json');
    body = JSON.stringify(options.body);
  }

  const request = new Request(url, {
    method: options.method ?? (body ? 'POST' : 'GET'),
    headers,
    body,
  });

  const cookies = {
    get: () => undefined,
    has: () => false,
    set: () => undefined,
    delete: () => undefined,
    headers: function* () {},
    merge: () => undefined,
    consume: function* () {},
  };

  return {
    request,
    url,
    params: {},
    props: {},
    locals: {
      user: options.user ?? null,
      lang: 'en',
      requestId: 'test-request',
    },
    clientAddress: options.ip ?? '203.0.113.9',
    cookies,
    redirect: (path: string) =>
      new Response(null, { status: 302, headers: { location: path } }),
    rewrite: async () => new Response(),
  } as unknown as APIContext;
}

export function parseSSE(raw: string): Array<{ event: string; data: unknown }> {
  return raw
    .split('\n\n')
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const event = block
        .split('\n')
        .find((line) => line.startsWith('event: '))
        ?.slice('event: '.length);
      const data = block
        .split('\n')
        .find((line) => line.startsWith('data: '))
        ?.slice('data: '.length);
      return {
        event: event ?? 'message',
        data: data ? JSON.parse(data) : null,
      };
    });
}
