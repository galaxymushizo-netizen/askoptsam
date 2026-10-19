import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = fileURLToPath(new URL('../../', import.meta.url));

function read(relative: string): string {
  return readFileSync(join(root, relative), 'utf8');
}

function sourceFiles(directory: string): string[] {
  const entries = readdirSync(join(root, directory));
  return entries.flatMap((entry) => {
    const relative = `${directory}/${entry}`;
    const full = join(root, relative);
    if (statSync(full).isDirectory()) return sourceFiles(relative);
    return /\.(ts|tsx|astro)$/.test(entry) ? [relative] : [];
  });
}

describe('privacy and auth safeguards', () => {
  const migration = read('supabase/migrations/0001_initial.sql');

  it('enables row-level security on every user-data table', () => {
    for (const table of ['profiles', 'conversations', 'messages', 'consent_records']) {
      expect(migration).toContain(`alter table public.${table} enable row level security`);
    }
  });

  it('scopes every policy to auth.uid() and the owning row', () => {
    expect(migration).toContain('using (auth.uid() = user_id)');
    expect(migration).toContain('with check (auth.uid() = user_id)');
    expect(migration).toContain('using (auth.uid() = id)');
    expect(migration).toContain('revoke all on table public.conversations from anon');
    expect(migration).toContain('revoke all on table public.messages from anon');
  });

  it('cascades deletion from auth users and conversations', () => {
    expect(migration).toContain('references auth.users (id) on delete cascade');
    expect(migration).toContain('references public.conversations (id) on delete cascade');
  });

  it('makes consent records append-only', () => {
    expect(migration).toContain('No policy allows users to update or delete consent records');
    expect(migration).toContain('grant select, insert on table public.consent_records');
  });

  it('never exposes server secrets in browser components', () => {
    // Astro pages run on the server; the hydrated Preact components are the
    // code that actually ships to the browser.
    const clientFiles = sourceFiles('src/components').filter((file) =>
      file.endsWith('.tsx'),
    );
    expect(clientFiles.length).toBeGreaterThan(0);
    for (const file of clientFiles) {
      const content = read(file);
      expect(content).not.toContain('SUPABASE_SERVICE_ROLE_KEY');
      expect(content).not.toContain('GEMINI_API_KEY');
      expect(content).not.toContain('OPENAI_COMPATIBLE_API_KEY');
      expect(content).not.toContain('serviceRoleKey');
    }
  });

  it('keeps image analysis disabled by design', () => {
    const endpoint = read('src/pages/api/image.ts');
    expect(endpoint).toContain("'image_disabled'");
    expect(endpoint).toContain('No image was received');
    expect(endpoint).not.toContain('formData');
    expect(endpoint).not.toContain('base64');
  });

  it('enables Astro origin checks, an explicit CSP, and a small body limit', () => {
    const config = read('astro.config.mjs');
    expect(config).toContain('checkOrigin: true');
    expect(config).toContain('csp: {');
    expect(config).toContain("default-src 'self'");
    expect(config).toContain("frame-ancestors 'none'");
    expect(config).toContain("object-src 'none'");
    expect(config).toContain('bodySizeLimit: 64 * 1024');
  });

  it('ships no unverified clinic contact details or dead verification flags', () => {
    const publicSources = [
      read('.env.example'),
      read('src/config/brand.ts'),
      read('src/components/Footer.astro'),
      read('src/pages/about.astro'),
    ].join('\n');
    expect(publicSources).not.toMatch(/Mbagala|\+255|OPTSAM_LOCATION_VERIFIED|OPTSAM_PHONE_VERIFIED/);
    expect(publicSources).toMatch(/unverified/i);
  });

  it('ships a safe environment template with live AI and images off', () => {
    const example = read('.env.example');
    expect(example).toContain('AI_PROVIDER=demo');
    expect(example).toContain('AI_PRIVACY_APPROVED=false');
    expect(example).not.toContain('IMAGE_EXPLANATION_ENABLED');
    expect(example).toContain('Image explanation is intentionally unavailable');
    expect(example).toContain('SUPABASE_SERVICE_ROLE_KEY=');
    expect(example).toMatch(/Never expose to browser/);
  });
});
