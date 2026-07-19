import { readdirSync, statSync } from 'fs'
import { resolve, extname, basename } from 'path'
import { cloudinary } from '../src/lib/cloudinary'
import { PrismaClient, GallerySection } from '@prisma/client'

const prisma = new PrismaClient()

const SECTION_MAP: Record<string, GallerySection> = {
  'Events': 'EVENTS',
  'Factory': 'FACTORY',
  'Farm': 'FARMS',
  'Interviews & TV': 'INTERVIEWS_TV',
  'Shipments': 'SHIPMENTS',
  'Visits': 'VISITS',
}

const RESOURCES_ROOT = resolve(__dirname, '../../Resources')

function getMediaType(ext: string): 'IMAGE' | 'VIDEO' {
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
  return imageExts.includes(ext.toLowerCase()) ? 'IMAGE' : 'VIDEO'
}

function getGalleryItemType(ext: string): 'UPLOADED_IMAGE' | 'UPLOADED_VIDEO' {
  return getMediaType(ext) === 'IMAGE' ? 'UPLOADED_IMAGE' : 'UPLOADED_VIDEO'
}

function sanitizeFolder(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_')
}

async function uploadFile(filePath: string, folder: string): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: `resources/${sanitizeFolder(folder)}`,
    resource_type: 'auto',
  })
  return { url: result.secure_url, publicId: result.public_id }
}

async function main() {
  console.log('Scanning Resources folder...\n')

  const imagesDir = resolve(RESOURCES_ROOT, 'Images')
  const videosDir = resolve(RESOURCES_ROOT, 'Videos')
  let totalUploaded = 0
  let totalSkipped = 0

  const sectionGalleries = new Map<string, string>()

  const processDir = async (dir: string, mediaType: 'IMAGE' | 'VIDEO') => {
    const folderName = basename(dir)
    const sectionKey = SECTION_MAP[folderName]
    if (!sectionKey) {
      console.log(`  ⏭️  Skipping "${folderName}" — no section mapping`)
      return
    }

    if (!sectionGalleries.has(sectionKey)) {
      const slug = `resources-${sectionKey.toLowerCase()}`
      const gallery = await prisma.gallery.upsert({
        where: { slug },
        update: {},
        create: {
          name: `${folderName} Resources`,
          slug,
          description: `Auto-uploaded ${folderName} resources`,
          isActive: true,
        },
      })
      sectionGalleries.set(sectionKey, gallery.id)
      console.log(`  📁 Gallery "${gallery.name}" ready (id: ${gallery.id})`)
    }
    const galleryId = sectionGalleries.get(sectionKey)!

    const files = readdirSync(dir).filter(f => {
      const ext = extname(f).toLowerCase()
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.mp4', '.mov', '.avi', '.webm'].includes(ext)
    })

    let maxOrder = await prisma.galleryItem.count({
      where: { galleryId },
    })

    for (const file of files) {
      const filePath = resolve(dir, file)
      const existing = await prisma.mediaFile.findFirst({
        where: { name: file },
      })

      if (existing) {
        const dup = await prisma.galleryItem.findFirst({
          where: { galleryId, mediaFileId: existing.id },
        })
        if (!dup) {
          console.log(`  ⏭️  "${file}" already exists as MediaFile — creating GalleryItem`)
          await prisma.galleryItem.create({
            data: {
              galleryId,
              type: getGalleryItemType(extname(file)),
              section: sectionKey,
              mediaFileId: existing.id,
              title: basename(file, extname(file)),
              order: maxOrder++,
              isActive: true,
            },
          })
        } else {
          console.log(`  ⏭️  "${file}" already exists — skipping`)
        }
        totalSkipped++
        continue
      }

      try {
        console.log(`  📤 Uploading "${file}"...`)
        const { url, publicId } = await uploadFile(filePath, folderName)

        const sizeBytes = statSync(filePath).size
        const media = await prisma.mediaFile.create({
          data: {
            name: file,
            originalName: file,
            url,
            cloudinaryId: publicId,
            type: mediaType,
            mimeType: mediaType === 'IMAGE' ? 'image/jpeg' : 'video/mp4',
            sizeBytes,
          },
        })

        await prisma.galleryItem.create({
          data: {
            galleryId,
            type: getGalleryItemType(extname(file)),
            section: sectionKey,
            mediaFileId: media.id,
            title: basename(file, extname(file)),
            order: maxOrder++,
            isActive: true,
          },
        })

        totalUploaded++
      } catch (err) {
        console.error(`  ❌ Failed "${file}":`, err)
      }
    }
  }

  // Process Images
  for (const entry of readdirSync(imagesDir)) {
    const fullPath = resolve(imagesDir, entry)
    if (statSync(fullPath).isDirectory()) {
      console.log(`\n📷 Images/${entry}`)
      await processDir(fullPath, 'IMAGE')
    }
  }

  // Process Videos
  if (statSync(videosDir).isDirectory()) {
    for (const entry of readdirSync(videosDir)) {
      const fullPath = resolve(videosDir, entry)
      if (statSync(fullPath).isDirectory()) {
        console.log(`\n🎬 Videos/${entry}`)
        await processDir(fullPath, 'VIDEO')
      }
    }
  }

  console.log(`\n✅ Done! Uploaded: ${totalUploaded}, Skipped: ${totalSkipped}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
