import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { BotanicalAboutSection } from '@/components/public/home/BotanicalAboutSection'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

describe('BotanicalAboutSection component', () => {
  it('section content renders', () => {
    render(<BotanicalAboutSection />)
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })
})
