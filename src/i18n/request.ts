import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { cookies } from 'next/headers';

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(
        target[key] as Record<string, unknown>,
        source[key] as Record<string, unknown>,
      );
    } else if (target[key] === undefined || target[key] === null || target[key] === '') {
      result[key] = source[key];
    }
  }
  return result;
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale: string = routing.defaultLocale

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
  if (cookieLocale && routing.locales.includes(cookieLocale as (typeof routing.locales)[number])) {
    locale = cookieLocale;
  } else {
    const detected = await requestLocale;
    if (detected && routing.locales.includes(detected as (typeof routing.locales)[number])) {
      locale = detected;
    }
  }

  const [messages, enMessages] = await Promise.all([
    import(`@/messages/${locale}.json`),
    import(`@/messages/en.json`),
  ]);

  return {
    locale,
    messages: deepMerge(messages.default, enMessages.default),
  };
});
