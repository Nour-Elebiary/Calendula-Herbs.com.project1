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
  { name: 'Aniseed',         scientificName: 'Pimpinella anisum',        category: 'spices' },
  { name: 'Caraway',         scientificName: 'Carum Carvi',             category: 'spices' },
  { name: 'Coriander Seeds', scientificName: 'Coriandrum sativum',      category: 'spices' },
  { name: 'Cumin',           scientificName: 'Cuminum cyminum',         category: 'spices' },
  { name: 'Fennel',          scientificName: 'Foeniculum vulgare',      category: 'spices' },
  { name: 'Fenugreek',       scientificName: 'Trigonella foenum-graecum', category: 'spices' },
  { name: 'Nigella',         scientificName: 'Nigella sativa',          category: 'spices' },
  { name: 'Sesame',          scientificName: 'Sesamum indicum',         category: 'spices' },
  { name: 'Flax',            scientificName: 'Linum usitatissimum',     category: 'spices' },

  // ─── Specialty ──────────────────────────────────────────
  { name: 'Beet',            scientificName: 'Beta vulgaris',           category: 'specialty' },
  { name: 'Celery',          scientificName: 'Apium graveolens',        category: 'specialty' },
  { name: 'Chicory',         scientificName: 'Cichorium intybus',      category: 'specialty' },
  { name: 'Chilli',          scientificName: 'Capsicum frutescens',     category: 'specialty' },
  { name: 'Echinacea',       scientificName: 'Echinacea angustifolia',  category: 'specialty' },
  { name: 'Garlic',          scientificName: 'Allium sativum',          category: 'specialty' },
  { name: 'Lemon',           scientificName: 'Citrus limon',            category: 'specialty' },
  { name: 'Olive Leaves',    scientificName: 'Olea europaea',           category: 'specialty' },
  { name: 'Onion',           scientificName: 'Allium cepa',             category: 'specialty' },
  { name: 'Orange Peel',     scientificName: 'Citrus sinensis',         category: 'specialty' },

  // ─── Herbs ──────────────────────────────────────────────
  { name: 'Parsley',         scientificName: 'Petroselinum crispum',    category: 'herbs' },
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
        slug,
        shortDescription: `Premium quality ${item.name.toLowerCase()} — grown in Egypt's fertile farms and processed to international standards.`,
        description: `<p>Premium quality ${item.name.toLowerCase()} (<em>${item.scientificName}</em>) sourced from Egypt's finest farms. Our ${item.name.toLowerCase()} is carefully cultivated, harvested at peak potency, and processed under strict quality controls to meet international standards.</p><p>Available in conventional and organic variants. Custom cut sizes and packaging options available for B2B partners.</p>`,
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
