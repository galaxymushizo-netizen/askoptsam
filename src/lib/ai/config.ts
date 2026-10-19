import { getBudgetStatus } from './budget';

export type ProviderId = 'demo' | 'gemini' | 'openai-compatible';

export type DemoReason =
  | 'demo_requested'
  | 'kill_switch'
  | 'privacy_not_approved'
  | 'provider_not_configured'
  | 'budget_daily'
  | 'budget_monthly'
  | 'provider_error'
  | 'unsupported_provider';

export interface AIConfig {
  provider: ProviderId;
  enabled: boolean;
  model: string;
  apiKey: string | null;
  baseUrl: string | null;
  maxOutputTokens: number;
  timeoutMs: number;
  privacyApproved: boolean;
  privacyReviewedAt: string | null;
  termsUrl: string | null;
}

export interface RuntimeAIMode {
  mode: 'live' | 'demo';
  provider: ProviderId;
  providerLabel: string;
  model: string | null;
  privacyApproved: boolean;
  demoReason: DemoReason | null;
}

function bool(value: string | undefined): boolean {
  return value === 'true';
}

export function getAIConfig(): AIConfig {
  const rawProvider = (process.env.AI_PROVIDER || 'demo').trim().toLowerCase();
  const provider: ProviderId =
    rawProvider === 'gemini' || rawProvider === 'openai-compatible' || rawProvider === 'demo'
      ? rawProvider
      : 'demo';

  const defaultModel = provider === 'gemini' ? 'gemini-2.5-flash' : '';
  const model = (process.env.AI_MODEL || defaultModel).trim();
  const key =
    provider === 'gemini'
      ? (process.env.GEMINI_API_KEY || '').trim() || null
      : provider === 'openai-compatible'
        ? (process.env.OPENAI_COMPATIBLE_API_KEY || '').trim() || null
        : null;

  return {
    provider,
    enabled: process.env.AI_ENABLED !== 'false',
    model,
    apiKey: key,
    baseUrl: (process.env.OPENAI_COMPATIBLE_BASE_URL || '').trim().replace(/\/+$/, '') || null,
    maxOutputTokens: Math.max(64, Math.min(2000, Number(process.env.AI_MAX_OUTPUT_TOKENS) || 700)),
    timeoutMs: Math.max(5000, Math.min(120_000, Number(process.env.AI_TIMEOUT_MS) || 45_000)),
    privacyApproved:
      bool(process.env.AI_PRIVACY_APPROVED) &&
      Boolean((process.env.AI_PRIVACY_REVIEWED_AT || '').trim()),
    privacyReviewedAt: (process.env.AI_PRIVACY_REVIEWED_AT || '').trim() || null,
    termsUrl: (process.env.AI_PROVIDER_TERMS_URL || '').trim() || null,
  };
}

export function providerLabel(provider: ProviderId): string {
  if (provider === 'gemini') return 'Google Gemini';
  if (provider === 'openai-compatible') return 'OpenAI-compatible provider';
  return 'Demo content (no AI provider)';
}

export function getRuntimeAIMode(): RuntimeAIMode {
  const config = getAIConfig();
  const budget = getBudgetStatus();
  const base = {
    provider: config.provider,
    providerLabel: providerLabel(config.provider),
    model: config.provider === 'demo' ? null : config.model || null,
    privacyApproved: config.privacyApproved,
  };

  if (config.provider === 'demo') {
    return { ...base, mode: 'demo', demoReason: 'demo_requested' };
  }
  if (!config.enabled) {
    return { ...base, mode: 'demo', demoReason: 'kill_switch' };
  }
  if (!config.privacyApproved) {
    return { ...base, mode: 'demo', demoReason: 'privacy_not_approved' };
  }
  if (!config.apiKey || !config.model) {
    return { ...base, mode: 'demo', demoReason: 'provider_not_configured' };
  }
  if (config.provider === 'openai-compatible' && !config.baseUrl) {
    return { ...base, mode: 'demo', demoReason: 'provider_not_configured' };
  }
  if (!budget.allowed) {
    return {
      ...base,
      mode: 'demo',
      demoReason: budget.reason === 'daily' ? 'budget_daily' : 'budget_monthly',
    };
  }
  return { ...base, mode: 'live', demoReason: null };
}

export function demoReasonText(reason: DemoReason | null, lang: 'en' | 'sw'): string {
  const messages = {
    en: {
      demo_requested: 'This deployment is intentionally running in demo mode.',
      kill_switch: 'Live AI has been switched off by the operator.',
      privacy_not_approved:
        'Live AI is disabled until the provider’s handling of sensitive health data is reviewed and recorded.',
      provider_not_configured: 'An AI provider is not fully configured.',
      budget_daily: 'The daily AI request limit has been reached. Demo content is shown instead.',
      budget_monthly:
        'The monthly AI request limit has been reached. Demo content is shown instead.',
      provider_error:
        'The live AI provider did not respond. Demo content is shown instead; your safety guidance still works.',
      unsupported_provider: 'The configured AI provider is not supported.',
    },
    sw: {
      demo_requested: 'Usambazaji huu unaendeshwa kwa hali ya demo kwa makusudi.',
      kill_switch: 'AI hai imezimwa na msimamizi.',
      privacy_not_approved:
        'AI hai imezimwa hadi uchakataji wa mtoa huduma kwa taarifa nyeti za afya upitiwe na kurekodiwa.',
      provider_not_configured: 'Mtoa huduma wa AI hajawekwa kikamilifu.',
      budget_daily:
        'Kikomo cha maombi ya AI cha siku kimefikiwa. Maudhui ya demo yanaonyeshwa badala yake.',
      budget_monthly:
        'Kikomo cha maombi ya AI cha mwezi kimefikiwa. Maudhui ya demo yanaonyeshwa badala yake.',
      provider_error:
        'Mtoa huduma wa AI hai hakujibu. Maudhui ya demo yanaonyeshwa badala yake; mwongozo wako wa usalama bado unafanya kazi.',
      unsupported_provider: 'Mtoa huduma wa AI aliyewekwa hautumiki.',
    },
  } as const;
  return reason ? messages[lang][reason] : '';
}
