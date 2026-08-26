import { describe, it, expect } from 'vitest'
import { generateContactLink, generateTeamContactLink, isClickableLink, getDisplayValue } from '@/lib/contact-links'
import type { ContactMethod } from '@/lib/contact-links'

describe('contact-links module', () => {
  describe('generateContactLink', () => {
    it('uses manualLink if linkMode is manual', () => {
      const method: ContactMethod = { type: 'whatsapp', value: '123', linkMode: 'manual', manualLink: 'https://example.com' }
      expect(generateContactLink(method)).toBe('https://example.com')
    })

    it('generates whatsapp link', () => {
      const method: ContactMethod = { type: 'whatsapp', value: '+1 (555) 123-4567', linkMode: 'auto' }
      expect(generateContactLink(method)).toBe('https://wa.me/15551234567')
    })

    it('generates telegram link', () => {
      const method: ContactMethod = { type: 'telegram', value: '@username', linkMode: 'auto' }
      expect(generateContactLink(method)).toBe('https://t.me/username')
    })
  })

  describe('generateTeamContactLink', () => {
    it('generates email link', () => {
      expect(generateTeamContactLink('EMAIL', 'test@example.com')).toEqual({ href: 'mailto:test@example.com', external: false })
    })

    it('generates phone link', () => {
      expect(generateTeamContactLink('PHONE', '+1 (555) 123-4567')).toEqual({ href: 'tel:+15551234567', external: false })
    })
  })

  describe('isClickableLink', () => {
    it('returns true for auto links except wechat/other', () => {
      expect(isClickableLink({ type: 'whatsapp', value: '1', linkMode: 'auto' })).toBe(true)
      expect(isClickableLink({ type: 'wechat', value: '1', linkMode: 'auto' })).toBe(false)
      expect(isClickableLink({ type: 'other', value: '1', linkMode: 'auto' })).toBe(false)
    })

    it('depends on manualLink for manual mode', () => {
      expect(isClickableLink({ type: 'wechat', value: '1', linkMode: 'manual', manualLink: 'a' })).toBe(true)
      expect(isClickableLink({ type: 'whatsapp', value: '1', linkMode: 'manual' })).toBe(false)
    })
  })

  describe('getDisplayValue', () => {
    it('returns the value', () => {
      expect(getDisplayValue({ type: 'whatsapp', value: 'hello', linkMode: 'auto' })).toBe('hello')
    })
  })
})
