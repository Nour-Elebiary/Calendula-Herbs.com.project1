import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

describe('Dialog component', () => {
  it('opens and renders content when trigger is clicked', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog Title</DialogTitle>
          </DialogHeader>
          <p>Dialog Body</p>
        </DialogContent>
      </Dialog>
    )

    expect(screen.queryByText('Dialog Title')).toBeNull()

    const trigger = screen.getByText('Open Dialog')
    fireEvent.click(trigger)

    await waitFor(() => {
      expect(screen.getByText('Dialog Title')).toBeDefined()
    })
    expect(screen.getByText('Dialog Body')).toBeDefined()
  })

  it('closes when close button is clicked', async () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogContent>
      </Dialog>
    )

    fireEvent.click(screen.getByText('Open Dialog'))
    
    await waitFor(() => {
      expect(screen.getByText('Dialog Title')).toBeDefined()
    })

    const closeButton = screen.getByRole('button', { name: /close/i })
    fireEvent.click(closeButton)

    await waitFor(() => {
      expect(screen.queryByText('Dialog Title')).toBeNull()
    })
  })
})
