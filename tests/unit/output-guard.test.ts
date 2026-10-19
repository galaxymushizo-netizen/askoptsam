import { describe, expect, it } from 'vitest';
import {
  CAUTION,
  StreamingSanitizer,
  citationsToSources,
  sanitizeModelText,
} from '../../src/lib/safety/output-guard';
import { getSources } from '../../src/lib/sources/registry';

const sources = getSources(['nhs-red-eye', 'nhs-vision-loss', 'aao-eye-exam']);

describe('output guard', () => {
  it('strips links, emails, HTML, and invented citations', () => {
    const result = sanitizeModelText(
      'Call https://example.com or email help@example.com. <script>alert(1)</script> See a clinician [S2] and [S99].',
      sources,
      'en',
    );
    expect(result.text).not.toContain('http');
    expect(result.text).not.toContain('help@example.com');
    expect(result.text).not.toContain('<script');
    expect(result.text).not.toContain('[S99]');
    expect(result.text).toContain('[S2]');
    expect(result.usedSourceIndexes).toEqual([2]);
  });

  it('replaces confident diagnosis claims and appends a caution', () => {
    const result = sanitizeModelText(
      'You definitely have glaucoma. This is common.',
      sources,
      'en',
    );
    expect(result.cautionApplied).toBe(true);
    expect(result.text).not.toMatch(/definitely have/i);
    expect(result.text).toContain(CAUTION.en);
  });

  it('replaces Kiswahili false reassurance', () => {
    const result = sanitizeModelText('Huna tatizo. Pumzika.', sources, 'sw');
    expect(result.cautionApplied).toBe(true);
    expect(result.text).toContain(CAUTION.sw);
    expect(result.text).not.toContain('Huna tatizo');
  });

  it('keeps streaming output safe when a URL is split across chunks', () => {
    const sanitizer = new StreamingSanitizer(sources, 'en');
    let emitted = '';
    for (const chunk of ['See a clinician [S2', ']. Visit https://evil.', 'example now.']) {
      emitted += sanitizer.push(chunk);
    }
    const finished = sanitizer.finish();
    expect(emitted).not.toContain('http');
    expect(finished.text).not.toContain('http');
    expect(finished.text).toContain('[S2]');
    expect(finished.text).toContain('See a clinician');
  });

  it('does not leak a diagnostic claim split across chunks', () => {
    const sanitizer = new StreamingSanitizer(sources, 'en');
    sanitizer.push('You definitely have ');
    sanitizer.push('glaucoma. This needs review.\n');
    const finished = sanitizer.finish();
    expect(finished.text).not.toMatch(/definitely have/i);
    expect(finished.cautionApplied).toBe(true);
    expect(finished.text).toContain(CAUTION.en);
  });

  it('enforces a maximum output length', () => {
    const sanitizer = new StreamingSanitizer(sources, 'en', 40);
    sanitizer.push('A'.repeat(200));
    const finished = sanitizer.finish();
    expect(finished.text.length).toBeLessThanOrEqual(40);
  });

  it('maps citation indexes to sources safely', () => {
    expect(citationsToSources([2, 1, 99], sources)).toEqual([sources[1], sources[0]]);
  });
});
