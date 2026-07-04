import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CartDrawer } from '@/components/public/CartDrawer'
import type { CartItem } from '@/components/public/CartProvider'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const mockUseCart = vi.fn()
vi.mock('@/components/public/CartProvider', () => ({
  useCart: () => mockUseCart(),
}))

const defaultItem: CartItem = { productId: '1', productName: 'Calendula Flowers', quantity: 500 }
const mockSetIsCartOpen = vi.fn()
const mockRemoveItem = vi.fn()
const mockUpdateQuantity = vi.fn()
const mockClearCart = vi.fn()

function setupCart(overrides: {
  items?: CartItem[]
  isCartOpen?: boolean
}) {
  mockUseCart.mockReturnValue({
    items: overrides.items ?? [],
    isCartOpen: overrides.isCartOpen ?? true,
    setIsCartOpen: mockSetIsCartOpen,
    removeItem: mockRemoveItem,
    updateQuantity: mockUpdateQuantity,
    clearCart: mockClearCart,
  })
}

describe('CartDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders empty state when no items in cart', () => {
    setupCart({})
    render(<CartDrawer />)
    expect(screen.getByText(/your quote cart is empty/i)).toBeInTheDocument()
    expect(screen.getByText(/Browse Products/i)).toBeInTheDocument()
  })

  it('renders nothing when cart is closed', () => {
    setupCart({ isCartOpen: false })
    const { container } = render(<CartDrawer />)
    expect(container.innerHTML).toBe('')
  })

  it('displays cart items with quantity controls', () => {
    setupCart({ items: [defaultItem, { productId: '2', productName: 'Chamomile', quantity: 300 }] })
    render(<CartDrawer />)
    expect(screen.getByText('Calendula Flowers')).toBeInTheDocument()
    expect(screen.getByText('Chamomile')).toBeInTheDocument()
    expect(screen.getByText('500kg')).toBeInTheDocument()
    expect(screen.getByText('300kg')).toBeInTheDocument()
    expect(screen.getByText('Proceed to Details')).toBeInTheDocument()
  })

  it('has accessible quantity buttons', () => {
    setupCart({ items: [defaultItem] })
    render(<CartDrawer />)
    expect(screen.getByRole('button', { name: /decrease quantity/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /increase quantity/i })).toBeInTheDocument()
  })

  it('calls removeItem when remove button clicked', async () => {
    setupCart({ items: [defaultItem] })
    render(<CartDrawer />)
    await userEvent.click(screen.getByRole('button', { name: /remove item/i }))
    expect(mockRemoveItem).toHaveBeenCalledWith('1')
  })

  it('closes cart on escape key', () => {
    setupCart({ items: [defaultItem] })
    render(<CartDrawer />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(mockSetIsCartOpen).toHaveBeenCalledWith(false)
  })

  it('closes cart on close button click', async () => {
    setupCart({ items: [defaultItem] })
    render(<CartDrawer />)
    await userEvent.click(screen.getByRole('button', { name: /close cart/i }))
    expect(mockSetIsCartOpen).toHaveBeenCalledWith(false)
  })

  it('proceeds to details step and shows form', async () => {
    setupCart({ items: [defaultItem] })
    render(<CartDrawer />)
    await userEvent.click(screen.getByText('Proceed to Details'))
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
  })
})
