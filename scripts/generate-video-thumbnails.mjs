import { PrismaClient } from '@prisma/client'
import { v2 as cloudinary } from 'cloudinary'
import { setTimeout as sleep } from 'timers/promises'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

const POLLINATIONS_BASE = 'https://image.pollinations.ai/prompt'

const prisma = new PrismaClient()

async function uploadPlaceholderToCloudinary(title) {
  const prompt = `Calendula Herbs product video thumbnail, organic herbs, green and orange branding, ${title}`
  const pollinationsUrl = `${POLLINATIONS_BASE}/${encodeURIComponent(prompt)}`

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    const response = await fetch(pollinationsUrl, { signal: controller.signal })
    clearTimeout(timeout)

    if (!response.ok) {
      console.error(`  Pollinations returned ${response.status}`)
      return null
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'calendula-herbs/thumbnails',
          resource_type: 'image',
        },
        (err, result) => {
          if (err) reject(err)
          else resolve(result)
        }
      )
      uploadStream.end(buffer)
    })

    return result.secure_url
  } catch (err) {
    console.error(`  Failed to generate/upload placeholder:`, err.message || err)
    return null
  }
}

async function withRetry(fn, retries = 5, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (err) {
      if (i < retries - 1 && err?.message?.includes('Can\'t reach database server')) {
        console.log(`  DB connection failed, retrying in ${delay}ms (${i + 1}/${retries})...`)
        await sleep(delay)
      } else {
        throw err
      }
    }
  }
}

async function main() {
  console.log('Scanning for gallery items missing thumbnails...\n')

  const items = await withRetry(() => prisma.galleryItem.findMany({
    where: {
      thumbnailUrl: null,
      type: { in: ['UPLOADED_VIDEO', 'GOOGLE_DRIVE'] },
    },
    include: { mediaFile: true },
  }))

  console.log(`Found ${items.length} items needing thumbnails\n`)

  let updated = 0
  let skipped = 0

  for (const item of items) {
    const label = item.title || item.id

    if (item.type === 'UPLOADED_VIDEO') {
      const file = item.mediaFile
      if (!file?.cloudinaryId) {
        console.log(`  SKIP [${label}] — no cloudinaryId`)
        skipped++
        continue
      }

      const thumbnailUrl = cloudinary.url(file.cloudinaryId, {
        resource_type: 'video',
        format: 'jpg',
        width: 480,
        crop: 'thumb',
        secure: true,
      })

      await withRetry(() => prisma.galleryItem.update({
        where: { id: item.id },
        data: { thumbnailUrl },
      }))

      console.log(`  OK   [${label}] — Cloudinary video thumbnail`)
      updated++
    } else if (item.type === 'GOOGLE_DRIVE') {
      console.log(`  GEN  [${label}] — generating placeholder...`)
      let placeholderUrl = await uploadPlaceholderToCloudinary(label)

      if (!placeholderUrl) {
        // Fallback: try a second time
        await sleep(1000)
        placeholderUrl = await uploadPlaceholderToCloudinary(label)
      }

      if (placeholderUrl) {
        await withRetry(() => prisma.galleryItem.update({
          where: { id: item.id },
          data: { thumbnailUrl: placeholderUrl },
        }))
        console.log(`  OK   [${label}] — placeholder uploaded`)
        updated++
      } else {
        console.log(`  FAIL [${label}] — could not generate placeholder`)
        skipped++
      }
    }
  }

  console.log(`\nDone! ${updated} updated, ${skipped} skipped`)
  await withRetry(() => prisma.$disconnect())
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})
