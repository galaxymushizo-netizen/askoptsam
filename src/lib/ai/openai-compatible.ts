import {
  errorForThrown,
  mapHttpError,
  parseSSE,
  ProviderError,
  withTimeout,
  type AIProvider,
  type ProviderRequest,
} from './provider';
import type { AIConfig } from './config';

interface OpenAIChunk {
  choices?: Array<{
    delta?: { content?: string | null };
    finish_reason?: string | null;
  }>;
  error?: { message?: string };
}

/**
 * Adapter for any endpoint that implements the OpenAI chat-completions
 * streaming shape (OpenAI, Azure-compatible gateways, vLLM, etc.).
 *
 * The base URL must include the API version prefix where required
 * (for example `https://host/openai/v1`). It is configured server-side only.
 */
export function createOpenAICompatibleProvider(config: AIConfig): AIProvider {
  if (!config.apiKey) throw new ProviderError('auth', 'Provider API key is missing');
  if (!config.baseUrl) throw new ProviderError('bad_request', 'Provider base URL is missing');

  return {
    id: 'openai-compatible',
    async *stream(request: ProviderRequest): AsyncGenerator<string> {
      const endpoint = `${config.baseUrl}/chat/completions`;
      const { signal, cleanup } = withTimeout(request.timeoutMs, request.signal);

      let response: Response;
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${config.apiKey!}`,
          },
          signal,
          body: JSON.stringify({
            model: config.model,
            messages: [
              { role: 'system', content: request.system },
              ...request.messages.map((message) => ({
                role: message.role,
                content: message.content,
              })),
            ],
            stream: true,
            temperature: 0.35,
            max_tokens: request.maxOutputTokens,
          }),
        });
      } catch (error) {
        cleanup();
        throw errorForThrown(error);
      }

      if (!response.ok) {
        cleanup();
        throw mapHttpError(response.status);
      }

      let emitted = false;
      try {
        for await (const data of parseSSE(response.body)) {
          let chunk: OpenAIChunk;
          try {
            chunk = JSON.parse(data) as OpenAIChunk;
          } catch {
            throw new ProviderError('bad_request', 'Provider returned an invalid stream');
          }

          if (chunk.error) {
            throw new ProviderError('unavailable', 'Provider reported a stream error');
          }

          for (const choice of chunk.choices ?? []) {
            const text = choice.delta?.content;
            if (text) {
              emitted = true;
              yield text;
            }
            if (choice.finish_reason === 'content_filter') {
              throw new ProviderError('blocked', 'Provider content filter stopped generation');
            }
          }
        }
        if (!emitted) throw new ProviderError('empty_response');
      } finally {
        cleanup();
      }
    },
  };
}
