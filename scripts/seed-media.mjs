import { PrismaClient } from '@prisma/client'
import { v2 as cloudinary } from 'cloudinary'
import https from 'https'
import http from 'http'
import { pipeline } from 'stream'
import { createWriteStream, mkdirSync, unlinkSync, existsSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

cloudinary.config({
  cloud_name: 'dcukpuftg',
  api_key: '675339851565595',
  api_secret: 'Kzf1z9YSx8davluDFJF_yI9LwZg',
})

const prisma = new PrismaClient()

const TMP = join(tmpdir(), 'calendula-seed-media')
if (!existsSync(TMP)) mkdirSync(TMP, { recursive: true })

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest)
    ;(url.startsWith('https') ? https : http).get(url, (res) => {
      if (res.statusCode >= 300 && res.headers.location) {
        file.close()
        unlinkSync(dest)
        return download(res.headers.location, dest).then(resolve).catch(reject)
      }
      pipeline(res, file, (err) => err ? reject(err) : resolve())
    }).on('error', reject)
  })
}

async function uploadToCloudinary(filePath, folder) {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: folder || 'calendula-herbs',
    resource_type: 'auto',
  })
  return result
}

async function getOrCreateMedia(url, name, folder = 'products') {
  // check if already exists by url in MediaFile
  const existing = await prisma.mediaFile.findFirst({ where: { url } })
  if (existing) return existing

  const ext = url.split('.').pop().split('?')[0] || 'jpg'
  const tmpPath = join(TMP, `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`)
  
  console.log(`  Downloading ${name}...`)
  await download(url, tmpPath)
  
  console.log(`  Uploading to Cloudinary...`)
  const result = await uploadToCloudinary(tmpPath, `calendula-herbs/${folder}`)
  
  // cleanup
  try { unlinkSync(tmpPath) } catch {}

  const media = await prisma.mediaFile.create({
    data: {
      name,
      originalName: name,
      type: result.resource_type === 'image' ? 'IMAGE' : result.resource_type === 'video' ? 'VIDEO' : 'PDF',
      url: result.secure_url,
      cloudinaryId: result.public_id,
      thumbnailUrl: result.resource_type === 'image' ? result.secure_url.replace('/upload/', '/upload/w_400,q_auto/') : null,
      mimeType: `image/${ext}`,
      sizeBytes: result.bytes,
      width: result.width || null,
      height: result.height || null,
    },
  })
  console.log(`  → MediaFile: ${media.id}`)
  return media
}

async function setProductImage(productId, mediaFileId, isPrimary = false) {
  const existing = await prisma.productImage.findFirst({ where: { productId, mediaFileId } })
  if (existing) return
  await prisma.productImage.create({
    data: { productId, mediaFileId, isPrimary, order: isPrimary ? 0 : 1 },
  })
  console.log(`  → Linked to product ${productId}`)
}

// ─── Product Images ────────────────────────────────────────
const PRODUCT_IMAGES = [
  { slug: 'alfalfa', url: 'https://calendula-herbs.com/wp-content/uploads/2025/10/Image_fx-84.jpg', name: 'Alfalfa' },
  { slug: 'basil', url: 'https://calendula-herbs.com/wp-content/uploads/2025/10/Image_fx-87-1.jpg', name: 'Basil' },
  { slug: 'calendula-flowers', url: 'https://calendula-herbs.com/wp-content/uploads/2025/10/Image_fx-84-2.jpg', name: 'Calendula Flowers' },
  { slug: 'chamomile-flowers', url: 'https://calendula-herbs.com/wp-content/uploads/2025/10/Image_fx-84-3.jpg', name: 'Chamomile Flowers' },
  { slug: 'cilantro-coriander-leaves', url: 'https://calendula-herbs.com/wp-content/uploads/2025/10/Image_fx-87-4.jpg', name: 'Cilantro' },
  { slug: 'dill', url: 'https://calendula-herbs.com/wp-content/uploads/2025/10/Image_fx-87-5.jpg', name: 'Dill' },
  { slug: 'hibiscus', url: 'https://calendula-herbs.com/wp-content/uploads/2025/10/Image_fx-87-6.jpg', name: 'Hibiscus' },
  { slug: 'molokhia', url: 'https://calendula-herbs.com/wp-content/uploads/2025/10/Image_fx-86-7.jpg', name: 'Molokhia' },
  { slug: 'leek', url: 'https://calendula-herbs.com/wp-content/uploads/2025/10/Image_fx-87-8.jpg', name: 'Leek' },
  { slug: 'lemon-balm', url: 'https://calendula-herbs.com/wp-content/uploads/2025/11/Image_fx-85.jpg', name: 'Lemon Balm' },
  { slug: 'lemon-verbena', url: 'https://calendula-herbs.com/wp-content/uploads/2025/11/Image_fx-84-1.jpg', name: 'Lemon Verbena' },
  { slug: 'lemongrass', url: 'https://calendula-herbs.com/wp-content/uploads/2025/11/Image_fx-87-2.jpg', name: 'Lemongrass' },
  { slug: 'licorice', url: 'https://calendula-herbs.com/wp-content/uploads/2025/11/Image_fx-86-3.jpg', name: 'Licorice' },
  { slug: 'marjoram', url: 'https://calendula-herbs.com/wp-content/uploads/2025/11/Image_fx-85-4.jpg', name: 'Marjoram' },
  { slug: 'mint-leaves-peppermint', url: 'https://calendula-herbs.com/wp-content/uploads/2025/11/Image_fx-85-5.jpg', name: 'Peppermint' },
  { slug: 'mint-leaves-spearmint', url: 'https://calendula-herbs.com/wp-content/uploads/2025/11/Image_fx-86-6.jpg', name: 'Spearmint' },
  { slug: 'moringa-leaves', url: 'https://calendula-herbs.com/wp-content/uploads/2025/11/Image_fx-85-7.jpg', name: 'Moringa Leaves' },
  { slug: 'nettle-leaves', url: 'https://calendula-herbs.com/wp-content/uploads/2025/11/Image_fx-84-8.jpg', name: 'Nettle Leaves' },
  { slug: 'oregano', url: 'https://calendula-herbs.com/wp-content/uploads/2025/11/Image_fx-85-9.jpg', name: 'Oregano' },
  { slug: 'rose', url: 'https://calendula-herbs.com/wp-content/uploads/2025/11/Image_fx-87-10.jpg', name: 'Rose' },
  { slug: 'rosemary', url: 'https://calendula-herbs.com/wp-content/uploads/2025/11/Image_fx-84-11.jpg', name: 'Rosemary' },
  { slug: 'sage', url: 'https://calendula-herbs.com/wp-content/uploads/2025/11/Image_fx-84-12.jpg', name: 'Sage' },
  { slug: 'senna', url: 'https://calendula-herbs.com/wp-content/uploads/2025/11/Image_fx-87-13.jpg', name: 'Senna' },
  { slug: 'thyme', url: 'https://calendula-herbs.com/wp-content/uploads/2025/11/Image_fx-87-14.jpg', name: 'Thyme' },
]

// ─── Team Member Photos ────────────────────────────────────
const TEAM_PHOTOS = [
  { name: 'Rabie Mostafa', url: 'https://calendula-herbs.com/wp-content/uploads/2025/10/1696214480694-e1761651573684.jpeg' },
  { name: 'Nehad Elebiary', url: 'https://calendula-herbs.com/wp-content/uploads/2025/10/1758622051144.png' },
  { name: 'Sofy Sayed', url: 'https://calendula-herbs.com/wp-content/uploads/2025/10/1695296853572.jpeg' },
  { name: 'Nour Eldin Elebiary', url: 'https://calendula-herbs.com/wp-content/uploads/2025/10/1760615695597.jpeg' },
  { name: 'Mostafa Abdallah', url: 'https://calendula-herbs.com/wp-content/uploads/2025/10/1708002008891-e1761649550512.jpeg' },
  { name: 'Sameha Sabra', url: 'https://calendula-herbs.com/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-28-at-12.26.06-PM.jpeg' },
  { name: 'Ameera Ahmed', url: 'https://calendula-herbs.com/wp-content/uploads/2026/03/Ameera-e1774777746640.png' },
  { name: 'Habiba Mahmoud', url: 'https://calendula-herbs.com/wp-content/uploads/2026/03/Habiba.png' },
  { name: 'Walaa Ahmed', url: 'https://calendula-herbs.com/wp-content/uploads/2025/10/file.enc_.jpeg' },
  { name: 'Hanady Ammar', url: 'https://calendula-herbs.com/wp-content/uploads/2025/10/WhatsApp-Image-2025-10-28-at-3.10.53-PM-e1761654094296.jpeg' },
]

async function main() {
  console.log('=== Product Images ===')
  for (const p of PRODUCT_IMAGES) {
    const product = await prisma.product.findUnique({ where: { slug: p.slug } })
    if (!product) { console.log(`SKIP ${p.slug} — product not found`); continue }
    const existingImages = await prisma.productImage.findFirst({ where: { productId: product.id } })
    if (existingImages) { console.log(`SKIP ${p.name} — already has image`); continue }
    console.log(`\n${p.name} (${p.slug}):`)
    const media = await getOrCreateMedia(p.url, p.name, 'products')
    await setProductImage(product.id, media.id, true)
  }

  console.log('\n=== Team Photos ===')
  for (const t of TEAM_PHOTOS) {
    const member = await prisma.teamMember.findFirst({ where: { name: t.name } })
    if (!member) { console.log(`SKIP ${t.name} — not found`); continue }
    if (member.photoId) { console.log(`SKIP ${t.name} — already has photo`); continue }
    console.log(`\n${t.name}:`)
    const media = await getOrCreateMedia(t.url, `${t.name} Photo`, 'team')
    await prisma.teamMember.update({ where: { id: member.id }, data: { photoId: media.id } })
    console.log(`  → Photo set for ${t.name}`)
  }

  console.log('\n✅ Done!')
  await prisma.$disconnect()
}

main().catch(err => { console.error(err); process.exit(1) })
