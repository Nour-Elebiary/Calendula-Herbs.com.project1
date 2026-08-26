import React from 'react'
import { render } from '@testing-library/react'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { GalleryCarousel } from '@/components/public/GalleryCarousel'

describe('GalleryCarousel component', () => {
  const mockImages = [
    { id: 'img-1', type: 'IMAGE', url: '/1.jpg', title: 'Image 1' },
    { id: 'img-2', type: 'IMAGE', url: '/2.jpg', title: 'Image 2' },
  ]

  beforeAll(() => {
    // GalleryCarousel uses matchMedia for responsive detection
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })

    // GalleryCarousel uses IntersectionObserver for lazy loading
    vi.stubGlobal('IntersectionObserver', vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    })))
  })

  it('renders without crashing', () => {
    const { container } = render(
      <GalleryCarousel
        items={mockImages}
        sectionLabel="Our Gallery"
        sectionDescription="A selection of images"
      />
    )
    // Component renders a non-empty container
    expect(container.firstChild).toBeTruthy()
  })

  it('renders the section label', () => {
    const { getByText } = render(
      <GalleryCarousel
        items={mockImages}
        sectionLabel="Our Gallery"
        sectionDescription="A selection of images"
      />
    )
    expect(getByText('Our Gallery')).toBeTruthy()
  })
})
