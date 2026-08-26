import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { HeroSection } from '@/components/public/home/HeroSection'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

describe('HeroSection component', () => {
  const defaultProps = { tagline: 'Premium herbs & spices', founded: '1998' }

  it('renders h1 heading', () => {
    render(<HeroSection {...defaultProps} />)

    // As it uses translations, the heading will likely contain the translation keys or fallback
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })

  it('cta buttons visible', () => {
    render(<HeroSection {...defaultProps} />)

    // Assuming there are buttons / links with role="link" or "button"
    const links = screen.getAllByRole('link')
    expect(links.length).toBeGreaterThan(0)
  })
})
