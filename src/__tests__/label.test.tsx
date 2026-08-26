import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Label } from '@/components/ui/label'

describe('Label component', () => {
  it('renders correctly', () => {
    render(<Label>Username</Label>)
    expect(screen.getByText('Username')).toBeDefined()
  })

  it('associates with input via htmlFor', () => {
    render(
      <div>
        <Label htmlFor="user">User</Label>
        <input id="user" />
      </div>
    )
    const label = screen.getByText('User')
    expect(label).toHaveAttribute('for', 'user')
  })

  it('applies custom className', () => {
    render(<Label className="font-bold">Bold Label</Label>)
    expect(screen.getByText('Bold Label')).toHaveClass('font-bold')
  })
})
