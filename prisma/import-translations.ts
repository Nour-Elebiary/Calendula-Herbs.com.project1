import { PrismaClient } from '@prisma/client'
import fs from 'fs'

function loadEnv(path: string): Record<string, string> {
  const text = fs.readFileSync(path, 'utf8')
  const env: Record<string, string> = {}
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*(\w+)=["']?(.*?)["']?\s*$/)
    if (m) env[m[1]] = m[2].replace(/^"|"$/g, '')
  }
  return env
}

const env = loadEnv('.env.local')
process.env.DATABASE_URL = env.DIRECT_URL
process.env.DIRECT_URL = env.DIRECT_URL

const db = new PrismaClient()

const BATCH = 50

async function main() {
  const data = JSON.parse(fs.readFileSync('prisma/db-translations-audit.json', 'utf8'))
  const total = data.products.length + data.categories.length + data.certs.length

  console.log(`Importing ${total} records...`)

  let done = 0
  const tick = () => { done++; if (done % 100 === 0 || done === total) console.log(`  ${done}/${total}`) }

  for (let i = 0; i < data.products.length; i += BATCH) {
    const batch = data.products.slice(i, i + BATCH)
    const ops = batch.map((t: any) =>
      db.productTranslation.upsert({
        where: { productId_locale: { productId: t.productId, locale: t.locale } },
        update: { name: t.name, commonName: t.commonName, shortDescription: t.shortDescription, description: t.description },
        create: t,
      })
    )
    await db.$transaction(ops)
    done += batch.length
    if (done % 100 === 0 || done === total) console.log(`  ${done}/${total}`)
  }

  for (let i = 0; i < data.categories.length; i += BATCH) {
    const batch = data.categories.slice(i, i + BATCH)
    const ops = batch.map((t: any) =>
      db.categoryTranslation.upsert({
        where: { categoryId_locale: { categoryId: t.categoryId, locale: t.locale } },
        update: { name: t.name },
        create: t,
      })
    )
    await db.$transaction(ops)
    done += batch.length
    if (done % 100 === 0 || done === total) console.log(`  ${done}/${total}`)
  }

  for (let i = 0; i < data.certs.length; i += BATCH) {
    const batch = data.certs.slice(i, i + BATCH)
    const ops = batch.map((t: any) =>
      db.certificateTranslation.upsert({
        where: { certificateId_locale: { certificateId: t.certificateId, locale: t.locale } },
        update: { title: t.title, issuer: t.issuer, description: t.description },
        create: t,
      })
    )
    await db.$transaction(ops)
    done += batch.length
    if (done % 100 === 0 || done === total) console.log(`  ${done}/${total}`)
  }

  console.log(`\nDone. Updated ${done} records.`)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
