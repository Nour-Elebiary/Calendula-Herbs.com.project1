import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LanguageSwitcher } from '@/components/public/LanguageSwitcher'

vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => {
    const msgs = { languageLabel: 'Select language' }
    return (key: string) => (msgs as Record<string, string>)[key] || key
  },
}))

describe('LanguageSwitcher', () => {
  it('renders trigger button with current locale name', () => {
    render(<LanguageSwitcher />)
    expect(screen.getByLabelText('Select language')).toBeInTheDocument()
    expect(screen.getByText('English')).toBeInTheDocument()
  })

  it('renders trigger with locale label', () => {
    render(<LanguageSwitcher />)
    const button = screen.getByLabelText('Select language')
    expect(button.textContent).toContain('EN')
  })
})
