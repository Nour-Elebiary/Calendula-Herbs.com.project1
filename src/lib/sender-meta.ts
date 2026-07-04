import { NextRequest } from 'next/server'

export type SenderMeta = {
  ip: string
  userAgent: string
  referer: string | null
  acceptLanguage: string | null
  country: string | null
}

export function extractSenderMeta(req: NextRequest): SenderMeta {
  return {
    ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || 'unknown',
    userAgent: req.headers.get('user-agent') || 'unknown',
    referer: req.headers.get('referer'),
    acceptLanguage: req.headers.get('accept-language'),
    country: null,
  }
}

function isPrivateIP(ip: string): boolean {
  if (ip === 'unknown' || ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') return true
  if (ip.startsWith('192.168.') || ip.startsWith('10.')) return true
  if (ip.startsWith('172.')) {
    const second = parseInt(ip.split('.')[1], 10)
    if (second >= 16 && second <= 31) return true
  }
  return false
}

export async function enrichWithCountry(meta: SenderMeta): Promise<SenderMeta> {
  if (isPrivateIP(meta.ip)) return meta

  try {
    const res = await fetch(`http://ip-api.com/json/${meta.ip}?fields=country`, {
      signal: AbortSignal.timeout(3000),
    })
    if (res.ok) {
      const data = await res.json()
      return { ...meta, country: data.country || null }
    }
  } catch {}

  return meta
}
