import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

const certs = await p.certificate.findMany()
console.log('Certificates:', certs.length)
for (const c of certs) console.log(' -', c.id, c.title, c.imageUrl)

const gal = await p.galleryItem.findMany()
console.log('Gallery items:', gal.length)

const inquiries = await p.inquiry.findMany({ orderBy: { createdAt: 'desc' }, take: 5 })
console.log('Recent inquiries:', inquiries.length)
for (const i of inquiries) console.log(' -', i.id, i.name, i.email, i.message?.slice(0,60))

await p.$disconnect()
