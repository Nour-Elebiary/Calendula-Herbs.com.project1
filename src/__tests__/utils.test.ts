import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('utils module', () => {
  it('cn merges tailwind classes correctly', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white')
    expect(cn('px-2 py-1', 'p-4')).toBe('p-4')
  })
})
