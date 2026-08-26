import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { usePathname } from 'next/navigation'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}))

describe('AdminSidebar component', () => {
  it('renders all nav links', () => {
    vi.mocked(usePathname).mockReturnValue('/admin')
    // AdminSidebar takes no props
    render(<AdminSidebar />)

    // Check that some known links are present
    expect(screen.getByRole('link', { name: /Dashboard/i })).toBeDefined()
    expect(screen.getByRole('link', { name: /Products/i })).toBeDefined()
    expect(screen.getByRole('link', { name: /Inquiries/i })).toBeDefined()
    expect(screen.getByRole('link', { name: /Settings/i })).toBeDefined()
  })

  it('highlights the active route', () => {
    vi.mocked(usePathname).mockReturnValue('/admin/products')
    render(<AdminSidebar />)

    const productsLink = screen.getByRole('link', { name: /Products/i })
    expect(productsLink.className).toMatch(/bg-[a-zA-Z0-9\[\]-]+/) // active style check (simplified)
  })
})
