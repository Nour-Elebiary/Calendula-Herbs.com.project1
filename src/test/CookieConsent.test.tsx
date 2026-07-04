import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CookieConsent } from '@/components/public/CookieConsent'

const STORAGE_KEY = 'calendula_cookie_consent'

beforeEach(() => {
  localStorage.clear()
})

describe('CookieConsent', () => {
  it('renders the consent banner when no consent stored', () => {
    render(<CookieConsent />)
    expect(screen.getByText(/cookies for analytics/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /accept/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /decline/i })).toBeInTheDocument()
  })

  it('sets localStorage and hides on accept', () => {
    render(<CookieConsent />)
    fireEvent.click(screen.getByRole('button', { name: /accept/i }))
    expect(localStorage.getItem(STORAGE_KEY)).toBe('accepted')
    expect(screen.queryByText(/cookies for analytics/i)).not.toBeInTheDocument()
  })

  it('sets localStorage and hides on decline', () => {
    render(<CookieConsent />)
    fireEvent.click(screen.getByRole('button', { name: /decline/i }))
    expect(localStorage.getItem(STORAGE_KEY)).toBe('declined')
    expect(screen.queryByText(/cookies for analytics/i)).not.toBeInTheDocument()
  })

  it('does not render when consent already stored', () => {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    render(<CookieConsent />)
    expect(screen.queryByText(/cookies for analytics/i)).not.toBeInTheDocument()
  })
})
