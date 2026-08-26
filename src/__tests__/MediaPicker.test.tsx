import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MediaPicker } from '@/components/admin/media/MediaPicker'
import { toast } from 'sonner'

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}))

describe('MediaPicker component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            items: [
              { id: '1', name: 'Test Image', type: 'IMAGE', url: 'https://example.com/test.jpg' },
              { id: '2', name: 'Test Doc', type: 'PDF', url: 'https://example.com/test.pdf' },
            ],
            totalPages: 1,
          }),
      })
    )
  })

  it('renders nothing if not open', () => {
    render(<MediaPicker open={false} onOpenChange={() => {}} onSelect={() => {}} />)
    expect(screen.queryByText('Select Media')).toBeNull()
  })

  it('opens and loads existing images', async () => {
    render(<MediaPicker open={true} onOpenChange={() => {}} onSelect={() => {}} />)
    
    expect(screen.getByText('Select Media')).toBeInTheDocument()
    
    // Check loading state
    expect(global.fetch).toHaveBeenCalled()
    
    // Wait for items to render
    await waitFor(() => {
      expect(screen.getByText('Test Image')).toBeInTheDocument()
      expect(screen.getByText('Test Doc')).toBeInTheDocument()
    })
  })

  it('selects and returns media item', async () => {
    const onSelect = vi.fn()
    const onOpenChange = vi.fn()
    render(<MediaPicker open={true} onOpenChange={onOpenChange} onSelect={onSelect} />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Image')).toBeInTheDocument()
    })
    
    fireEvent.click(screen.getByText('Test Image').closest('div.group')!)
    
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ name: 'Test Image' }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
