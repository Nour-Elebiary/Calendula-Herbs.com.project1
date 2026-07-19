import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('--- Certificates ---')
  const certs = await prisma.certificate.findMany()
  certs.forEach(c => {
    console.log(`ID: ${c.id} | Title: ${c.titleEn} | LogoID: ${c.logoId}`)
  })
  
  console.log('\n--- Galleries ---')
  const galleries = await prisma.galleryItem.findMany()
  galleries.forEach(g => {
    console.log(`ID: ${g.id} | Title: ${g.titleEn} | MediaID: ${g.mediaId}`)
  })
}

main().finally(() => prisma.$disconnect())
