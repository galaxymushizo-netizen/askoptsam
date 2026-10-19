import type { APIContext } from 'astro';
import { z } from 'zod';

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function jsonResponse(
  data: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...extraHeaders,
    },
  });
}

export function apiError(
  code: string,
  message: string,
  status = 400,
  extraHeaders: Record<string, string> = {},
): Response {
  return jsonResponse({ ok: false, error: { code, message } }, status, extraHeaders);
}

export async function readJson(request: Request): Promise<unknown> {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return null;
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function readBody(request: Request): Promise<unknown> {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await request.json();
    } catch {
      return null;
    }
  }
  if (
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data')
  ) {
    try {
      const form = await request.formData();
      return Object.fromEntries(form.entries());
    } catch {
      return null;
    }
  }
  return null;
}

export function validationError(error: z.ZodError): Response {
  return jsonResponse(
    {
      ok: false,
      error: {
        code: 'invalid_input',
        message: 'Some fields are missing or invalid.',
        fields: error.issues.slice(0, 8).map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      },
    },
    422,
  );
}

/**
 * Only trust forwarded IPs when the deployment is explicitly behind a trusted
 * proxy. Otherwise an attacker could rotate a spoofed header to evade limits.
 */
export function clientIdentifier(context: APIContext): string {
  const trustProxy = process.env.TRUST_PROXY === 'true';
  if (trustProxy) {
    const forwarded = context.request.headers.get('x-forwarded-for');
    if (forwarded) {
      const first = forwarded.split(',')[0]?.trim();
      if (first) return `ip:${first}`;
    }
    const real = context.request.headers.get('x-real-ip')?.trim();
    if (real) return `ip:${real}`;
  }
  try {
    return `ip:${context.clientAddress}`;
  } catch {
    return 'ip:unknown';
  }
}

export function isSignedIn(context: APIContext): boolean {
  return Boolean(context.locals.user);
}

export function safeRedirectPath(value: unknown, fallback = '/account'): string {
  if (typeof value !== 'string') return fallback;
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback;
  if (value.length > 300) return fallback;
  return value;
}

export function siteUrl(context: APIContext): string {
  const configured = (process.env.PUBLIC_SITE_URL || '').trim().replace(/\/+$/, '');
  if (configured) return configured;
  return context.url.origin;
}

export const chatRequestSchema = z.object({
  message: z.string().trim().min(2, 'Message is too short.').max(2000, 'Message is too long.'),
  lang: z.enum(['en', 'sw']),
  consent: z.literal(true, { error: 'Consent is required.' }),
  save: z.boolean().optional().default(false),
  conversationId: z
    .string()
    .regex(UUID_RE, 'Invalid conversation id.')
    .nullish()
    .transform((value) => value ?? null),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().trim().min(1).max(3000),
      }),
    )
    .max(8)
    .optional()
    .default([]),
});

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address.')).pipe(z.string().max(254)),
  password: z.string().min(10, 'Use a password of at least 10 characters.').max(200),
});

export const signUpSchema = signInSchema.extend({
  acceptTerms: z.literal(true, { error: 'Please accept the Terms and Privacy notice.' }),
});

export const accountPatchSchema = z
  .object({
    preferredLang: z.enum(['en', 'sw']).optional(),
    saveHistoryDefault: z.boolean().optional(),
  })
  .refine((value) => value.preferredLang !== undefined || value.saveHistoryDefault !== undefined, {
    message: 'No preference supplied.',
  });

export const conversationPatchSchema = z.object({
  title: z.string().trim().min(1).max(80),
});

export const deleteAccountSchema = z.object({
  confirmation: z.literal('DELETE'),
});
