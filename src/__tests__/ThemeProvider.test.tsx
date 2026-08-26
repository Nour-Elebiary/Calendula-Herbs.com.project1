import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider, useTheme } from '@/components/public/ThemeProvider'

const TestConsumer = () => {
  const { theme, toggleTheme, setTheme } = useTheme()
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button data-testid="toggle" onClick={toggleTheme}>Toggle</button>
      <button data-testid="set-light" onClick={() => setTheme('light')}>Light</button>
      <button data-testid="set-dark" onClick={() => setTheme('dark')}>Dark</button>
    </div>
  )
}

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark', 'light')
  window.matchMedia = vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
})

describe('ThemeProvider', () => {
  it('provides default light theme', () => {
    render(<ThemeProvider><TestConsumer /></ThemeProvider>)
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
  })

  it('toggles theme on toggle button click', () => {
    render(<ThemeProvider><TestConsumer /></ThemeProvider>)
    fireEvent.click(screen.getByTestId('toggle'))
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    fireEvent.click(screen.getByTestId('toggle'))
    expect(screen.getByTestId('theme')).toHaveTextContent('light')
  })

  it('sets theme to dark via setTheme', () => {
    render(<ThemeProvider><TestConsumer /></ThemeProvider>)
    fireEvent.click(screen.getByTestId('set-dark'))
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
  })

  it('persists theme to localStorage on toggle', () => {
    render(<ThemeProvider><TestConsumer /></ThemeProvider>)
    fireEvent.click(screen.getByTestId('toggle'))
    expect(localStorage.getItem('calendula-theme')).toBe('dark')
  })

  it('initializes from localStorage if available', () => {
    localStorage.setItem('calendula-theme', 'dark')
    render(<ThemeProvider><TestConsumer /></ThemeProvider>)
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
  })

  it('applies dark class to document element when dark', () => {
    render(<ThemeProvider><TestConsumer /></ThemeProvider>)
    fireEvent.click(screen.getByTestId('toggle'))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('removes dark class when toggled back to light', () => {
    render(<ThemeProvider><TestConsumer /></ThemeProvider>)
    fireEvent.click(screen.getByTestId('toggle'))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    fireEvent.click(screen.getByTestId('toggle'))
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('throws when useTheme is used outside provider', () => {
    const Test = () => {
      useTheme()
      return null
    }
    expect(() => render(<Test />)).toThrow('useTheme must be used within a ThemeProvider')
  })
})
