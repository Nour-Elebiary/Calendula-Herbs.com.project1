import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSend = vi.fn()

vi.mock('resend', () => {
  return {
    Resend: class {
      emails = {
        send: mockSend,
      }
    }
  }
})

vi.mock('@/lib/env', () => ({
  getRequiredEnvVar: vi.fn().mockReturnValue('mock-api-key'),
  getOptionalEnvVar: vi.fn().mockReturnValue('mock@example.com'),
}))

// We import dynamically after the mocks are set
import {
  sendContactConfirmation,
  sendContactNotification,
  sendSampleConfirmation,
  sendSampleNotification,
} from '@/lib/email'

describe('Email Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('Formats and sends contact confirmation', async () => {
    mockSend.mockResolvedValue({ id: 'resend-123', data: null, error: null })
    await sendContactConfirmation('jane@example.com', 'Jane')

    expect(mockSend).toHaveBeenCalledTimes(1)
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'jane@example.com',
        subject: expect.stringContaining('We received your message'),
        html: expect.stringContaining('Thank you, Jane!'),
      })
    )
  })

  it('Formats and sends contact notification to admins', async () => {
    mockSend.mockResolvedValue({ id: 'resend-124', data: null, error: null })
    await sendContactNotification(
      ['admin@example.com'],
      { name: 'Jane', email: 'jane@example.com', message: 'Hello', company: 'Acme Corp' }
    )

    expect(mockSend).toHaveBeenCalledTimes(1)
    const args = mockSend.mock.calls[0][0]
    expect(args.to).toEqual(['admin@example.com'])
    expect(args.subject).toContain('New Contact Inquiry from Jane (Acme Corp)')
    expect(args.html).toContain('Acme Corp')
    expect(args.html).toContain('Hello')
  })

  it('Formats and sends sample request confirmation', async () => {
    mockSend.mockResolvedValue({ id: 'resend-125', data: null, error: null })
    await sendSampleConfirmation('jane@example.com', 'Jane', 'Chamomile')

    expect(mockSend).toHaveBeenCalledTimes(1)
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'jane@example.com',
        subject: expect.stringContaining('Sample Request Received'),
        html: expect.stringContaining('Sample Request Received, Jane!'),
      })
    )
  })

  it('Handles Resend API failures gracefully', async () => {
    mockSend.mockRejectedValue(new Error('Resend failed'))
    
    await expect(sendContactConfirmation('jane@example.com', 'Jane')).rejects.toThrow('Resend failed')
  })
})
