import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

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
