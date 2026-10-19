import { describe, expect, it } from 'vitest';
import { triageSymptoms } from '../../src/lib/safety/triage';

describe('deterministic safety triage', () => {
  it('treats chemical exposure in English as an emergency', () => {
    const result = triageSymptoms('I got bleach in my eye', 'en');
    expect(result.severity).toBe('emergency');
    expect(result.categories).toContain('chemical');
    expect(result.guidance?.title).toMatch(/rinse/i);
    expect(result.guidance?.steps.join(' ')).toMatch(/15/);
    expect(result.guidance?.sources.length).toBeGreaterThan(0);
  });

  it('treats chemical exposure in Kiswahili as an emergency', () => {
    const result = triageSymptoms('Nimemwagwa asidi jichoni', 'sw');
    expect(result.severity).toBe('emergency');
    expect(result.categories).toContain('chemical');
    expect(result.guidance?.title).toMatch(/Safisha jicho/);
  });

  it('treats sudden vision loss as an emergency', () => {
    const result = triageSymptoms('I suddenly lost vision in my left eye', 'en');
    expect(result.severity).toBe('emergency');
    expect(result.categories).toContain('sudden-vision-loss');
  });

  it('treats severe eye pain in Kiswahili as an emergency', () => {
    const result = triageSymptoms('Nina maumivu makali jichoni', 'sw');
    expect(result.severity).toBe('emergency');
    expect(result.categories).toContain('severe-pain');
    expect(result.guidance?.label).toBeTruthy();
  });

  it('treats flashes with new floaters as an emergency retinal warning', () => {
    const result = triageSymptoms('I saw flashing lights and new floaters', 'en');
    expect(result.severity).toBe('emergency');
    expect(result.categories).toContain('retinal-warning');
  });

  it('routes painful red eye to urgent care rather than the model', () => {
    const result = triageSymptoms('I have a red eye and pain', 'en');
    expect(result.severity).toBe('urgent');
    expect(result.categories).toContain('painful-red-eye-vision-change');
  });

  it('detects a foreign body as urgent', () => {
    const result = triageSymptoms('Something is in my eye', 'en');
    expect(result.severity).toBe('urgent');
    expect(result.categories).toContain('foreign-body');
  });

  it('detects a newborn red eye as urgent', () => {
    const result = triageSymptoms('My baby has a red eye', 'en');
    expect(result.severity).toBe('urgent');
    expect(result.categories).toContain('newborn-red-eye');
  });

  it('does not treat an explicit educational hypothetical as a live emergency', () => {
    const result = triageSymptoms('What should I do if acid gets in my eye?', 'en');
    expect(result.severity).toBe('none');
    expect(result.guidance).toBeNull();
  });

  it('respects negation', () => {
    const result = triageSymptoms('My eye does not hurt', 'en');
    expect(result.severity).toBe('none');
  });

  it('catches common misspellings of sudden vision loss', () => {
    const result = triageSymptoms('I suddently lost vison in one eye', 'en');
    expect(result.severity).toBe('emergency');
    expect(result.categories).toContain('sudden-vision-loss');
  });

  it('handles empty input safely', () => {
    const result = triageSymptoms('   ', 'en');
    expect(result.severity).toBe('none');
    expect(result.categories).toEqual([]);
  });
});
