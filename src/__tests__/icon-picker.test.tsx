import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { IconPicker } from '@/components/ui/icon-picker'

describe('IconPicker component', () => {
  it('renders correctly with default icon', () => {
    render(<IconPicker value="" onChange={() => {}} />)
    expect(screen.getByRole('button', { name: /None/i })).toBeDefined()
  })

  it('opens popover and allows searching and selecting', async () => {
    const onChange = vi.fn()
    render(<IconPicker value="" onChange={onChange} />)

    const trigger = screen.getByRole('button', { name: /None/i })
    fireEvent.click(trigger)

    // Wait for popover content
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search icons...')).toBeDefined()
    })

    const searchInput = screen.getByPlaceholderText('Search icons...')
    fireEvent.change(searchInput, { target: { value: 'Phone' } })

    // Find the Phone icon button
    const phoneButton = screen.getAllByRole('button').find(btn => btn.getAttribute('title') === 'Phone')
    expect(phoneButton).toBeDefined()

    if (phoneButton) {
      fireEvent.click(phoneButton)
      expect(onChange).toHaveBeenCalledWith('Phone')
    }
  })
})
