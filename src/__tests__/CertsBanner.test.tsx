import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CertsBanner } from '@/components/public/home/CertsBanner'

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('CertsBanner', () => {
  it('renders nothing when no certificates returned', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ certs: [] }),
    })
    const { container } = render(<CertsBanner />)
    await vi.waitFor(() => {
      expect(container.innerHTML).toBe('')
    })
  })

  it('renders cert logos with direct file URLs', async () => {
    const mockCerts = [
      {
        id: '1',
        title: 'ISO 9001',
        file: { url: 'https://res.cloudinary.com/dcukpuftg/image/upload/v1/certs/iso.pdf', type: 'PDF' },
        logo: { url: 'https://res.cloudinary.com/dcukpuftg/image/upload/v1/logos/iso.png', thumbnailUrl: null },
      },
    ]
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ certs: mockCerts }),
    })
    render(<CertsBanner />)
    await vi.waitFor(() => {
      const links = document.querySelectorAll('a')
      expect(links.length).toBeGreaterThan(0)
      links.forEach(link => {
        expect(link.getAttribute('href')).not.toContain('/api/public/certificates/pdf/')
        expect(link.getAttribute('href')).toBe(mockCerts[0].file.url)
      })
    })
  })
})
