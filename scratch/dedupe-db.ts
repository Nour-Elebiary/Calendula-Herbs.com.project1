import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()

async function main() {
  try {
    console.log('--- Database Deduplication Started ---')

    // 1. Deduplicate Certificates by title
    const certs = await db.certificate.findMany({
      orderBy: { createdAt: 'asc' },
    })
    const certTitles = new Set()
    const certsToDelete = []
    
    for (const cert of certs) {
      if (certTitles.has(cert.title)) {
        certsToDelete.push(cert.id)
      } else {
        certTitles.add(cert.title)
      }
    }
    
    if (certsToDelete.length > 0) {
      const res = await db.certificate.deleteMany({
        where: { id: { in: certsToDelete } },
      })
      console.log(`Deleted ${res.count} duplicate Certificates.`)
    } else {
      console.log('No duplicate Certificates found.')
    }

    // 2. Deduplicate GalleryItems by externalUrl and mediaFileId
    const galleryItems = await db.galleryItem.findMany({
      orderBy: { createdAt: 'asc' },
    })
    const externalUrls = new Set()
    const mediaIds = new Set()
    const galleryItemsToDelete = []

    for (const item of galleryItems) {
      if (item.externalUrl) {
        if (externalUrls.has(item.externalUrl)) {
          galleryItemsToDelete.push(item.id)
          continue
        } else {
          externalUrls.add(item.externalUrl)
        }
      }
      if (item.mediaFileId) {
        if (mediaIds.has(item.mediaFileId)) {
          galleryItemsToDelete.push(item.id)
        } else {
          mediaIds.add(item.mediaFileId)
        }
      }
    }

    if (galleryItemsToDelete.length > 0) {
      const res = await db.galleryItem.deleteMany({
        where: { id: { in: galleryItemsToDelete } },
      })
      console.log(`Deleted ${res.count} duplicate Gallery Items.`)
    } else {
      console.log('No duplicate Gallery Items found.')
    }

    // 3. Delete orphaned MediaFiles
    const allMedia = await db.mediaFile.findMany()
    const linkedMediaIds = new Set()
    
    const products = await db.productImage.findMany({ select: { mediaFileId: true } })
    products.forEach(p => linkedMediaIds.add(p.mediaFileId))
    
    const categories = await db.category.findMany({ select: { imageId: true } })
    categories.forEach(c => c.imageId && linkedMediaIds.add(c.imageId))
    
    const certsLinked1 = await db.certificate.findMany({ select: { fileId: true } })
    certsLinked1.forEach(c => c.fileId && linkedMediaIds.add(c.fileId))
    
    const certsLinked2 = await db.certificate.findMany({ select: { logoFileId: true } })
    certsLinked2.forEach(c => c.logoFileId && linkedMediaIds.add(c.logoFileId))

    const galleriesLinked = await db.galleryItem.findMany({ select: { mediaFileId: true } })
    galleriesLinked.forEach(g => g.mediaFileId && linkedMediaIds.add(g.mediaFileId))

    const orphanMediaIds = []
    for (const m of allMedia) {
      if (!linkedMediaIds.has(m.id)) {
        orphanMediaIds.push(m.id)
      }
    }

    if (orphanMediaIds.length > 0) {
      const res = await db.mediaFile.deleteMany({
        where: { id: { in: orphanMediaIds } },
      })
      console.log(`Deleted ${res.count} orphaned Media Files.`)
    } else {
      console.log('No orphaned Media Files found.')
    }

    console.log('--- Database Deduplication Finished ---')
  } catch (err) {
    console.error('Error during deduplication:', err)
  } finally {
    await db.$disconnect()
  }
}

main()
