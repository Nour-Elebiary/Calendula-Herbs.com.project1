import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Header } from '@/components/public/Header'

const mockUseCart = vi.fn()
vi.mock('@/components/public/CartProvider', () => ({
  useCart: () => mockUseCart(),
}))

const mockSetIsCartOpen = vi.fn()

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

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

  it('opens cart when desktop quote cart button clicked', async () => {
    const { default: userEvent } = await import('@testing-library/user-event')
    render(<Header />)
    const buttons = screen.getAllByTitle('Open quote cart')
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
    const toggle = screen.getByRole('button', { name: /toggle menu/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await userEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  it('mobile menu button has aria-controls', () => {
    render(<Header />)
    expect(screen.getByRole('button', { name: /toggle menu/i })).toHaveAttribute('aria-controls', 'mobile-menu')
  })

  it('has scroll listener that marks header is-scrolled', () => {
    render(<Header />)
    const header = screen.getByRole('banner')
    expect(header.className).not.toContain('is-scrolled')
    fireEvent.scroll(window, { target: { scrollY: 50 } })
    expect(header.className).toContain('is-scrolled')
  })
})
