export type Lang = 'en' | 'sw';

export const languages: Record<Lang, { label: string; short: string; htmlLang: string }> = {
  en: { label: 'English', short: 'EN', htmlLang: 'en' },
  sw: { label: 'Kiswahili', short: 'SW', htmlLang: 'sw' },
};

export const defaultLang: Lang = 'en';
export const LANG_COOKIE = 'askoptsam_lang';

export function isLang(value: unknown): value is Lang {
  return value === 'en' || value === 'sw';
}

export function normalizeLang(value: string | undefined | null): Lang {
  return isLang(value) ? value : defaultLang;
}
