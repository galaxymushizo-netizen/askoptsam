import type { Lang } from '../../i18n/config';
import { StreamingSanitizer } from '../safety/output-guard';
import { triageSymptoms, type EmergencyGuidance } from '../safety/triage';
import type { Source } from '../sources/registry';
import { selectSources } from '../sources/select';
import { consumeAiBudget } from './budget';
import {
  demoReasonText,
  getAIConfig,
  getRuntimeAIMode,
  providerLabel,
  type DemoReason,
  type ProviderId,
} from './config';
import { demoReply } from './demo';
import { getFollowUps } from './followups';
import { createGeminiProvider } from './gemini';
import { createOpenAICompatibleProvider } from './openai-compatible';
import { ProviderError, errorForThrown, type AIProvider, type ProviderMessage } from './provider';
import { buildSystemPrompt } from './prompt';

export type ChatMode = 'live' | 'demo' | 'safety';

export interface ChatMetaEvent {
  type: 'meta';
  mode: ChatMode;
  providerLabel: string;
  model: string | null;
  demoReason: DemoReason | null;
  demoReasonText: string;
  remaining?: number;
}

export interface ChatTriageEvent {
  type: 'triage';
  guidance: EmergencyGuidance;
}

export interface ChatDeltaEvent {
  type: 'delta';
  text: string;
}

export interface ChatDoneEvent {
  type: 'done';
  text: string;
  sources: Source[];
  usedSourceIndexes: number[];
  followUps: string[];
  cautionApplied: boolean;
  mode: ChatMode;
  providerLabel: string;
  model: string | null;
  demoReason: DemoReason | null;
  triage: EmergencyGuidance | null;
  truncated?: boolean;
  warningCode?: string;
}

export interface ChatErrorEvent {
  type: 'error';
  code: string;
  message: string;
}

export type ChatStreamEvent =
  | ChatMetaEvent
  | ChatTriageEvent
  | ChatDeltaEvent
  | ChatDoneEvent
  | ChatErrorEvent;

export interface StreamChatArgs {
  message: string;
  lang: Lang;
  history?: ProviderMessage[];
  signal?: AbortSignal;
  remaining?: number;
}

function guidanceToText(guidance: EmergencyGuidance, lang: Lang): string {
  const doNotLabel = lang === 'en' ? 'Do not' : 'Usifanye';
  const steps = guidance.steps.map((step, index) => `${index + 1}. ${step}`).join('\n');
  const doNot = guidance.doNot.map((item) => `- ${item}`).join('\n');
  return `${guidance.title}\n\n${guidance.summary}\n\n${steps}\n\n${doNotLabel}:\n${doNot}\n\n${guidance.seekCare}`;
}

function* textChunks(text: string, size = 140): Generator<string> {
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= size) {
      yield remaining;
      return;
    }
    let cut = remaining.lastIndexOf(' ', size);
    if (cut < Math.floor(size * 0.5)) cut = size;
    yield remaining.slice(0, cut);
    remaining = remaining.slice(cut);
  }
}

function buildProvider(provider: ProviderId): AIProvider {
  const config = getAIConfig();
  if (provider === 'gemini') return createGeminiProvider(config);
  if (provider === 'openai-compatible') return createOpenAICompatibleProvider(config);
  throw new ProviderError('bad_request', 'No live provider is configured');
}

async function* streamDemo(args: {
  message: string;
  lang: Lang;
  reason: DemoReason | null;
  remaining?: number;
}): AsyncGenerator<ChatStreamEvent> {
  const demo = demoReply(args.message, args.lang);
  const sanitized = new StreamingSanitizer(demo.sources, args.lang);
  yield {
    type: 'meta',
    mode: 'demo',
    providerLabel: providerLabel('demo'),
    model: null,
    demoReason: args.reason,
    demoReasonText: demoReasonText(args.reason, args.lang),
    remaining: args.remaining,
  };

  let text = '';
  for (const chunk of textChunks(demo.text)) {
    text += sanitized.push(chunk);
  }
  const finished = sanitized.finish();
  text = finished.text;

  if (text) yield { type: 'delta', text };

  yield {
    type: 'done',
    text,
    sources: demo.sources,
    usedSourceIndexes: finished.usedSourceIndexes,
    followUps: demo.followUps,
    cautionApplied: finished.cautionApplied,
    mode: 'demo',
    providerLabel: providerLabel('demo'),
    model: null,
    demoReason: args.reason,
    triage: null,
  };
}

/**
 * Single orchestration point for safety triage, runtime mode selection, demo
 * fallback, live provider streaming, and output sanitisation.
 *
 * The generator yields sanitized deltas only. The endpoint is responsible for
 * SSE framing, rate limits, authentication, budgets at the HTTP layer, and
 * optional persistence.
 */
export async function* streamChat(args: StreamChatArgs): AsyncGenerator<ChatStreamEvent> {
  const lang = args.lang;
  const message = args.message.trim();
  const triage = triageSymptoms(message, lang);

  if (triage.guidance) {
    const text = guidanceToText(triage.guidance, lang);
    yield {
      type: 'meta',
      mode: 'safety',
      providerLabel: 'Deterministic safety rules',
      model: null,
      demoReason: null,
      demoReasonText: '',
      remaining: args.remaining,
    };
    yield { type: 'triage', guidance: triage.guidance };
    yield { type: 'delta', text };
    yield {
      type: 'done',
      text,
      sources: triage.guidance.sources,
      usedSourceIndexes: [],
      followUps: [],
      cautionApplied: false,
      mode: 'safety',
      providerLabel: 'Deterministic safety rules',
      model: null,
      demoReason: null,
      triage: triage.guidance,
    };
    return;
  }

  const runtime = getRuntimeAIMode();
  const selection = selectSources(message, 5);
  const followUps = getFollowUps(selection.topics, lang, 3);

  if (runtime.mode === 'demo') {
    yield* streamDemo({
      message,
      lang,
      reason: runtime.demoReason ?? 'demo_requested',
      remaining: args.remaining,
    });
    return;
  }

  const budget = consumeAiBudget();
  if (!budget.allowed) {
    yield* streamDemo({
      message,
      lang,
      reason: budget.reason === 'daily' ? 'budget_daily' : 'budget_monthly',
      remaining: args.remaining,
    });
    return;
  }

  const config = getAIConfig();
  const liveMeta: ChatMetaEvent = {
    type: 'meta',
    mode: 'live',
    providerLabel: runtime.providerLabel,
    model: runtime.model,
    demoReason: null,
    demoReasonText: '',
    remaining: args.remaining,
  };

  const history = (args.history ?? [])
    .filter(
      (item) =>
        (item.role === 'user' || item.role === 'assistant') &&
        typeof item.content === 'string' &&
        item.content.trim().length > 0,
    )
    .slice(-8)
    .map((item) => ({ role: item.role, content: item.content.slice(0, 3000) }));

  if (history.at(-1)?.role === 'user' && history.at(-1)?.content.trim() === message) {
    history.pop();
  }

  const messages: ProviderMessage[] = [...history, { role: 'user', content: message }];
  const system = buildSystemPrompt(lang, selection.list);
  const sanitizer = new StreamingSanitizer(selection.list, lang);
  let publicText = '';
  let emitted = false;
  let metaSent = false;

  yield liveMeta;
  metaSent = true;

  try {
    const provider = buildProvider(runtime.provider);
    for await (const chunk of provider.stream({
      system,
      messages,
      maxOutputTokens: config.maxOutputTokens,
      timeoutMs: config.timeoutMs,
      signal: args.signal,
    })) {
      const delta = sanitizer.push(chunk);
      if (delta) {
        publicText += delta;
        emitted = true;
        yield { type: 'delta', text: delta };
      }
    }

    const finished = sanitizer.finish();
    publicText = finished.text;

    if (!publicText || publicText.trim().length < 12) {
      // A blocked, empty, or effectively empty response gets the clearly
      // labelled demo fallback rather than a blank screen.
      if (metaSent) {
        yield* streamDemo({
          message,
          lang,
          reason: 'provider_error',
          remaining: args.remaining,
        });
      }
      return;
    }

    yield {
      type: 'done',
      text: publicText,
      sources: selection.list,
      usedSourceIndexes: finished.usedSourceIndexes,
      followUps,
      cautionApplied: finished.cautionApplied,
      mode: 'live',
      providerLabel: runtime.providerLabel,
      model: runtime.model,
      demoReason: null,
      triage: null,
    };
  } catch (error) {
    const providerError = errorForThrown(error);
    const finished = sanitizer.finish();

    if (!emitted && !publicText.trim()) {
      yield* streamDemo({
        message,
        lang,
        reason: 'provider_error',
        remaining: args.remaining,
      });
      return;
    }

    // Some text has already reached the browser. Close with what survived the
    // guard, flag it as truncated, and let the client offer a retry.
    yield {
      type: 'done',
      text: finished.text || publicText.trim(),
      sources: selection.list,
      usedSourceIndexes: finished.usedSourceIndexes,
      followUps,
      cautionApplied: finished.cautionApplied,
      mode: 'live',
      providerLabel: runtime.providerLabel,
      model: runtime.model,
      demoReason: null,
      triage: null,
      truncated: true,
      warningCode: providerError.code,
    };
  }
}
