import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- Fixing Certificates ---')
  const allCerts = await prisma.certificate.findMany({ include: { translations: true } })
  const oldCerts = allCerts.filter(c => c.translations.length > 0)
  const newCerts = allCerts.filter(c => c.translations.length === 0)
  
  for (const oldCert of oldCerts) {
    // try to find matching new cert by title
    let match = newCerts.find(c => c.title.trim().toLowerCase() === oldCert.title.trim().toLowerCase() || c.title.trim().toLowerCase() + ' certificate' === oldCert.title.trim().toLowerCase() || c.title.trim().toLowerCase() + ' registration' === oldCert.title.trim().toLowerCase() || c.title.trim().toLowerCase() + ':2018' === oldCert.title.trim().toLowerCase() || c.title.trim().toLowerCase() + ':2015' === oldCert.title.trim().toLowerCase() )
    if (!match) {
        // Special fallbacks
        if (oldCert.title.includes('SEDEX')) match = newCerts.find(c => c.title.includes('SEDEX'))
        if (oldCert.title.includes('KOSHER')) match = newCerts.find(c => c.title === 'KOSHER')
        if (oldCert.title.includes('FDA')) match = newCerts.find(c => c.title === 'FDA')
        if (oldCert.title.includes('AHK')) match = newCerts.find(c => c.title === 'AHK EGYPT')
        if (oldCert.title.includes('BRCGS')) match = newCerts.find(c => c.title === 'BRCGS')
        if (oldCert.title.includes('COR')) match = newCerts.find(c => c.title.includes('COR'))
        if (oldCert.title.includes('FSSC')) match = newCerts.find(c => c.title.includes('FSSC'))
        if (oldCert.title.includes('HALAL')) match = newCerts.find(c => c.title.includes('HALAL'))
        if (oldCert.title.includes('NFSA')) match = newCerts.find(c => c.title.includes('NFSA'))
        if (oldCert.title.includes('USDA')) match = newCerts.find(c => c.title.includes('USDA'))
    }
    
    if (match) {
      console.log(`Matched OLD "${oldCert.title}" with NEW "${match.title}"`)
      await prisma.certificate.update({
        where: { id: oldCert.id },
        data: {
          logoFileId: match.logoFileId,
          fileId: match.fileId
        }
      })
      await prisma.certificate.delete({ where: { id: match.id } })
      console.log(` -> Updated OLD and deleted NEW.`)
      // Remove match from array so it's not reused
      newCerts.splice(newCerts.indexOf(match), 1)
    } else {
      console.log(`NO MATCH FOR OLD "${oldCert.title}"`)
    }
  }

  console.log('--- Fixing Gallery Items ---')
  // We want to delete gallery items that use Cloudinary MediaFiles, if a local one exists
  const allGalleries = await prisma.galleryItem.findMany({ include: { mediaFile: true } })
  const galleriesWithMedia = allGalleries.filter(g => g.mediaFile)
  
  const mapByOriginalName = new Map()
  for (const g of galleriesWithMedia) {
    const name = g.mediaFile.originalName
    if (!mapByOriginalName.has(name)) mapByOriginalName.set(name, [])
    mapByOriginalName.get(name).push(g)
  }

  for (const [name, list] of mapByOriginalName.entries()) {
    if (list.length > 1) {
      // Find the one that uses cloudinary
      const cloudinaryItems = list.filter(g => g.mediaFile.url.includes('cloudinary.com'))
      const localItems = list.filter(g => !g.mediaFile.url.includes('cloudinary.com'))
      
      if (cloudinaryItems.length > 0 && localItems.length > 0) {
        console.log(`Found duplicate Gallery Items for ${name}. Deleting ${cloudinaryItems.length} Cloudinary items.`)
        for (const item of cloudinaryItems) {
          await prisma.galleryItem.delete({ where: { id: item.id } })
        }
      } else {
         // what if there are 2 local items or 2 cloudinary items?
         console.log(`Duplicate for ${name} but could not differentiate purely by cloudinary url. Deleting older ones.`)
         list.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
         for (let i = 0; i < list.length - 1; i++) {
             await prisma.galleryItem.delete({ where: { id: list[i].id } })
         }
      }
    }
  }

  // Also clean up Youtube duplicates just in case (exact same externalUrl)
  const youtubeGalleries = allGalleries.filter(g => g.externalUrl)
  const mapByUrl = new Map()
  for (const g of youtubeGalleries) {
      if(!mapByUrl.has(g.externalUrl)) mapByUrl.set(g.externalUrl, [])
      mapByUrl.get(g.externalUrl).push(g)
  }
  for (const [url, list] of mapByUrl.entries()) {
      if(list.length > 1) {
         console.log(`Duplicate YOUTUBE Gallery Items for ${url}. Deleting older ones.`)
         list.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
         for (let i = 0; i < list.length - 1; i++) {
             await prisma.galleryItem.delete({ where: { id: list[i].id } })
         }
      }
  }

  console.log('--- Cleaning up orphaned MediaFiles ---')
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

  console.log('--- Done! ---')
}

main().finally(() => console.log('Done'))
