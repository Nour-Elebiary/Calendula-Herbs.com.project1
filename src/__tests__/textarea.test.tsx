import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Textarea } from '@/components/ui/textarea'

describe('Textarea component', () => {
  it('renders correctly', () => {
    render(<Textarea placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeDefined()
  })

  it('accepts text input', () => {
    render(<Textarea placeholder="Type here" />)
    const textarea = screen.getByPlaceholderText('Type here') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'multi\nline' } })
    expect(textarea.value).toBe('multi\nline')
  })

  it('can be disabled', () => {
    render(<Textarea disabled placeholder="Disabled textarea" />)
    expect(screen.getByPlaceholderText('Disabled textarea')).toBeDisabled()
  })

  it('forwards ref', () => {
    const ref = React.createRef<HTMLTextAreaElement>()
    render(<Textarea ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
  })
})
