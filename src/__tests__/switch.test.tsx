import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Switch } from '@/components/ui/switch'

describe('Switch component', () => {
  it('renders correctly', () => {
    render(<Switch data-testid="switch" />)
    expect(screen.getByTestId('switch')).toBeDefined()
  })

  it('can be toggled', () => {
    const onCheckedChange = vi.fn()
    render(<Switch data-testid="switch" onCheckedChange={onCheckedChange} />)
    const switchEl = screen.getByTestId('switch')
    fireEvent.click(switchEl)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('is disabled and prevents toggle', () => {
    const onCheckedChange = vi.fn()
    render(<Switch data-testid="switch" disabled onCheckedChange={onCheckedChange} />)
    const switchEl = screen.getByTestId('switch')
    expect(switchEl).toBeDisabled()
    fireEvent.click(switchEl)
    expect(onCheckedChange).not.toHaveBeenCalled()
  })
})
