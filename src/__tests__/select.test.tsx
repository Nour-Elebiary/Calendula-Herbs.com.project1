import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

describe('Select component', () => {
  it('opens and selects an item', async () => {
    const onValueChange = vi.fn()
    
    render(
      <Select onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="opt1">Option 1</SelectItem>
          <SelectItem value="opt2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    )

    // Trigger is present
    const trigger = screen.getByRole('combobox')
    expect(trigger).toBeDefined()
    
    // Open select
    fireEvent.pointerDown(trigger)

    // Wait for content to render
    await waitFor(() => {
      expect(screen.getByText('Option 1')).toBeDefined()
    })

    // Select option 1
    const option1 = screen.getByText('Option 1')
    fireEvent.click(option1)

    expect(onValueChange).toHaveBeenCalledWith('opt1')
  })
})
