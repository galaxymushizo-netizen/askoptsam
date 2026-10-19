import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

interface Bucket {
  hits: number[];
}

interface RateLimitState {
  buckets: Map<string, Bucket>;
  salt: string;
  lastSweep: number;
}

const globalKey = '__askoptsam_rate_limit_state__';
type GlobalWithRateLimit = typeof globalThis & {
  [globalKey]?: RateLimitState;
};

function state(): RateLimitState {
  const globalObject = globalThis as GlobalWithRateLimit;
  if (!globalObject[globalKey]) {
    globalObject[globalKey] = {
      buckets: new Map(),
      salt:
        (process.env.RATE_LIMIT_SALT || '').trim() ||
        randomBytes(32).toString('hex'),
      lastSweep: Date.now(),
    };
  }
  return globalObject[globalKey]!;
}

export function hashIdentifier(value: string): string {
  const s = state();
  return createHmac('sha256', s.salt).update(value).digest('hex').slice(0, 24);
}

export interface LimitRule {
  key: string;
  limit: number;
  windowMs: number;
}

export interface LimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
  /** Most restrictive remaining count for user-facing messaging. */
  remaining: number;
}

function sweep(now: number) {
  const s = state();
  if (now - s.lastSweep < 60_000) return;
  s.lastSweep = now;
  for (const [key, bucket] of s.buckets) {
    const newest = bucket.hits[bucket.hits.length - 1] ?? 0;
    if (newest < now - 24 * 60 * 60 * 1000) s.buckets.delete(key);
  }
}

/**
 * In-memory sliding-window limiter. It is intentionally dependency-free and
 * costs nothing. On multi-instance hosts each instance has its own counters;
 * see README for the production upgrade path (shared Redis/Postgres limiter).
 */
export function checkLimits(rules: LimitRule[]): LimitResult {
  const now = Date.now();
  sweep(now);

  let allowed = true;
  let retryAfterSeconds = 0;
  let remaining = Number.POSITIVE_INFINITY;

  for (const rule of rules) {
    const key = `${rule.key}:${rule.limit}:${rule.windowMs}`;
    const bucket = state().buckets.get(key) ?? { hits: [] };
    bucket.hits = bucket.hits.filter((timestamp) => timestamp > now - rule.windowMs);
    const used = bucket.hits.length;
    const room = Math.max(0, rule.limit - used);
    remaining = Math.min(remaining, room);
    if (used >= rule.limit) {
      allowed = false;
      const oldest = bucket.hits[0] ?? now;
      retryAfterSeconds = Math.max(
        retryAfterSeconds,
        Math.ceil((oldest + rule.windowMs - now) / 1000),
      );
    }
    state().buckets.set(key, bucket);
  }

  if (!allowed) {
    return { allowed, retryAfterSeconds: Math.max(1, retryAfterSeconds), remaining: 0 };
  }

  // Consume only when every rule has room.
  for (const rule of rules) {
    const key = `${rule.key}:${rule.limit}:${rule.windowMs}`;
    const bucket = state().buckets.get(key) ?? { hits: [] };
    bucket.hits.push(now);
    state().buckets.set(key, bucket);
  }

  return {
    allowed,
    retryAfterSeconds: 0,
    // Report the room left *after* this request was consumed, so clients and
    // the chat meta event do not overstate the remaining allowance.
    remaining: Number.isFinite(remaining) ? Math.max(0, remaining - 1) : 0,
  };
}

export function buildLimitRules(identifier: string, multiplier = 1): LimitRule[] {
  const perMinute = positiveInt(process.env.RATE_LIMIT_PER_MINUTE, 6);
  const perDay = positiveInt(process.env.RATE_LIMIT_PER_DAY, 80);
  return [
    {
      key: `min:${identifier}`,
      limit: Math.max(1, Math.round(perMinute * multiplier)),
      windowMs: 60_000,
    },
    {
      key: `day:${identifier}`,
      limit: Math.max(1, Math.round(perDay * multiplier)),
      windowMs: 24 * 60 * 60 * 1000,
    },
  ];
}

export function positiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function resetRateLimitForTests() {
  const globalObject = globalThis as GlobalWithRateLimit;
  delete globalObject[globalKey];
}
