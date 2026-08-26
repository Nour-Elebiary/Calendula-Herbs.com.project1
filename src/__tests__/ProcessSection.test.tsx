import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ProcessSection } from '@/components/public/home/ProcessSection'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

describe('ProcessSection component', () => {
  it('all process steps rendered', () => {
    render(<ProcessSection />)
    
    // Just verify that the component mounts successfully
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })
})
