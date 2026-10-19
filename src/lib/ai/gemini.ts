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

interface GeminiPart {
  text?: string;
}

interface GeminiCandidate {
  content?: { parts?: GeminiPart[] };
  finishReason?: string;
}

interface GeminiChunk {
  candidates?: GeminiCandidate[];
  promptFeedback?: {
    blockReason?: string;
  };
}

/**
 * Google Gemini streaming adapter.
 *
 * The API key is supplied by the server only. Request bodies and model replies
 * are never logged by this module.
 */
export function createGeminiProvider(config: AIConfig): AIProvider {
  if (!config.apiKey) throw new ProviderError('auth', 'Gemini API key is missing');

  return {
    id: 'gemini',
    async *stream(request: ProviderRequest): AsyncGenerator<string> {
      const endpoint =
        `https://generativelanguage.googleapis.com/v1beta/models/` +
        `${encodeURIComponent(config.model)}:streamGenerateContent?alt=sse&key=` +
        encodeURIComponent(config.apiKey!);

      const { signal, cleanup } = withTimeout(request.timeoutMs, request.signal);
      let response: Response;
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          signal,
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: request.system }] },
            contents: request.messages.map((message) => ({
              role: message.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: message.content }],
            })),
            generationConfig: {
              temperature: 0.35,
              topP: 0.9,
              maxOutputTokens: request.maxOutputTokens,
            },
            safetySettings: [
              { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
              { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
              { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
              { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
            ],
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
          let chunk: GeminiChunk;
          try {
            chunk = JSON.parse(data) as GeminiChunk;
          } catch {
            throw new ProviderError('bad_request', 'Gemini returned an invalid stream');
          }

          if (chunk.promptFeedback?.blockReason) {
            throw new ProviderError('blocked', 'Gemini blocked the request');
          }

          for (const candidate of chunk.candidates ?? []) {
            for (const part of candidate.content?.parts ?? []) {
              if (part.text) {
                emitted = true;
                yield part.text;
              }
            }
            const finish = candidate.finishReason;
            if (finish === 'SAFETY' || finish === 'RECITATION' || finish === 'PROHIBITED_CONTENT') {
              throw new ProviderError('blocked', `Gemini stopped generation (${finish})`);
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
