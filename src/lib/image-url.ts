export function cleanImageUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const cleaned = url.replace(/\.[a-z0-9]+(?=\?|$)/i, '')
  return cleaned !== url ? cleaned : url
}
