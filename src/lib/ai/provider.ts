export interface ProviderMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ProviderRequest {
  system: string;
  messages: ProviderMessage[];
  maxOutputTokens: number;
  timeoutMs: number;
  signal?: AbortSignal;
}

export interface AIProvider {
  id: 'gemini' | 'openai-compatible';
  stream(request: ProviderRequest): AsyncGenerator<string>;
}

export class ProviderError extends Error {
  readonly code:
    | 'auth'
    | 'rate_limited'
    | 'bad_request'
    | 'unavailable'
    | 'timeout'
    | 'blocked'
    | 'empty_response'
    | 'network';

  constructor(code: ProviderError['code'], message = 'AI provider request failed') {
    super(message);
    this.name = 'ProviderError';
    this.code = code;
  }
}

/** Creates an abort signal that respects both a timeout and the caller signal. */
export function withTimeout(
  timeoutMs: number,
  callerSignal?: AbortSignal,
): { signal: AbortSignal; cleanup: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error('timeout')), timeoutMs);
  const onAbort = () => controller.abort(callerSignal?.reason);
  if (callerSignal) {
    if (callerSignal.aborted) controller.abort(callerSignal.reason);
    else callerSignal.addEventListener('abort', onAbort, { once: true });
  }
  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timer);
      callerSignal?.removeEventListener('abort', onAbort);
    },
  };
}

export function mapHttpError(status: number): ProviderError {
  if (status === 401 || status === 403) return new ProviderError('auth');
  if (status === 429) return new ProviderError('rate_limited');
  if (status === 400 || status === 404 || status === 422) return new ProviderError('bad_request');
  if (status >= 500) return new ProviderError('unavailable');
  return new ProviderError('bad_request');
}

export function errorForThrown(error: unknown): ProviderError {
  if (error instanceof ProviderError) return error;
  if (error instanceof Error && error.name === 'AbortError') return new ProviderError('timeout');
  return new ProviderError('network');
}

/** Parses an SSE byte stream into JSON data payloads. Never logs payloads. */
export async function* parseSSE(
  body: ReadableStream<Uint8Array> | null,
): AsyncGenerator<string> {
  if (!body) return;
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      buffer = buffer.replace(/\r\n/g, '\n');
      let boundary = buffer.indexOf('\n\n');
      while (boundary !== -1) {
        const block = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        const dataLines = block
          .split('\n')
          .filter((line) => line.startsWith('data:'))
          .map((line) => line.slice(5).trimStart());
        if (dataLines.length > 0) {
          const data = dataLines.join('\n');
          if (data && data !== '[DONE]') yield data;
          if (data === '[DONE]') return;
        }
        boundary = buffer.indexOf('\n\n');
      }
    }
    const tail = buffer.trim();
    if (tail.startsWith('data:')) {
      const data = tail.slice(5).trim();
      if (data && data !== '[DONE]') yield data;
    }
  } finally {
    reader.releaseLock();
  }
}
