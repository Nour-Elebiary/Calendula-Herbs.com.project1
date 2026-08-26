import { describe, it, expect } from 'vitest'
import { cleanImageUrl } from '@/lib/image-url'

describe('image-url module', () => {
  it('handles null/undefined', () => {
    expect(cleanImageUrl(null)).toBeNull()
    expect(cleanImageUrl(undefined)).toBeNull()
  })

  it('converts cloudinary pdf urls to png', () => {
    expect(cleanImageUrl('https://res.cloudinary.com/demo/image/upload/sample.pdf')).toBe('https://res.cloudinary.com/demo/image/upload/sample.png')
    expect(cleanImageUrl('https://res.cloudinary.com/demo/image/upload/sample.PDF?q=1')).toBe('https://res.cloudinary.com/demo/image/upload/sample.png?q=1')
  })

  it('strips query strings from local paths', () => {
    expect(cleanImageUrl('/local/path.jpg?v=1')).toBe('/local/path.jpg')
    expect(cleanImageUrl('/local/path.png')).toBe('/local/path.png')
  })

  it('leaves other urls alone', () => {
    expect(cleanImageUrl('https://example.com/image.jpg?v=1')).toBe('https://example.com/image.jpg?v=1')
  })
})
