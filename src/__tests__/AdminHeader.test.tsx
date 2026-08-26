import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}))

describe('AdminHeader component', () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue('/admin/dashboard')
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        json: () => Promise.resolve({ total: 0 }),
      })
    )
  })

  it('shows admin display name if provided', () => {
    vi.mocked(useSession).mockReturnValue({
      data: { user: { name: 'Test Admin', email: 'test@example.com' } },
      status: 'authenticated'
    } as any)

    render(<AdminHeader />)
    expect(screen.getByText('Test Admin')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })
})
