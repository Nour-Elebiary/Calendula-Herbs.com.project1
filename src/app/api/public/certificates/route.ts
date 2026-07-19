import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'

const cacheBust = `?v=${Math.floor(Date.now() / 86400000)}`

function addCacheBust(url: string | null | undefined): string | null {
  if (!url) return null
  // Local paths (starting with / OR relative paths that map to public/) must not get query strings
  if (url.startsWith('/')) return url // next/image does not allow query strings on local URLs
  // Relative paths (no protocol) that could be served from /public/ must also be excluded
  if (!url.includes('://')) return url
  if (url.includes('?_=') || url.includes('?v=')) return url
  return url + cacheBust
}

export async function GET() {
  try {
    const cookieStore = await cookies()
    const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en'

    const certs = await db.certificate.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        file: { select: { url: true, thumbnailUrl: true, type: true } },
        logo: { select: { url: true, thumbnailUrl: true } },
        translations: { where: { locale } },
      },
    })

    const result = certs.map(cert => {
      const ct = cert.translations?.[0]
      return {
        ...cert,
        title: ct?.title ?? cert.title,
        issuer: ct?.issuer ?? cert.issuer,
        description: ct?.description ?? cert.description,
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
      }
    })

    return NextResponse.json({ certs: result })
  } catch (err) {
    console.error('[PUBLIC CERTIFICATES]', err)
    return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 })
  }
}
