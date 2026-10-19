/// <reference types="astro/client" />

import type { Lang } from './i18n/config';
import type { SessionUser } from './lib/supabase/server';

declare global {
  namespace App {
    interface Locals {
      user: SessionUser | null;
      lang: Lang;
      requestId: string;
    }
  }
}

export {};
