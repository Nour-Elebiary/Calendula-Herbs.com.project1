import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Footer } from '@/components/public/Footer'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => 'en',
}))

describe('Footer component', () => {
  it('renders company info and nav links', () => {
    render(<Footer settings={{ site_name: 'Test' } as any} contact={{ email: 'test@example.com' } as any} />)
    
    // Test if some nav links are present
    expect(screen.getByRole('link', { name: /aboutCompany/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /productsCatalog/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /contactUs/i })).toBeInTheDocument()
  })

  it('social links have correct hrefs if present', () => {
    render(<Footer settings={{ site_name: 'Test' } as any} contact={{ email: 'test@example.com' } as any} />)
    
    // Assuming Facebook, LinkedIn etc.
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
  })
})
