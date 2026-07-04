import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { ProductActions } from '@/components/public/ProductActions'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/components/public/CartProvider', () => ({
  useCart: () => ({ addItem: vi.fn(), items: [] }),
}))

const server = setupServer(
  http.post('*/api/public/sample', () => {
    return HttpResponse.json({ success: true })
  }),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

describe('ProductActions', () => {
  const defaultProps = {
    productId: 'prod-1',
    productName: 'Chamomile',
    minOrderKg: 500,
  }

  it('renders quantity input and action buttons', () => {
    render(<ProductActions {...defaultProps} />)
    expect(screen.getByDisplayValue('500')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add to quote cart/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /request a sample/i })).toBeInTheDocument()
  })

  it('shows minimum order quantity', () => {
    render(<ProductActions {...defaultProps} />)
    expect(screen.getByText(/minimum order quantity: 500 kg/i)).toBeInTheDocument()
  })

  it('opens sample dialog on button click', async () => {
    const user = userEvent.setup()
    render(<ProductActions {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /request a sample/i }))

    expect(await screen.findByText(/request sample: chamomile/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /request sample/i })).toBeInTheDocument()
  })

  it('submits sample request successfully', async () => {
    const user = userEvent.setup()
    render(<ProductActions {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /request a sample/i }))
    await screen.findByText(/request sample: chamomile/i)

    const inputs = screen.getAllByRole('textbox')
    await user.type(inputs[0], 'Jane')
    await user.type(inputs[1], 'jane@example.com')
    await user.type(inputs[3], '123 Main St')
    await user.click(screen.getByRole('button', { name: /request sample/i }))

    await waitFor(() => {
      expect(screen.queryByText(/request sample: chamomile/i)).not.toBeInTheDocument()
    })
  })

  it('prevents submitting sample with empty required fields', async () => {
    const user = userEvent.setup()
    render(<ProductActions {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /request a sample/i }))
    await screen.findByText(/request sample: chamomile/i)
    await user.click(screen.getByRole('button', { name: /request sample/i }))

    expect(screen.getByText(/request sample: chamomile/i)).toBeInTheDocument()
  })

  it('disables submit button while sample request is in progress', async () => {
    server.use(
      http.post('*/api/public/sample', async () => {
        await new Promise((r) => setTimeout(r, 100))
        return HttpResponse.json({ success: true })
      }),
    )

    const user = userEvent.setup()
    render(<ProductActions {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /request a sample/i }))
    await screen.findByText(/request sample: chamomile/i)

    const inputs = screen.getAllByRole('textbox')
    await user.type(inputs[0], 'Jane')
    await user.type(inputs[1], 'jane@example.com')
    await user.type(inputs[3], '123 Main St')
    await user.click(screen.getByRole('button', { name: /request sample/i }))

    expect(await screen.findByRole('button', { name: /submitting/i })).toBeDisabled()
  })
})
