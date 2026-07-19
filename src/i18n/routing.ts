import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: [
    'en',    // English (default)
    'ar',    // Arabic (RTL)
    'es',    // Spanish
    'it',    // Italian
    'ja',    // Japanese
    'ko',    // Korean
    'hi',    // Hindi
    'ru',    // Russian
    'uk',    // Ukrainian
    'pt-BR', // Brazilian Portuguese
    'zh-CN', // Chinese Simplified
    'fr',    // French
    'nl',    // Dutch
    'de',    // German
    'bg',    // Bulgarian
    'el',    // Greek
    'tr',    // Turkish
  ],
  defaultLocale: 'en',
  localePrefix: 'never',
  localeDetection: true,
});

export type Locale = (typeof routing.locales)[number];
export const RTL_LOCALES: Locale[] = ['ar'];

export function isRtlLocale(locale: Locale): boolean {
  return RTL_LOCALES.includes(locale);
}
