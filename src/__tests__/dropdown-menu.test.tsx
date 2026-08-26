import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

describe('DropdownMenu component', () => {
  it('opens on trigger click and selects item', async () => {
    const onSelect = vi.fn()
    
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onSelect}>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    expect(screen.queryByText('Item 1')).toBeNull()

    const trigger = screen.getByText('Open Menu')
    fireEvent.pointerDown(trigger)

    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeDefined()
    })

    const item = screen.getByText('Item 1')
    fireEvent.click(item)
    
    expect(onSelect).toHaveBeenCalled()

    await waitFor(() => {
      expect(screen.queryByText('Item 1')).toBeNull()
    })
  })
})
