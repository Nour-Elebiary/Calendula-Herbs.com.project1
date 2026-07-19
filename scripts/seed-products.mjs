import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const HERBS = [
  { name: 'Alfalfa', scientificName: 'Medicago sativa', commonName: 'Alfalfa', cuts: ['WHOLE', 'POWDER'] },
  { name: 'Basil', scientificName: 'Ocimum basilicum', commonName: 'Sweet Basil', cuts: ['WHOLE', 'CRUSHED', 'LEAF'] },
  { name: 'Calendula Flowers', scientificName: 'Calendula officinalis', commonName: 'Calendula / Marigold', cuts: ['WHOLE', 'CRUSHED', 'POWDER'] },
  { name: 'Chamomile Flowers', scientificName: 'Matricaria chamomilla', commonName: 'Chamomile', cuts: ['WHOLE', 'CRUSHED'] },
  { name: 'Cilantro (Coriander Leaves)', scientificName: 'Coriandrum sativum', commonName: 'Cilantro / Coriander Leaf', cuts: ['WHOLE', 'LEAF'] },
  { name: 'Dill', scientificName: 'Anethum graveolens', commonName: 'Dill', cuts: ['WHOLE', 'LEAF'] },
  { name: 'Hibiscus', scientificName: 'Hibiscus sabdariffa', commonName: 'Hibiscus / Roselle', cuts: ['WHOLE', 'CRUSHED', 'POWDER'] },
  { name: 'Molokhia', scientificName: 'Corchorus olitorius', commonName: 'Molokhia / Jute Leaf', cuts: ['WHOLE', 'LEAF', 'POWDER'] },
  { name: 'Leek', scientificName: 'Allium ampeloprasum', commonName: 'Leek', cuts: ['WHOLE', 'LEAF'] },
  { name: 'Lemon Balm', scientificName: 'Melissa officinalis', commonName: 'Lemon Balm', cuts: ['WHOLE', 'LEAF'] },
  { name: 'Lemon Verbena', scientificName: 'Aloysia citrodora', commonName: 'Lemon Verbena', cuts: ['WHOLE', 'LEAF'] },
  { name: 'Lemongrass', scientificName: 'Cymbopogon citratus', commonName: 'Lemongrass', cuts: ['WHOLE', 'CUT_SIFTED', 'POWDER'] },
  { name: 'Licorice', scientificName: 'Glycyrrhiza glabra', commonName: 'Licorice Root', cuts: ['WHOLE', 'CUT_SIFTED', 'POWDER', 'ROOT'] },
  { name: 'Marjoram', scientificName: 'Origanum majorana', commonName: 'Marjoram', cuts: ['WHOLE', 'CRUSHED', 'LEAF'] },
  { name: 'Mint Leaves - Peppermint', scientificName: 'Mentha × piperita', commonName: 'Peppermint', cuts: ['WHOLE', 'LEAF', 'CRUSHED'] },
  { name: 'Mint Leaves - Spearmint', scientificName: 'Mentha spicata', commonName: 'Spearmint', cuts: ['WHOLE', 'LEAF', 'CRUSHED'] },
  { name: 'Moringa Leaves', scientificName: 'Moringa oleifera', commonName: 'Moringa', cuts: ['WHOLE', 'LEAF', 'POWDER'] },
  { name: 'Nettle Leaves', scientificName: 'Urtica dioica', commonName: 'Nettle / Stinging Nettle', cuts: ['WHOLE', 'LEAF', 'POWDER'] },
  { name: 'Oregano', scientificName: 'Origanum vulgare', commonName: 'Oregano', cuts: ['WHOLE', 'CRUSHED', 'LEAF'] },
  { name: 'Rose', scientificName: 'Rosa damascena', commonName: 'Damask Rose', cuts: ['WHOLE', 'CRUSHED', 'POWDER'] },
  { name: 'Rosemary', scientificName: 'Salvia rosmarinus', commonName: 'Rosemary', cuts: ['WHOLE', 'LEAF', 'CRUSHED'] },
  { name: 'Sage', scientificName: 'Salvia officinalis', commonName: 'Sage', cuts: ['WHOLE', 'LEAF', 'CRUSHED'] },
  { name: 'Senna', scientificName: 'Senna alexandrina', commonName: 'Senna', cuts: ['WHOLE', 'LEAF', 'POWDER'] },
  { name: 'Thyme', scientificName: 'Thymus vulgaris', commonName: 'Thyme', cuts: ['WHOLE', 'CRUSHED', 'LEAF'] },
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
      commonName: herb.commonName,
      slug,
      shortDescription: `Premium quality ${herb.name.toLowerCase()} — grown in Egypt's fertile farms and processed to international standards.`,
      description: `<p>Premium quality ${herb.name.toLowerCase()} (<em>${herb.scientificName}</em>) sourced from Egypt's finest farms. Our ${herb.name.toLowerCase()} is carefully cultivated, harvested at peak potency, and processed under strict quality controls to meet international standards.</p><p>Available in conventional and organic variants. Custom cut sizes and packaging options available for B2B partners.</p>`,
      availableCuts: herb.cuts || [],
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
