import { positiveInt } from '../security/rate-limit';

interface BudgetState {
  dayKey: string;
  monthKey: string;
  dayCount: number;
  monthCount: number;
}

const globalKey = '__askoptsam_ai_budget__';
type GlobalWithBudget = typeof globalThis & {
  [globalKey]?: BudgetState;
};

function utcDayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function utcMonthKey(date = new Date()): string {
  return date.toISOString().slice(0, 7);
}

function state(): BudgetState {
  const globalObject = globalThis as GlobalWithBudget;
  const dayKey = utcDayKey();
  const monthKey = utcMonthKey();
  const existing = globalObject[globalKey];
  if (!existing) {
    const fresh: BudgetState = { dayKey, monthKey, dayCount: 0, monthCount: 0 };
    globalObject[globalKey] = fresh;
    return fresh;
  }
  if (existing.dayKey !== dayKey) {
    existing.dayKey = dayKey;
    existing.dayCount = 0;
  }
  if (existing.monthKey !== monthKey) {
    existing.monthKey = monthKey;
    existing.monthCount = 0;
  }
  return existing;
}

export interface BudgetStatus {
  dailyLimit: number;
  monthlyLimit: number;
  dailyUsed: number;
  monthlyUsed: number;
  allowed: boolean;
  reason: 'daily' | 'monthly' | null;
}

export function getBudgetStatus(): BudgetStatus {
  const s = state();
  const dailyLimit = positiveInt(process.env.AI_DAILY_REQUEST_LIMIT, 300);
  const monthlyLimit = positiveInt(process.env.AI_MONTHLY_REQUEST_LIMIT, 3000);
  if (s.dayCount >= dailyLimit) {
    return {
      dailyLimit,
      monthlyLimit,
      dailyUsed: s.dayCount,
      monthlyUsed: s.monthCount,
      allowed: false,
      reason: 'daily',
    };
  }
  if (s.monthCount >= monthlyLimit) {
    return {
      dailyLimit,
      monthlyLimit,
      dailyUsed: s.dayCount,
      monthlyUsed: s.monthCount,
      allowed: false,
      reason: 'monthly',
    };
  }
  return {
    dailyLimit,
    monthlyLimit,
    dailyUsed: s.dayCount,
    monthlyUsed: s.monthCount,
    allowed: true,
    reason: null,
  };
}

/** Reserve one live AI request. Demo and triage responses do not consume budget. */
export function consumeAiBudget(): { allowed: boolean; reason: 'daily' | 'monthly' | null } {
  const current = getBudgetStatus();
  if (!current.allowed) return { allowed: false, reason: current.reason };
  const s = state();
  s.dayCount += 1;
  s.monthCount += 1;
  return { allowed: true, reason: null };
}

export function resetBudgetForTests() {
  const globalObject = globalThis as GlobalWithBudget;
  delete globalObject[globalKey];
}
