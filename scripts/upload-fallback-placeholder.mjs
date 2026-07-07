import { PrismaClient } from '@prisma/client'
import { v2 as cloudinary } from 'cloudinary'
import { setTimeout as sleep } from 'timers/promises'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

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

// SVG placeholder with brand colors
const svgPlaceholder = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360">
  <rect width="480" height="360" fill="#2D5A27"/>
  <text x="240" y="160" font-family="Georgia, serif" font-size="28" fill="#DC7E18" text-anchor="middle" font-weight="bold">CALENDULA HERBS</text>
  <text x="240" y="200" font-family="Arial, sans-serif" font-size="14" fill="#ffffff" text-anchor="middle">Video Gallery</text>
  <text x="240" y="260" font-family="Arial, sans-serif" font-size="12" fill="#8FBA8B" text-anchor="middle">Click to play</text>
  <!-- Play button triangle -->
  <polygon points="240,215 240,245 265,230" fill="#DC7E18" opacity="0.8"/>
</svg>`

async function main() {
  console.log('Uploading fallback placeholder image to Cloudinary...\n')

  const buffer = Buffer.from(svgPlaceholder)

  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'calendula-herbs/thumbnails', resource_type: 'image', public_id: 'video-placeholder' },
      (err, result) => { if (err) reject(err); else resolve(result) }
    )
    uploadStream.end(buffer)
  })

  console.log(`Fallback placeholder uploaded: ${result.secure_url}\n`)

  // Find remaining items with null thumbnails (GOOGLE_DRIVE only now)
  const items = await withRetry(() => prisma.galleryItem.findMany({
    where: { thumbnailUrl: null, type: 'GOOGLE_DRIVE' },
  }))

  console.log(`Found ${items.length} Google Drive items to update with fallback thumbnail\n`)

  let updated = 0
  for (const item of items) {
    await withRetry(() => prisma.galleryItem.update({
      where: { id: item.id },
      data: { thumbnailUrl: result.secure_url },
    }))
    console.log(`  OK   [${item.title || item.id}] — fallback placeholder`)
    updated++
  }

  console.log(`\nDone! ${updated} items updated`)
  await withRetry(() => prisma.$disconnect())
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
