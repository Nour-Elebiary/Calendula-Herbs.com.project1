import '@testing-library/jest-dom/vitest'
import { vi, beforeAll, afterEach, afterAll } from 'vitest'
import en from '@/messages/en.json'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

export const mswServer = setupServer(
  http.get('http://ip-api.com/json/*', () => {
    return HttpResponse.json({ country: 'Test Country' })
  }),
  http.get('https://ip-api.com/json/*', () => {
    return HttpResponse.json({ country: 'Test Country' })
  })
)

beforeAll(() => mswServer.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => mswServer.resetHandlers())
afterAll(() => mswServer.close())

// Radix UI testing polyfills
class MockPointerEvent extends Event {
  button: number;
  ctrlKey: boolean;
  pointerType: string;

  constructor(type: string, props: PointerEventInit) {
    super(type, props);
    this.button = props.button || 0;
    this.ctrlKey = props.ctrlKey || false;
    this.pointerType = props.pointerType || 'mouse';
  }
}
window.PointerEvent = MockPointerEvent as any;
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.Element.prototype.releasePointerCapture = vi.fn();
window.Element.prototype.hasPointerCapture = vi.fn();
window.Element.prototype.setPointerCapture = vi.fn();

class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
window.ResizeObserver = MockResizeObserver;

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
