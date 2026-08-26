import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateSignature, cloudinary } from '@/lib/cloudinary'

vi.mock('@/lib/env', () => ({
  getRequiredEnvVar: vi.fn((key) => `mock-${key}`)
}))

describe('cloudinary module', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T00:00:00Z'))
  })

  it('configures cloudinary with env vars', () => {
    // Config should have been called at module load
    const config = cloudinary.config()
    expect(config.cloud_name).toBe('mock-CLOUDINARY_CLOUD_NAME')
    expect(config.api_key).toBe('mock-CLOUDINARY_API_KEY')
    expect(config.api_secret).toBe('mock-CLOUDINARY_API_SECRET')
    expect(config.secure).toBe(true)
  })

  it('generates signature correctly', async () => {
    const { timestamp, signature } = await generateSignature('test-folder')
    expect(timestamp).toBe(1704067200) // Jan 1 2024
    expect(typeof signature).toBe('string')
  })
})
