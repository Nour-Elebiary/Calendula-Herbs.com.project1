import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Checkbox } from '@/components/ui/checkbox'

describe('Checkbox component', () => {
  it('renders correctly', () => {
    render(<Checkbox data-testid="checkbox" />)
    expect(screen.getByTestId('checkbox')).toBeDefined()
  })

  it('can be checked and unchecked', () => {
    const onCheckedChange = vi.fn()
    render(<Checkbox data-testid="checkbox" onCheckedChange={onCheckedChange} />)
    const checkbox = screen.getByTestId('checkbox')
    fireEvent.click(checkbox)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('is disabled and prevents toggle', () => {
    const onCheckedChange = vi.fn()
    render(<Checkbox data-testid="checkbox" disabled onCheckedChange={onCheckedChange} />)
    const checkbox = screen.getByTestId('checkbox')
    expect(checkbox).toBeDisabled()
    fireEvent.click(checkbox)
    expect(onCheckedChange).not.toHaveBeenCalled()
  })
})
