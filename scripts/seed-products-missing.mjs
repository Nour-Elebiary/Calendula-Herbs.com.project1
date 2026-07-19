import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const NEW_PRODUCTS = [
  // ─── Spices ─────────────────────────────────────────────
  { name: 'Aniseed',         scientificName: 'Pimpinella anisum',        commonName: 'Aniseed', cuts: ['WHOLE', 'POWDER'], category: 'spices' },
  { name: 'Caraway',         scientificName: 'Carum Carvi',             commonName: 'Caraway', cuts: ['WHOLE', 'POWDER'], category: 'spices' },
  { name: 'Coriander Seeds', scientificName: 'Coriandrum sativum',      commonName: 'Coriander Seed', cuts: ['WHOLE', 'POWDER', 'CRUSHED'], category: 'spices' },
  { name: 'Cumin',           scientificName: 'Cuminum cyminum',         commonName: 'Cumin', cuts: ['WHOLE', 'POWDER'], category: 'spices' },
  { name: 'Fennel',          scientificName: 'Foeniculum vulgare',      commonName: 'Fennel', cuts: ['WHOLE', 'POWDER'], category: 'spices' },
  { name: 'Fenugreek',       scientificName: 'Trigonella foenum-graecum', commonName: 'Fenugreek', cuts: ['WHOLE', 'POWDER'], category: 'spices' },
  { name: 'Nigella',         scientificName: 'Nigella sativa',          commonName: 'Nigella / Black Seed', cuts: ['WHOLE', 'POWDER'], category: 'spices' },
  { name: 'Sesame',          scientificName: 'Sesamum indicum',         commonName: 'Sesame', cuts: ['WHOLE', 'POWDER'], category: 'spices' },
  { name: 'Flax',            scientificName: 'Linum usitatissimum',     commonName: 'Flax / Linseed', cuts: ['WHOLE', 'POWDER'], category: 'spices' },

  // ─── Specialty ──────────────────────────────────────────
  { name: 'Beet',            scientificName: 'Beta vulgaris',           commonName: 'Beetroot', cuts: ['WHOLE', 'POWDER'], category: 'specialty' },
  { name: 'Celery',          scientificName: 'Apium graveolens',        commonName: 'Celery', cuts: ['WHOLE', 'LEAF'], category: 'specialty' },
  { name: 'Chicory',         scientificName: 'Cichorium intybus',      commonName: 'Chicory', cuts: ['WHOLE', 'ROOT', 'POWDER'], category: 'specialty' },
  { name: 'Chilli',          scientificName: 'Capsicum frutescens',     commonName: 'Chilli Pepper', cuts: ['WHOLE', 'CRUSHED', 'POWDER'], category: 'specialty' },
  { name: 'Echinacea',       scientificName: 'Echinacea angustifolia',  commonName: 'Echinacea', cuts: ['WHOLE', 'ROOT', 'POWDER'], category: 'specialty' },
  { name: 'Garlic',          scientificName: 'Allium sativum',          commonName: 'Garlic', cuts: ['GRANULATED', 'POWDER'], category: 'specialty' },
  { name: 'Lemon',           scientificName: 'Citrus limon',            commonName: 'Lemon', cuts: ['WHOLE', 'POWDER'], category: 'specialty' },
  { name: 'Olive Leaves',    scientificName: 'Olea europaea',           commonName: 'Olive Leaf', cuts: ['WHOLE', 'LEAF', 'POWDER'], category: 'specialty' },
  { name: 'Onion',           scientificName: 'Allium cepa',             commonName: 'Onion', cuts: ['GRANULATED', 'POWDER'], category: 'specialty' },
  { name: 'Orange Peel',     scientificName: 'Citrus sinensis',         commonName: 'Orange Peel', cuts: ['WHOLE', 'POWDER'], category: 'specialty' },

  // ─── Herbs ──────────────────────────────────────────────
  { name: 'Parsley',         scientificName: 'Petroselinum crispum',    commonName: 'Parsley', cuts: ['WHOLE', 'LEAF'], category: 'herbs' },
]

async function main() {
  console.log('Seeding missing products...')

  // Get all categories
  const categories = {}
  for (const cat of await prisma.category.findMany()) {
    categories[cat.slug] = cat
  }

  let created = 0
  let skipped = 0

  for (const item of NEW_PRODUCTS) {
    const slug = slugify(item.name)
    const exists = await prisma.product.findUnique({ where: { slug } })
    if (exists) {
      console.log(`SKIP ${item.name} (${slug}) — already exists`)
      skipped++
      continue
    }

    const cat = categories[item.category]
    if (!cat) {
      console.log(`SKIP ${item.name} — category "${item.category}" not found. Run seed-categories.mjs first.`)
      skipped++
      continue
    }

    const product = await prisma.product.create({
      data: {
        name: item.name,
        scientificName: item.scientificName,
        commonName: item.commonName,
        slug,
        shortDescription: `Premium quality ${item.name.toLowerCase()} — grown in Egypt's fertile farms and processed to international standards.`,
        description: `<p>Premium quality ${item.name.toLowerCase()} (<em>${item.scientificName}</em>) sourced from Egypt's finest farms. Our ${item.name.toLowerCase()} is carefully cultivated, harvested at peak potency, and processed under strict quality controls to meet international standards.</p><p>Available in conventional and organic variants. Custom cut sizes and packaging options available for B2B partners.</p>`,
        availableCuts: item.cuts || [],
        minOrderKg: 500,
        isOrganic: true,
        isActive: true,
        categories: { create: { categoryId: cat.id } },
      },
    })

    created++
    console.log(`CREATED ${item.name} (${slug}) → ${item.category}`)
  }

  console.log(`\nDone! ${created} products created, ${skipped} skipped.`)
  await prisma.$disconnect()
}

main().catch(err => { console.error(err); process.exit(1) })
