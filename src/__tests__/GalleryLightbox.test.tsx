import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { GalleryLightbox } from '@/components/public/GalleryLightbox'

describe('GalleryLightbox component', () => {
  const mockImages = [
    { id: 'img-1', type: 'IMAGE', url: '/1.jpg', title: 'Image 1' },
    { id: 'img-2', type: 'IMAGE', url: '/2.jpg', title: 'Image 2' },
  ]

  it('renders without crashing with valid items', () => {
    // GalleryLightbox only takes { items } — open/close state is internal
    const { container } = render(<GalleryLightbox items={mockImages} />)
    expect(container).toBeTruthy()
  })

  it('renders a container element for the lightbox', () => {
    render(<GalleryLightbox items={mockImages} />)
    // The lightbox starts closed — no dialog visible initially
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
