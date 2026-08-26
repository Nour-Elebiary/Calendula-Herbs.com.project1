import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { FeaturedProductsSection } from '@/components/public/home/FeaturedProductsSection'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

describe('FeaturedProductsSection component', () => {
  const mockProducts = [
    {
      id: '1',
      name: 'Test Product 1',
      slug: 'test-product-1',
      description: 'Test Description',
      categoryId: 'cat1',
      minOrderKg: 10,
      inStock: true,
      price: 100,
      translations: [],
      images: [],
    }
  ]

  it('renders product cards', () => {
    render(<FeaturedProductsSection products={mockProducts as any} />)
    
    expect(screen.getByText('Test Product 1')).toBeInTheDocument()
  })

  it('each card links to correct product route', () => {
    render(<FeaturedProductsSection products={mockProducts as any} />)
    
    const link = screen.getByRole('link', { name: /Test Product 1/i })
    expect(link).toHaveAttribute('href', '/products?product=test-product-1')
  })
})
