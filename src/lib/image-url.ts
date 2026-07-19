export function cleanImageUrl(url: string | null | undefined): string | null {
  if (!url) return null
  
  // If it's a Cloudinary URL and ends with .pdf, force it to PNG so next/image can render it
  if (url.toLowerCase().includes('cloudinary.com')) {
    return url.replace(/\.pdf(?=\?|$)/i, '.png')
  }

  // If it's a local path (starts with /) and has a query string, strip it
  if (url.startsWith('/')) {
    const queryIndex = url.indexOf('?')
    if (queryIndex !== -1) {
      return url.substring(0, queryIndex)
    }
  }

  return url
}
