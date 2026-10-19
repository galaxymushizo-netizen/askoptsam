import type { APIRoute } from 'astro';
import { getBudgetStatus } from '../../lib/ai/budget';
import { getAIConfig, getRuntimeAIMode } from '../../lib/ai/config';
import { features } from '../../config/brand';
import { registryMeta, sources } from '../../lib/sources/registry';
import { isSupabaseConfigured } from '../../lib/supabase/server';
import { positiveInt } from '../../lib/security/rate-limit';
import { jsonResponse } from '../../lib/http/api';

export const prerender = false;

export const GET: APIRoute = async () => {
  const config = getAIConfig();
  const mode = getRuntimeAIMode();
  const budget = getBudgetStatus();

  return jsonResponse({
    ok: true,
    mode: mode.mode,
    provider: mode.provider,
    providerLabel: mode.providerLabel,
    model: mode.model,
    demoReason: mode.demoReason,
    privacyApproved: config.privacyApproved,
    privacyReviewedAt: config.privacyReviewedAt,
    accountsConfigured: isSupabaseConfigured(),
    imageExplanation: {
      enabled: features.imageExplanation,
      reason: 'disabled_by_design',
    },
    limits: {
      perMinute: positiveInt(process.env.RATE_LIMIT_PER_MINUTE, 6),
      perDay: positiveInt(process.env.RATE_LIMIT_PER_DAY, 80),
      dailyAiRequests: budget.dailyLimit,
      monthlyAiRequests: budget.monthlyLimit,
      dailyAiUsed: budget.dailyUsed,
      monthlyAiUsed: budget.monthlyUsed,
    },
    sources: {
      count: sources.length,
      lastFullReview: registryMeta.lastFullReview,
      clinicalReview: 'pending',
    },
  });
};
