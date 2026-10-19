import { describe, expect, it } from 'vitest';
import { getSources, sources, sourceById } from '../../src/lib/sources/registry';
import { selectSources } from '../../src/lib/sources/select';

describe('source registry', () => {
  it('has unique ids and safe https URLs', () => {
    const ids = sources.map((source) => source.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const source of sources) {
      expect(source.url.startsWith('https://')).toBe(true);
      expect(source.url).not.toContain('localhost');
      expect(source.keyPoints.length).toBeGreaterThan(0);
      expect(source.topics.length).toBeGreaterThan(0);
      expect(Number.isNaN(Date.parse(source.lastVerified))).toBe(false);
      expect(source.reviewStatus).not.toBe('retired');
    }
  });

  it('resolves sources in the requested order and drops unknown ids', () => {
    const resolved = getSources(['nhs-red-eye', 'missing-source', 'who-blindness']);
    expect(resolved.map((source) => source.id)).toEqual(['nhs-red-eye', 'who-blindness']);
    expect(sourceById.get('nhs-red-eye')?.publisher).toBe('NHS');
  });

  it('selects English screen and itch sources', () => {
    const selection = selectSources('My eyes are dry and itchy when I use a computer');
    expect(selection.topics).toContain('screen');
    expect(selection.topics).toContain('itch');
    expect(selection.list.length).toBeGreaterThan(0);
    expect(selection.list.length).toBeLessThanOrEqual(5);
  });

  it('selects Kiswahili red-eye sources', () => {
    const selection = selectSources('Jicho jekundu na kuwasha');
    expect(selection.topics).toContain('red-eye');
    expect(selection.list.some((source) => source.topics.includes('red-eye'))).toBe(true);
  });

  it('selects retinal sources for flashes and floaters', () => {
    const selection = selectSources('Sudden flashes and floaters in one eye');
    expect(selection.topics).toContain('flashes-floaters');
    expect(selection.list.some((source) => source.topics.includes('flashes-floaters'))).toBe(true);
  });

  it('returns a small general fallback for an unmatched query', () => {
    const selection = selectSources('hello there');
    expect(selection.topics).toEqual(['general']);
    expect(selection.list.length).toBeGreaterThan(0);
    expect(selection.list.map((source) => source.id)).toContain('who-blindness');
  });
});
