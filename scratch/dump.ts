import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

async function main() {
  const certs = await prisma.certificate.findMany({ include: { translations: true } })
  const galleries = await prisma.galleryItem.findMany({ include: { mediaFile: true } })
  
  fs.writeFileSync('scratch/certs.json', JSON.stringify(certs, null, 2))
  fs.writeFileSync('scratch/galleries.json', JSON.stringify(galleries, null, 2))
}

main().finally(() => console.log('Done'))
