import { describe, expect, it } from 'vitest';
import { demoReply } from '../../src/lib/ai/demo';

describe('demo replies', () => {
  it('is clearly labelled as pre-written content in English', () => {
    const reply = demoReply('My eyes are dry when I use a computer', 'en');
    expect(reply.text).toContain('Demo mode');
    expect(reply.text).toContain('not a live AI response');
    expect(reply.text).toContain('No message was sent to an AI provider');
    expect(reply.sources.length).toBeGreaterThan(0);
    expect(reply.followUps.length).toBeGreaterThan(0);
  });

  it('is clearly labelled in Kiswahili', () => {
    const reply = demoReply('Macho yangu ni kavu ninapotumia kompyuta', 'sw');
    expect(reply.text).toContain('Hali ya demo');
    expect(reply.text).toContain('si jibu la AI hai');
    expect(reply.sources.length).toBeGreaterThan(0);
    expect(reply.followUps.length).toBeGreaterThan(0);
  });

  it('only cites sources that exist in the reply', () => {
    for (const lang of ['en', 'sw'] as const) {
      const reply = demoReply('red itchy eyes from allergies', lang);
      const citations = [...reply.text.matchAll(/\[S(\d+)\]/g)].map((match) =>
        Number(match[1]),
      );
      expect(citations.length).toBeGreaterThan(0);
      for (const citation of citations) {
        expect(citation).toBeGreaterThanOrEqual(1);
        expect(citation).toBeLessThanOrEqual(reply.sources.length);
      }
      expect(reply.text).not.toMatch(/https?:\/\//);
    }
  });

  it('is deterministic for the same query', () => {
    const first = demoReply('contact lens pain', 'en');
    const second = demoReply('contact lens pain', 'en');
    expect(first.text).toBe(second.text);
    expect(first.sources.map((source) => source.id)).toEqual(
      second.sources.map((source) => source.id),
    );
  });
});
