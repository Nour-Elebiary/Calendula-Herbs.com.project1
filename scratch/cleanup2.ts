import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- Certificates ---')
  const certs = await prisma.certificate.findMany({ include: { translations: true } })
  
  // Group by title
  const certMap = new Map()
  certs.forEach(c => {
    if (!certMap.has(c.title)) certMap.set(c.title, [])
    certMap.get(c.title).push(c)
  })
  
  for (const [title, list] of certMap.entries()) {
    if (list.length > 1) {
      console.log(`\nDuplicate Title: ${title}`)
      list.forEach(c => {
        console.log(`  ID: ${c.id} | logoFileId: ${c.logoFileId} | fileId: ${c.fileId}`)
      })
    }
  }

  console.log('\n--- Gallery Items without media ---')
  const galleries = await prisma.galleryItem.findMany()
  const nullMediaGalleries = galleries.filter(g => !g.mediaFileId && !g.externalUrl)
  console.log(`Found ${nullMediaGalleries.length} GalleryItems with NO mediaFileId and NO externalUrl`)
  nullMediaGalleries.slice(0, 10).forEach(g => {
    console.log(`  ID: ${g.id} | Title: ${g.title} | Section: ${g.section}`)
  })
}

main().finally(() => console.log('Done'))
