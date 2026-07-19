import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'
import en from '@/messages/en.json'

class MockIntersectionObserver {
  readonly root: Element | Document | null = null
  readonly rootMargin: string = ''
  readonly thresholds: ReadonlyArray<number> = [0]
  constructor() {}
  observe() { vi.fn() }
  unobserve() { vi.fn() }
  disconnect() { vi.fn() }
  takeRecords(): IntersectionObserverEntry[] { return [] }
}
vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)

vi.mock('next-intl', () => {
  const messages = en as Record<string, Record<string, unknown>>
  return {
    useLocale: () => 'en' as const,
    useTranslations: (namespace: string) => {
      const translations = messages[namespace] as Record<string, unknown> | undefined
      if (!translations) return (key: string) => key
      return (key: string, params?: Record<string, string>) => {
        let val = translations[key]
        if (val === undefined || typeof val !== 'string') return key
        if (params) {
          val = String(val).replace(/\{(\w+)\}/g, (_, p: string) => params[p] ?? `{${p}}`)
        }
        return val
      }
    },
  }
})
