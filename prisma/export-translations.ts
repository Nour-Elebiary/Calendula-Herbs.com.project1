import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const db = new PrismaClient()

async function main() {
  const products = await db.productTranslation.findMany()
  const categories = await db.categoryTranslation.findMany()
  const certs = await db.certificateTranslation.findMany()

  fs.writeFileSync(
    'prisma/db-translations-audit.json',
    JSON.stringify({ products, categories, certs }, null, 2)
  )
  console.log(`Exported:`)
  console.log(`  ${products.length} product translations`)
  console.log(`  ${categories.length} category translations`)
  console.log(`  ${certs.length} certificate translations`)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
