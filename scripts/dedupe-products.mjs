import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

// Delete the old seed Calendula and Chamomile (keep the new ones with images)
const oldCalendula = await p.product.findUnique({ where: { slug: 'calendula' } })
const oldChamomile = await p.product.findUnique({ where: { slug: 'chamomile' } })

if (oldCalendula) {
  await p.productImage.deleteMany({ where: { productId: oldCalendula.id } })
  await p.productCategory.deleteMany({ where: { productId: oldCalendula.id } })
  await p.product.delete({ where: { id: oldCalendula.id } })
  console.log('Deleted old Calendula')
}
if (oldChamomile) {
  await p.productImage.deleteMany({ where: { productId: oldChamomile.id } })
  await p.productCategory.deleteMany({ where: { productId: oldChamomile.id } })
  await p.product.delete({ where: { id: oldChamomile.id } })
  console.log('Deleted old Chamomile')
}

const count = await p.product.count()
console.log(`Total products now: ${count}`)
await p.$disconnect()
