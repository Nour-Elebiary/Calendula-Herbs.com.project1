import { PrismaClient } from '@prisma/client'
import { setTimeout as sleep } from 'timers/promises'

const prisma = new PrismaClient()

async function withRetry(fn, retries = 5, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try { return await fn() }
    catch (err) {
      if (i < retries - 1 && err?.message?.includes("Can't reach database server")) {
        console.log(`  DB retry ${i + 1}/${retries}...`)
        await sleep(delay)
      } else { throw err }
    }
  }
}

async function main() {
  console.log('Fixing GOOGLE_DRIVE thumbnails to use real Google Drive thumbnail URLs...\n')

  const items = await withRetry(() => prisma.galleryItem.findMany({
    where: { type: 'GOOGLE_DRIVE', externalId: { not: null } },
  }))

  console.log(`Found ${items.length} GOOGLE_DRIVE items with externalId\n`)

  let updated = 0
  let skipped = 0

  for (const item of items) {
    const thumbnailUrl = `https://drive.google.com/thumbnail?id=${item.externalId}&sz=w480`

    if (item.thumbnailUrl === thumbnailUrl) {
      console.log(`  SAME [${item.id}] — already correct`)
      skipped++
      continue
    }

    await withRetry(() => prisma.galleryItem.update({
      where: { id: item.id },
      data: { thumbnailUrl },
    }))

    console.log(`  OK   [${item.id}] — ${thumbnailUrl}`)
    updated++
  }

  console.log(`\nDone! ${updated} updated, ${skipped} skipped`)
  await withRetry(() => prisma.$disconnect())
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
