import { PrismaClient } from '@prisma/client'
import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs/promises'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

const SECTION_MAP: Record<string, any> = {
  'Events': 'EVENTS',
  'Factory': 'FACTORY',
  'Farm': 'FARMS',
  'Interviews & TV': 'INTERVIEWS_TV',
  'Shipments': 'SHIPMENTS',
  'Visits': 'VISITS'
}

async function uploadFile(filePath: string, folder: string, resourceType: 'image' | 'video'): Promise<any> {
  const safeFolder = folder.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(filePath, { folder: `galleries/${safeFolder}`, resource_type: resourceType }, (error, result) => {
      if (error) reject(error)
      else resolve(result)
    })
  })
}

async function processDirectory(baseDir: string, resourceType: 'image' | 'video', itemType: 'UPLOADED_IMAGE' | 'UPLOADED_VIDEO') {
  const categories = await fs.readdir(baseDir)
  for (const category of categories) {
    const categoryPath = path.join(baseDir, category)
    const stat = await fs.stat(categoryPath)
    if (!stat.isDirectory()) continue

    const section = SECTION_MAP[category]
    if (!section) {
      console.warn(`Unknown category: ${category}`)
      continue
    }

    // Find or create gallery
    const slug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    let gallery = await prisma.gallery.findUnique({ where: { slug } })
    if (!gallery) {
      const maxOrder = await prisma.gallery.aggregate({ _max: { order: true } })
      const order = (maxOrder._max.order ?? -1) + 1
      gallery = await prisma.gallery.create({
        data: {
          name: category,
          slug,
          order,
          isActive: true
        }
      })
      console.log(`Created gallery: ${category}`)
    } else {
      console.log(`Found gallery: ${category}`)
    }

    // Get max order for items
    let maxItemOrderAggr = await prisma.galleryItem.aggregate({
      _max: { order: true },
      where: { galleryId: gallery.id }
    })
    let currentItemOrder = (maxItemOrderAggr._max.order ?? -1) + 1

    const files = await fs.readdir(categoryPath)
    for (const file of files) {
      const filePath = path.join(categoryPath, file)
      const fileStat = await fs.stat(filePath)
      if (!fileStat.isFile()) continue

      // Skip if already in database
      const existingMedia = await prisma.mediaFile.findFirst({
        where: { name: file }
      })
      if (existingMedia) {
        console.log(`Skipped (already exists): ${file}`)
        continue
      }

      console.log(`Uploading ${filePath}...`)
      try {
        const result = await uploadFile(filePath, category, resourceType)

        // Create MediaFile
        const mediaFile = await prisma.mediaFile.create({
          data: {
            name: file,
            originalName: file,
            type: resourceType === 'image' ? 'IMAGE' : 'VIDEO',
            url: result.secure_url,
            cloudinaryId: result.public_id,
            mimeType: result.format, // simplified
            sizeBytes: result.bytes,
            width: result.width,
            height: result.height,
            duration: result.duration
          }
        })

        // Create GalleryItem
        await prisma.galleryItem.create({
          data: {
            galleryId: gallery.id,
            type: itemType,
            section: section,
            mediaFileId: mediaFile.id,
            order: currentItemOrder++,
            isActive: true
          }
        })
        console.log(`Successfully added: ${file}`)
      } catch (e) {
        console.error(`Failed to process ${file}:`, e)
      }
    }
  }
}

async function main() {
  const imagesDir = path.resolve('E:\\Calendula Herbs Website Project\\Resources\\Images')
  const videosDir = path.resolve('E:\\Calendula Herbs Website Project\\Resources\\Videos')

  try {
    const imagesStat = await fs.stat(imagesDir)
    if (imagesStat.isDirectory()) {
      console.log('Processing Images...')
      await processDirectory(imagesDir, 'image', 'UPLOADED_IMAGE')
    }
  } catch (e) {
    console.error('Images directory not found or error:', e)
  }

  try {
    const videosStat = await fs.stat(videosDir)
    if (videosStat.isDirectory()) {
      console.log('Processing Videos...')
      await processDirectory(videosDir, 'video', 'UPLOADED_VIDEO')
    }
  } catch (e) {
    console.error('Videos directory not found or error:', e)
  }

  console.log('Done.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
