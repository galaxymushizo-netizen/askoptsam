import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { streamChat, type ChatStreamEvent } from '../../src/lib/ai/service';
import { resetBudgetForTests } from '../../src/lib/ai/budget';

async function collect(message: string, lang: 'en' | 'sw' = 'en'): Promise<ChatStreamEvent[]> {
  const events: ChatStreamEvent[] = [];
  for await (const event of streamChat({ message, lang })) events.push(event);
  return events;
}

describe('chat orchestration', () => {
  beforeEach(() => {
    vi.stubEnv('AI_PROVIDER', 'demo');
    vi.stubEnv('AI_ENABLED', 'true');
    vi.stubEnv('GEMINI_API_KEY', '');
    vi.stubEnv('OPENAI_COMPATIBLE_API_KEY', '');
    resetBudgetForTests();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetBudgetForTests();
  });

  it('returns deterministic safety guidance before any demo content for red flags', async () => {
    const events = await collect('I got bleach in my eye');
    const meta = events.find(
      (event): event is Extract<ChatStreamEvent, { type: 'meta' }> => event.type === 'meta',
    );
    const triage = events.find(
      (event): event is Extract<ChatStreamEvent, { type: 'triage' }> => event.type === 'triage',
    );
    const done = events.find(
      (event): event is Extract<ChatStreamEvent, { type: 'done' }> => event.type === 'done',
    );

    expect(meta?.mode).toBe('safety');
    expect(triage).toBeDefined();
    expect(done?.mode).toBe('safety');
    expect(done?.sources.length).toBeGreaterThan(0);
    expect(events.some((event) => event.type === 'delta')).toBe(true);
  });

  it('streams clearly labelled demo content when no provider is configured', async () => {
    const events = await collect('My eyes are dry when I use a computer');
    const meta = events.find(
      (event): event is Extract<ChatStreamEvent, { type: 'meta' }> => event.type === 'meta',
    );
    const done = events.find(
      (event): event is Extract<ChatStreamEvent, { type: 'done' }> => event.type === 'done',
    );

    expect(meta?.mode).toBe('demo');
    expect(meta?.demoReason).toBe('demo_requested');
    expect(done?.mode).toBe('demo');
    if (!done) throw new Error('missing done event');
    expect(done.text).toContain('Demo mode');
    expect(done.text).toContain('not a live AI response');
    expect(done.sources.length).toBeGreaterThan(0);
    expect(done.usedSourceIndexes.length).toBeGreaterThan(0);
    expect(done.followUps.length).toBeGreaterThan(0);
  });

  it('answers in Kiswahili without losing the demo label', async () => {
    const events = await collect('Macho yangu yanawasha', 'sw');
    const done = events.find(
      (event): event is Extract<ChatStreamEvent, { type: 'done' }> => event.type === 'done',
    );
    if (!done) throw new Error('missing done event');
    expect(done.mode).toBe('demo');
    expect(done.text).toContain('Hali ya demo');
  });

  it('refuses to use a live provider without a recorded privacy review', async () => {
    vi.stubEnv('AI_PROVIDER', 'gemini');
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    vi.stubEnv('AI_PRIVACY_APPROVED', 'false');
    vi.stubEnv('AI_PRIVACY_REVIEWED_AT', '');

    const events = await collect('My eyes are itchy');
    const meta = events.find(
      (event): event is Extract<ChatStreamEvent, { type: 'meta' }> => event.type === 'meta',
    );
    expect(meta?.mode).toBe('demo');
    expect(meta?.demoReason).toBe('privacy_not_approved');
  });

  it('respects the operator kill switch', async () => {
    vi.stubEnv('AI_PROVIDER', 'gemini');
    vi.stubEnv('GEMINI_API_KEY', 'test-key');
    vi.stubEnv('AI_ENABLED', 'false');
    vi.stubEnv('AI_PRIVACY_APPROVED', 'true');
    vi.stubEnv('AI_PRIVACY_REVIEWED_AT', '2026-10-19');

    const events = await collect('My eyes are itchy');
    const meta = events.find(
      (event): event is Extract<ChatStreamEvent, { type: 'meta' }> => event.type === 'meta',
    );
    expect(meta?.mode).toBe('demo');
    expect(meta?.demoReason).toBe('kill_switch');
  });
});
