import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ScrollReveal } from '@/components/public/shared/ScrollReveal'

describe('ScrollReveal', () => {
  it('renders children', () => {
    render(<ScrollReveal><p>Hello</p></ScrollReveal>)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('applies className', () => {
    const { container } = render(<ScrollReveal className="test-class"><span>test</span></ScrollReveal>)
    expect(container.firstChild).toHaveClass('test-class')
  })
})
