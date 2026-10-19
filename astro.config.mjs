import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import preact from '@astrojs/preact';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'http://localhost:4321',
  output: 'server',
  adapter: node({
    mode: 'standalone',
    bodySizeLimit: 64 * 1024,
    staticHeaders: true,
  }),
  integrations: [preact()],
  session: false,
  security: {
    checkOrigin: true,
    csp: {
      directives: [
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "form-action 'self'",
        "img-src 'self' data:",
        "connect-src 'self'",
        "font-src 'self'",
        "manifest-src 'self'",
      ],
    },
  },
  markdown: {
    // No rendered Markdown code blocks; disabling Shiki avoids inline styles
    // that would conflict with the strict CSP above.
    syntaxHighlight: false,
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
