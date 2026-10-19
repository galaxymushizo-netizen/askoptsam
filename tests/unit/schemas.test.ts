import { describe, expect, it } from 'vitest';
import {
  UUID_RE,
  chatRequestSchema,
  conversationPatchSchema,
  deleteAccountSchema,
  safeRedirectPath,
  signInSchema,
  signUpSchema,
} from '../../src/lib/http/api';

const conversationId = '123e4567-e89b-42d3-a456-426614174000';

describe('request schemas', () => {
  it('accepts a valid chat request and applies defaults', () => {
    const parsed = chatRequestSchema.parse({
      message: 'My eyes are itchy',
      lang: 'en',
      consent: true,
    });
    expect(parsed.save).toBe(false);
    expect(parsed.conversationId).toBeNull();
    expect(parsed.history).toEqual([]);
  });

  it('requires explicit consent', () => {
    const result = chatRequestSchema.safeParse({
      message: 'My eyes are itchy',
      lang: 'en',
      consent: false,
    });
    expect(result.success).toBe(false);
  });

  it('rejects unsupported languages, short messages, and invalid ids', () => {
    expect(
      chatRequestSchema.safeParse({ message: '  ', lang: 'en', consent: true }).success,
    ).toBe(false);
    expect(
      chatRequestSchema.safeParse({ message: 'hello', lang: 'fr', consent: true }).success,
    ).toBe(false);
    expect(
      chatRequestSchema.safeParse({
        message: 'hello',
        lang: 'en',
        consent: true,
        conversationId: 'not-a-uuid',
      }).success,
    ).toBe(false);
  });

  it('caps conversation history at eight messages', () => {
    const history = Array.from({ length: 9 }, (_, index) => ({
      role: index % 2 === 0 ? ('user' as const) : ('assistant' as const),
      content: `message ${index}`,
    }));
    expect(
      chatRequestSchema.safeParse({
        message: 'hello',
        lang: 'en',
        consent: true,
        history,
      }).success,
    ).toBe(false);
  });

  it('normalizes and validates account credentials', () => {
    const parsed = signInSchema.parse({
      email: '  Person@Example.COM ',
      password: 'long-enough-password',
    });
    expect(parsed.email).toBe('person@example.com');
    expect(signInSchema.safeParse({ email: 'bad', password: 'long-enough' }).success).toBe(
      false,
    );
    expect(
      signInSchema.safeParse({ email: 'a@b.com', password: 'short' }).success,
    ).toBe(false);
  });

  it('requires terms acceptance for sign-up', () => {
    expect(
      signUpSchema.safeParse({
        email: 'a@b.com',
        password: 'long-enough-password',
        acceptTerms: false,
      }).success,
    ).toBe(false);
    expect(
      signUpSchema.safeParse({
        email: 'a@b.com',
        password: 'long-enough-password',
        acceptTerms: true,
      }).success,
    ).toBe(true);
  });

  it('validates account deletion and conversation titles', () => {
    expect(deleteAccountSchema.safeParse({ confirmation: 'DELETE' }).success).toBe(true);
    expect(deleteAccountSchema.safeParse({ confirmation: 'delete' }).success).toBe(false);
    expect(conversationPatchSchema.safeParse({ title: 'My chat' }).success).toBe(true);
    expect(conversationPatchSchema.safeParse({ title: '   ' }).success).toBe(false);
  });

  it('only allows same-origin redirect paths', () => {
    expect(safeRedirectPath('/account')).toBe('/account');
    expect(safeRedirectPath('https://evil.example')).toBe('/account');
    expect(safeRedirectPath('//evil.example')).toBe('/account');
    expect(safeRedirectPath('/\\evil.example')).toBe('/account');
    expect(safeRedirectPath(undefined, '/chat')).toBe('/chat');
  });

  it('validates UUIDs, including the conversation id fixture', () => {
    expect(UUID_RE.test(conversationId)).toBe(true);
    expect(UUID_RE.test('123')).toBe(false);
  });
});
