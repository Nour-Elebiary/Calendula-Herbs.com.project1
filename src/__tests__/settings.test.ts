import { describe, it, expect, vi } from 'vitest'
import { getCarouselStyle } from '@/lib/settings'
import { db } from '@/lib/db'

vi.mock('@/lib/db', () => ({
  db: {
    siteSetting: {
      findUnique: vi.fn(),
    }
  }
}))

describe('settings module', () => {
  it('returns style if valid', async () => {
    vi.mocked(db.siteSetting.findUnique).mockResolvedValue({ key: 'carousel_style', value: 'template2' } as any)
    const style = await getCarouselStyle()
    expect(style).toBe('template2')
  })

  it('returns original if invalid or missing', async () => {
    vi.mocked(db.siteSetting.findUnique).mockResolvedValue(null)
    expect(await getCarouselStyle()).toBe('original')

    vi.mocked(db.siteSetting.findUnique).mockResolvedValue({ key: 'carousel_style', value: 'invalid_style' } as any)
    expect(await getCarouselStyle()).toBe('original')
  })
})
