import { describe, it, expect } from 'vitest'
import { routing } from '@/i18n/routing'

function collectKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null && !Array.isArray(v)
      ? collectKeys(v as Record<string, unknown>, `${prefix}${k}.`)
      : [`${prefix}${k}`]
  )
}

describe('i18n message consistency', () => {
  it('all locales have the same top-level keys as en.json', async () => {
    const en = await import('@/messages/en.json')
    const enKeys = Object.keys(en.default || en).sort()

    for (const locale of routing.locales) {
      if (locale === 'en') continue
      const messages = await import(`@/messages/${locale}.json`)
      const localeKeys = Object.keys(messages.default || messages).sort()
      const extraKeys = localeKeys.filter(k => !enKeys.includes(k))
      expect(extraKeys).toEqual([])
    }
  })

  it('all locales have identical nested key structure', async () => {
    const en = await import('@/messages/en.json')
    const enKeys = collectKeys(en.default || en).sort()

    for (const locale of routing.locales) {
      if (locale === 'en') continue
      const messages = await import(`@/messages/${locale}.json`)
      const localeKeys = collectKeys(messages.default || messages).sort()
      const extraKeys = localeKeys.filter(k => !enKeys.includes(k))
      expect(extraKeys).toEqual([])
    }
  })

  it('default locale is English', () => {
    expect(routing.defaultLocale).toBe('en')
  })

  it('locale detection is enabled', () => {
    expect(routing.localeDetection).not.toBe(false)
  })

  it('all supported locales are in the locales array', () => {
    expect(routing.locales.length).toBeGreaterThanOrEqual(17)
  })

  it('Arabic is in RTL locales', async () => {
    const { RTL_LOCALES } = await import('@/i18n/routing')
    expect(RTL_LOCALES).toContain('ar')
  })
})
