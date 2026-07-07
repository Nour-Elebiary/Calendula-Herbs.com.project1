export type CarouselItem = {
  id: string
  type: string
  url?: string | null
  thumbnailUrl?: string | null
  title?: string | null
  caption?: string | null
  externalId?: string | null
  externalUrl?: string | null
}

export function getYouTubeEmbedUrl(item: CarouselItem): string | null {
  const id = item.externalId
  if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`
  if (item.externalUrl) {
    const match = item.externalUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/)
    if (match) return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`
  }
  return null
}

export function getGoogleDriveEmbedUrl(item: CarouselItem): string | null {
  const id = item.externalId
  if (id) return `https://drive.google.com/file/d/${id}/preview`
  if (item.externalUrl) {
    const match = item.externalUrl.match(/\/d\/([a-zA-Z0-9_-]+)/)
    if (match) return `https://drive.google.com/file/d/${match[1]}/preview`
  }
  return null
}
