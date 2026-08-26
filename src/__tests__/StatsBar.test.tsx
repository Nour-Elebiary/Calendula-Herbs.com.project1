import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { StatsBar } from '@/components/public/home/StatsBar'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

describe('StatsBar component', () => {
  it('stat numbers rendered', () => {
    render(<StatsBar />)
    // The component might use IntersectionObserver, but basic rendering should work
    // We can just verify it renders without crashing
    expect(screen.getByText(/stat1Value/)).toBeInTheDocument()
  })
})
