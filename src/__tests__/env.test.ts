import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getRequiredEnvVar, getOptionalEnvVar } from '@/lib/env'

describe('env module', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
    process.env.MOCK_REQUIRED = 'test-value'
    process.env.MOCK_OPTIONAL = 'optional-value'
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('Returns correct env var value', () => {
    expect(getRequiredEnvVar('MOCK_REQUIRED')).toBe('test-value')
  })

  it('Throws on missing required var', () => {
    expect(() => getRequiredEnvVar('MISSING_VAR')).toThrow('Missing required environment variable')
  })

  it('Returns default for optional var', () => {
    expect(getOptionalEnvVar('MISSING_OPTIONAL', 'fallback')).toBe('fallback')
  })

  it('Returns actual value for optional var when present', () => {
    expect(getOptionalEnvVar('MOCK_OPTIONAL', 'fallback')).toBe('optional-value')
  })
})
