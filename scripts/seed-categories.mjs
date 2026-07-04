import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CATEGORIES = [
  { name: 'Herbs',    slug: 'herbs',    order: 0 },
  { name: 'Spices',   slug: 'spices',   order: 1 },
  { name: 'Specialty', slug: 'specialty', order: 2 },
]

async function main() {
  console.log('Seeding categories...')
  let created = 0
  for (const cat of CATEGORIES) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } })
    if (existing) {
      console.log(`SKIP ${cat.name} — already exists`)
      continue
    }
    await prisma.category.create({ data: cat })
    created++
    console.log(`CREATED ${cat.name} (${cat.slug})`)
  }
  console.log(`\nDone! ${created} categories created.`)
  await prisma.$disconnect()
}

main().catch(err => { console.error(err); process.exit(1) })
