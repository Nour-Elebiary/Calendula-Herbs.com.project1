import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { ContactForm } from '@/components/public/ContactForm'

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const server = setupServer(
  http.post('*/api/public/contact', () => {
    return HttpResponse.json({ success: true })
  }),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }))
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

describe('ContactForm', () => {
  it('renders all required fields', () => {
    render(<ContactForm />)
    expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /message/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send inquiry/i })).toBeInTheDocument()
  })

  it('shows validation errors on empty submit', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    await user.type(screen.getByRole('textbox', { name: /name/i }), '   ')
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'test@test')
    await user.type(screen.getByRole('textbox', { name: /message/i }), '   ')
    await user.click(screen.getByRole('button', { name: /send inquiry/i }))

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument()
    expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument()
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Jane')
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'test@test')
    await user.type(screen.getByRole('textbox', { name: /message/i }), 'Hello')
    await user.click(screen.getByRole('button', { name: /send inquiry/i }))

    expect(await screen.findByText(/please enter a valid email/i)).toBeInTheDocument()
  })

  it('submits successfully with valid data', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Jane Doe')
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'jane@example.com')
    await user.type(screen.getByRole('textbox', { name: /message/i }), 'I am interested in your products.')
    await user.click(screen.getByRole('button', { name: /send inquiry/i }))

    await waitFor(() => {
      expect(screen.getByText(/success!/i)).toBeInTheDocument()
    })
  })

  it('shows error toast on API failure', async () => {
    server.use(
      http.post('*/api/public/contact', () => {
        return HttpResponse.json({ error: 'Failed' }, { status: 500 })
      }),
    )

    const user = userEvent.setup()
    render(<ContactForm />)

    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Jane')
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'jane@example.com')
    await user.type(screen.getByRole('textbox', { name: /message/i }), 'Hello')
    await user.click(screen.getByRole('button', { name: /send inquiry/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /send inquiry/i })).toBeInTheDocument()
    })
  })

  it('honeypot field prevents bot submission', async () => {
    const user = userEvent.setup()
    render(<ContactForm />)

    await user.type(screen.getByLabelText(/leave this empty/i), 'bot value')
    await user.type(screen.getByRole('textbox', { name: /name/i }), 'Bot')
    await user.type(screen.getByRole('textbox', { name: /email/i }), 'bot@spam.com')
    await user.type(screen.getByRole('textbox', { name: /message/i }), 'Spam!')

    await user.click(screen.getByRole('button', { name: /send inquiry/i }))

    expect(screen.getByRole('textbox', { name: /name/i })).toHaveValue('Bot')
  })
})
