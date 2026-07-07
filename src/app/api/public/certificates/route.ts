import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const cacheBust = `?v=${Math.floor(Date.now() / 86400000)}`

function addCacheBust(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.includes('?_=') || url.includes('?v=')) return url
  return url + cacheBust
}

export async function GET() {
  try {
    const certs = await db.certificate.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        file: { select: { url: true, thumbnailUrl: true, type: true } },
        logo: { select: { url: true, thumbnailUrl: true } },
      },
    })

    const result = certs.map(cert => ({
      ...cert,
      logo: cert.logo
        ? {
            ...cert.logo,
            url: addCacheBust(cert.logo.url),
            thumbnailUrl: addCacheBust(cert.logo.thumbnailUrl),
          }
        : null,
      file: cert.file
        ? {
            ...cert.file,
            url: addCacheBust(cert.file.url),
            thumbnailUrl: addCacheBust(cert.file.thumbnailUrl),
          }
        : null,
    }))

    return NextResponse.json({ certs: result })
  } catch (err) {
    console.error('[PUBLIC CERTIFICATES]', err)
    return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 })
  }
}
