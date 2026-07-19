/**
 * seed-product-images-ai.mjs
 *
 * Batch-generates AI images for products missing them.
 *
 * Provider: Pollinations.ai (truly free, no API key, no rate limits)
 * Fallback: OpenRouter or Puter.js if set in .env
 *
 * Usage:
 *   node scripts/seed-product-images-ai.mjs
 */

import { PrismaClient } from '@prisma/client'
import { v2 as cloudinary } from 'cloudinary'
import { writeFile, unlink, mkdir } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'

// ── Cloudinary Config ─────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

const prisma = new PrismaClient()

const DELAY_MS = 1500  // Small delay between calls to be polite
const MAX_RETRIES = 3
const TMP_DIR = join(tmpdir(), 'calendula-ai-images')

await mkdir(TMP_DIR, { recursive: true })

// ── Prompt Templates ──────────────────────────────────────
const PROMPT_TEMPLATE = `High-quality commercial product photo of {NAME} ({SCIENTIFIC_NAME}), isolated on pure white background, studio lighting, professional commercial photography, sharp focus, 4K resolution, top-down flat lay angle`

function buildPrompt(product) {
  return PROMPT_TEMPLATE
    .replace('{NAME}', product.name)
    .replace('{SCIENTIFIC_NAME}', product.scientificName || product.name)
}

// ── Pollinations.ai (fully free, no API key needed) ──────
async function generateImage(prompt) {
  const url = new URL('https://image.pollinations.ai/prompt/' + encodeURIComponent(prompt))
  url.searchParams.set('width', '1024')
  url.searchParams.set('height', '1024')
  url.searchParams.set('nologo', 'true')
  url.searchParams.set('model', 'flux')

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`   Fetching (attempt ${attempt}/${MAX_RETRIES})...`)
      const response = await fetch(url.toString())
      if (!response.ok) {
        const text = await response.text()
        throw new Error(`HTTP ${response.status}: ${text.slice(0, 200)}`)
      }
      const buffer = Buffer.from(await response.arrayBuffer())
      console.log(`   Generated ${(buffer.length / 1024).toFixed(1)} KB`)
      return buffer
    } catch (err) {
      if (attempt === MAX_RETRIES) throw err
      console.warn(`   ⚠️ Retry ${attempt} failed: ${err.message}`)
      await new Promise(r => setTimeout(r, attempt * 3000))
    }
  }
}

// ── Cloudinary Upload ─────────────────────────────────────
async function uploadToCloudinary(buffer, slug) {
  const tmpPath = join(TMP_DIR, `${slug}.png`)
  await writeFile(tmpPath, buffer)

  console.log(`   Uploading to Cloudinary...`)
  const result = await cloudinary.uploader.upload(tmpPath, {
    folder: 'calendula-herbs/products',
    resource_type: 'image',
  })

  await unlink(tmpPath).catch(() => {})
  return result
}

// ── DB Record Creation ────────────────────────────────────
async function createMediaAndLink(product, cloudinaryResult) {
  const media = await prisma.mediaFile.create({
    data: {
      name: product.name,
      originalName: product.name,
      type: 'IMAGE',
      url: cloudinaryResult.secure_url,
      cloudinaryId: cloudinaryResult.public_id,
      thumbnailUrl: cloudinaryResult.secure_url.replace('/upload/', '/upload/w_400,q_auto/'),
      mimeType: 'image/png',
      sizeBytes: cloudinaryResult.bytes,
      width: cloudinaryResult.width || null,
      height: cloudinaryResult.height || null,
    },
  })
  console.log(`   → MediaFile: ${media.id}`)

  await prisma.productImage.create({
    data: { productId: product.id, mediaFileId: media.id, isPrimary: true, order: 0 },
  })
  console.log(`   → ProductImage linked ✅`)
}

// ── Main ──────────────────────────────────────────────────
async function main() {
  console.log('=== AI Product Image Generator (Pollinations.ai) ===\n')

  const allProducts = await prisma.product.findMany({
    where: { isActive: true },
    include: { images: { take: 1 } },
    orderBy: { order: 'asc' },
  })

  const missingProducts = allProducts.filter(p => p.images.length === 0)

  if (missingProducts.length === 0) {
    console.log('✅ All active products already have images!')
    await prisma.$disconnect()
    return
  }

  console.log(`📊 Found ${missingProducts.length} products without images:\n`)

  let success = 0
  let failed = 0

  for (let i = 0; i < missingProducts.length; i++) {
    const product = missingProducts[i]
    console.log(`\n[${i + 1}/${missingProducts.length}] ${product.name} (${product.slug})`)

    try {
      const prompt = buildPrompt(product)
      console.log(`   Prompt: ${prompt.slice(0, 100)}...`)

      const imageBuffer = await generateImage(prompt)
      const cloudResult = await uploadToCloudinary(imageBuffer, product.slug)
      await createMediaAndLink(product, cloudResult)

      success++

      if (i < missingProducts.length - 1) {
        console.log(`   Waiting ${DELAY_MS}ms...`)
        await new Promise(r => setTimeout(r, DELAY_MS))
      }
    } catch (err) {
      failed++
      console.error(`   ❌ ${err.message}`)
    }
  }

  console.log(`\n=== Summary ===`)
  console.log(`✅ ${success} images generated`)
  console.log(`❌ ${failed} failed`)
  await prisma.$disconnect()
}

main().catch(err => {
  console.error(`Fatal: ${err.message}`)
  process.exit(1)
})
