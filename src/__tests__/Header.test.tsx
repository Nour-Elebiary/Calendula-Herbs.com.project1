import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Header } from '@/components/public/Header'

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))
vi.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: (namespace: string) => {
    const nav = { home: 'Home', products: 'Products', aboutUs: 'About Us', galleries: 'Galleries', certificates: 'Certificates', contact: 'Contact' }
    const header = { getQuote: 'Open quote cart', cartAria: 'Shopping cart with {count} items', languageLabel: 'Select language', menuToggleLabel: 'Toggle menu', cartBadgeAria: '{count} items in quote cart' }
    const msgs = namespace === 'nav' ? nav : namespace === 'header' ? header : {} as Record<string, string>
    return (key: string, params?: Record<string, string>) => {
      let val = (msgs as Record<string, string>)[key] || key
      if (params) val = val.replace(/\{(\w+)\}/g, (_, p: string) => params[p] ?? `{${p}}`)
      return val
    }
  },
}))

vi.mock('@/components/public/ThemeToggle', () => ({
  ThemeToggle: () => <div data-testid="mock-theme-toggle" />,
}))

vi.mock('@/components/public/LanguageSwitcher', () => ({
  LanguageSwitcher: () => <div data-testid="mock-language-switcher" />,
}))

const mockUseCart = vi.fn()
vi.mock('@/components/public/CartProvider', () => ({
  useCart: () => mockUseCart(),
}))

const mockSetIsCartOpen = vi.fn()

function setupCart(overrides: { items?: { productId: string }[] }) {
  mockUseCart.mockReturnValue({
    items: overrides.items ?? [],
    isCartOpen: false,
    setIsCartOpen: mockSetIsCartOpen,
  })
}

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setupCart({})
  })

  it('renders logo and navigation links', () => {
    render(<Header />)
    expect(screen.getByAltText('Calendula Herbs')).toBeInTheDocument()
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getByText('About Us')).toBeInTheDocument()
    expect(screen.getByText('Certificates')).toBeInTheDocument()
    expect(screen.getByText('Contact')).toBeInTheDocument()
  })

  it('renders logo image', () => {
    render(<Header siteName="Calendula Herbs" />)
    expect(screen.getByAltText('Calendula Herbs')).toBeInTheDocument()
  })

  it('renders theme toggle and language switcher', () => {
    render(<Header />)
    expect(screen.getByTestId('mock-theme-toggle')).toBeInTheDocument()
    expect(screen.getByTestId('mock-language-switcher')).toBeInTheDocument()
  })

  it('opens cart when desktop quote cart button clicked', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    render(<Header />)
    const buttons = screen.getAllByTitle('Shopping cart with 0 items')
    await userEvent.click(buttons[0])
    expect(mockSetIsCartOpen).toHaveBeenCalledWith(true)
  })

  it('shows cart badges when items present', () => {
    setupCart({ items: [{ productId: '1' }] })
    render(<Header />)
    const badges = screen.getAllByText('1')
    expect(badges).toHaveLength(2)
    badges.forEach(b => expect(b).toHaveClass('cart-badge'))
  })

  it('toggles mobile menu', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    render(<Header />)
    const toggle = screen.getByRole('button', { name: /open menu/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('mobile menu button has aria-controls', () => {
    render(<Header />)
    expect(screen.getByRole('button', { name: /open menu/i })).toHaveAttribute('aria-controls', 'mobile-menu')
  })

  it('has scroll listener that marks header is-scrolled', () => {
    render(<Header />)
    const header = screen.getByRole('banner')
    expect(header.className).not.toContain('is-scrolled')
    fireEvent.scroll(window, { target: { scrollY: 50 } })
    expect(header.className).toContain('is-scrolled')
  })
})
