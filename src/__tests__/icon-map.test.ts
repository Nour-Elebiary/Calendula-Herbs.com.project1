import { describe, it, expect } from 'vitest'
import { getIconComponent, getContactTypeIcon, getContactMethodIcon } from '@/lib/icon-map'
import { Link } from 'lucide-react'

describe('icon-map module', () => {
  it('getIconComponent returns the icon or fallback', () => {
    expect(getIconComponent('Mail')).toBeDefined()
    expect(getIconComponent('FaEnvelope')).toBeDefined()
    expect(getIconComponent('UnknownIcon')).toBe(Link)
    expect(getIconComponent(null)).toBe(Link)
  })

  it('getContactTypeIcon maps types correctly', () => {
    expect(getContactTypeIcon('EMAIL')).toBeDefined()
    expect(getContactTypeIcon('UNKNOWN_TYPE')).toBe(Link)
  })

  it('getContactMethodIcon maps methods correctly', () => {
    expect(getContactMethodIcon('whatsapp')).toBeDefined()
    expect(getContactMethodIcon('other')).toBeDefined()
    expect(getContactMethodIcon('unknown_method')).toBe(Link)
  })
})
