import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
const prods = await p.product.findMany({ select: { id: true, slug: true, name: true } })
for (const pr of prods) console.log(pr.id, pr.slug, pr.name)
await p.$disconnect()
