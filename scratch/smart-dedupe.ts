import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- Certificates ---')
  const certs = await prisma.certificate.findMany({ include: { logo: true, file: true } })
  const certMap = new Map()
  certs.forEach(c => {
    // We group by title
    const key = c.title.trim().toLowerCase()
    if (!certMap.has(key)) certMap.set(key, [])
    certMap.get(key).push(c)
  })

  let certsToDelete = []
  for (const [key, list] of certMap.entries()) {
    if (list.length > 1) {
      console.log(`Duplicate Title: ${key} (${list.length} items)`)
      // Sort so that the one WITH a logo or file comes first, then by date
      list.sort((a, b) => {
        const aHasMedia = a.logoFileId || a.fileId ? 1 : 0
        const bHasMedia = b.logoFileId || b.fileId ? 1 : 0
        if (aHasMedia !== bHasMedia) return bHasMedia - aHasMedia
        return a.createdAt.getTime() - b.createdAt.getTime()
      })
      // Keep the first one, delete the rest
      for (let i = 1; i < list.length; i++) {
        certsToDelete.push(list[i].id)
      }
    }
  }

  console.log('--- Gallery Items ---')
  const galleries = await prisma.galleryItem.findMany({ include: { mediaFile: true } })
  const galleryMap = new Map()
  galleries.forEach(g => {
    // We group by media url or external url
    const key = g.externalUrl || g.mediaFile?.url || g.id
    if (!galleryMap.has(key)) galleryMap.set(key, [])
    galleryMap.get(key).push(g)
  })

  let galleriesToDelete = []
  for (const [key, list] of galleryMap.entries()) {
    if (list.length > 1) {
      console.log(`Duplicate Media URL: ${key} (${list.length} items)`)
      list.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      for (let i = 1; i < list.length; i++) {
        galleriesToDelete.push(list[i].id)
      }
    }
  }

  console.log(`Will delete ${certsToDelete.length} certs and ${galleriesToDelete.length} galleries.`)

  if (certsToDelete.length > 0) {
    await prisma.certificate.deleteMany({ where: { id: { in: certsToDelete } } })
  }
  if (galleriesToDelete.length > 0) {
    await prisma.galleryItem.deleteMany({ where: { id: { in: galleriesToDelete } } })
  }

  // Also clean up orphaned media files again just in case
  const allMedia = await prisma.mediaFile.findMany()
  const linkedMediaIds = new Set()
  
  const products = await prisma.productImage.findMany({ select: { mediaFileId: true } })
  products.forEach(p => linkedMediaIds.add(p.mediaFileId))
  
  const categories = await prisma.category.findMany({ select: { imageId: true } })
  categories.forEach(c => c.imageId && linkedMediaIds.add(c.imageId))
  
  const certsLinked1 = await prisma.certificate.findMany({ select: { fileId: true } })
  certsLinked1.forEach(c => c.fileId && linkedMediaIds.add(c.fileId))
  
  const certsLinked2 = await prisma.certificate.findMany({ select: { logoFileId: true } })
  certsLinked2.forEach(c => c.logoFileId && linkedMediaIds.add(c.logoFileId))

  const galleriesLinked = await prisma.galleryItem.findMany({ select: { mediaFileId: true } })
  galleriesLinked.forEach(g => g.mediaFileId && linkedMediaIds.add(g.mediaFileId))

  const orphanMediaIds = []
  for (const m of allMedia) {
    if (!linkedMediaIds.has(m.id)) {
      orphanMediaIds.push(m.id)
    }
  }

  if (orphanMediaIds.length > 0) {
    await prisma.mediaFile.deleteMany({ where: { id: { in: orphanMediaIds } } })
    console.log(`Deleted ${orphanMediaIds.length} orphaned MediaFiles.`)
  }

}

main().finally(() => console.log('Done'))
