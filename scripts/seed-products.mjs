import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const HERBS = [
  { name: 'Alfalfa', scientificName: 'Medicago sativa' },
  { name: 'Basil', scientificName: 'Ocimum basilicum' },
  { name: 'Calendula Flowers', scientificName: 'Calendula officinalis' },
  { name: 'Chamomile Flowers', scientificName: 'Matricaria chamomilla' },
  { name: 'Cilantro (Coriander Leaves)', scientificName: 'Coriandrum sativum' },
  { name: 'Dill', scientificName: 'Anethum graveolens' },
  { name: 'Hibiscus', scientificName: 'Hibiscus sabdariffa' },
  { name: 'Molokhia', scientificName: 'Corchorus olitorius' },
  { name: 'Leek', scientificName: 'Allium ampeloprasum' },
  { name: 'Lemon Balm', scientificName: 'Melissa officinalis' },
  { name: 'Lemon Verbena', scientificName: 'Aloysia citrodora' },
  { name: 'Lemongrass', scientificName: 'Cymbopogon citratus' },
  { name: 'Licorice', scientificName: 'Glycyrrhiza glabra' },
  { name: 'Marjoram', scientificName: 'Origanum majorana' },
  { name: 'Mint Leaves - Peppermint', scientificName: 'Mentha × piperita' },
  { name: 'Mint Leaves - Spearmint', scientificName: 'Mentha spicata' },
  { name: 'Moringa Leaves', scientificName: 'Moringa oleifera' },
  { name: 'Nettle Leaves', scientificName: 'Urtica dioica' },
  { name: 'Oregano', scientificName: 'Origanum vulgare' },
  { name: 'Rose', scientificName: 'Rosa damascena' },
  { name: 'Rosemary', scientificName: 'Salvia rosmarinus' },
  { name: 'Sage', scientificName: 'Salvia officinalis' },
  { name: 'Senna', scientificName: 'Senna alexandrina' },
  { name: 'Thyme', scientificName: 'Thymus vulgaris' },
]

async function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const herbsCategory = await prisma.category.findUnique({ where: { slug: 'herbs' } })
if (!herbsCategory) throw new Error('Herbs category not found')

let created = 0
for (const herb of HERBS) {
  const slug = await slugify(herb.name)
  const exists = await prisma.product.findUnique({ where: { slug } })
  if (exists) {
    console.log(`SKIP ${herb.name} (slug: ${slug}) — already exists`)
    continue
  }
  const product = await prisma.product.create({
    data: {
      name: herb.name,
      scientificName: herb.scientificName,
      slug,
      shortDescription: `Premium quality ${herb.name.toLowerCase()} — grown in Egypt's fertile farms and processed to international standards.`,
      description: `<p>Premium quality ${herb.name.toLowerCase()} (<em>${herb.scientificName}</em>) sourced from Egypt's finest farms. Our ${herb.name.toLowerCase()} is carefully cultivated, harvested at peak potency, and processed under strict quality controls to meet international standards.</p><p>Available in conventional and organic variants. Custom cut sizes and packaging options available for B2B partners.</p>`,
      minOrderKg: 500,
      isActive: true,
      isFeatured: false,
      categories: { create: { categoryId: herbsCategory.id } },
    },
  })
  created++
  console.log(`CREATED ${herb.name} (${slug}) — ${product.id}`)
}

console.log(`\nDone! ${created} products created.`)
await prisma.$disconnect()
