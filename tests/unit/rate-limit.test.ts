import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildLimitRules,
  checkLimits,
  hashIdentifier,
  positiveInt,
  resetRateLimitForTests,
  safeEqual,
} from '../../src/lib/security/rate-limit';

describe('rate limiting', () => {
  beforeEach(() => {
    vi.stubEnv('RATE_LIMIT_PER_MINUTE', '2');
    vi.stubEnv('RATE_LIMIT_PER_DAY', '5');
    vi.stubEnv('RATE_LIMIT_SALT', 'test-salt');
    resetRateLimitForTests();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetRateLimitForTests();
  });

  it('allows requests up to the limit and then blocks', () => {
    const rules = buildLimitRules('ip:test');
    expect(checkLimits(rules)).toMatchObject({ allowed: true, remaining: 1 });
    expect(checkLimits(rules)).toMatchObject({ allowed: true, remaining: 0 });
    const blocked = checkLimits(rules);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('gives signed-in users a higher multiplier', () => {
    const rules = buildLimitRules('user:test', 2);
    expect(rules[0]?.limit).toBe(4);
    expect(rules[1]?.limit).toBe(10);
  });

  it('hashes identifiers without storing the raw value', () => {
    const hashed = hashIdentifier('ip:192.0.2.10');
    expect(hashed).not.toContain('192.0.2.10');
    expect(hashed).toHaveLength(24);
    expect(hashIdentifier('ip:192.0.2.10')).toBe(hashed);
    expect(hashIdentifier('ip:192.0.2.11')).not.toBe(hashed);
  });

  it('parses positive integers safely and compares secrets', () => {
    expect(positiveInt('12', 5)).toBe(12);
    expect(positiveInt('-2', 5)).toBe(5);
    expect(positiveInt('nope', 5)).toBe(5);
    expect(safeEqual('abc', 'abc')).toBe(true);
    expect(safeEqual('abc', 'abd')).toBe(false);
  });
});
