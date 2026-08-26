import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MediaUploader } from '@/components/admin/media/MediaUploader'
import { toast } from 'sonner'
import userEvent from '@testing-library/user-event'

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('MediaUploader component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders upload area', () => {
    render(<MediaUploader onUploadSuccess={() => {}} />)
    expect(screen.getByText(/Drag & Drop files here/i)).toBeInTheDocument()
  })

  it('rejects unsupported file types', async () => {
    render(<MediaUploader onUploadSuccess={() => {}} />)
    
    const input = screen.getByTestId('file-input')
    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' })
    
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Unsupported file type: hello.txt')
    })
  })

  it('rejects files over max size', async () => {
    render(<MediaUploader onUploadSuccess={() => {}} />)
    
    const input = screen.getByTestId('file-input')
    // Mock a large file
    const file = new File([''], 'huge.pdf', { type: 'application/pdf' })
    Object.defineProperty(file, 'size', { value: 30 * 1024 * 1024 }) // 30MB, limit is 20MB
    
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('huge.pdf exceeds max size for PDF')
    })
  })
})
