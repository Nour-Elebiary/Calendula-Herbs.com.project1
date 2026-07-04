import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Create gallery sections
const GALLERIES = [
  { name: 'Events', slug: 'events', description: 'Our participation in exhibitions and industry events' },
  { name: 'Interviews & TV', slug: 'interviews-tv', description: 'TV interviews and media appearances' },
  { name: 'Our Factory', slug: 'factory', description: 'Our processing and packaging facilities' },
  { name: 'Our Farms', slug: 'farms', description: 'Herb cultivation and farming operations' },
  { name: 'Shipments', slug: 'shipments', description: 'Export shipments around the world' },
]

const SECTION_MAP = {
  'events': 'EVENTS',
  'interviews-tv': 'INTERVIEWS_TV',
  'factory': 'FACTORY',
  'farms': 'FARMS',
  'shipments': 'SHIPMENTS',
}

// YouTube review videos from homepage
const YT_VIDEOS = [
  { id: 'Ug6LE_5O900', title: 'Customer Review 1' },
  { id: '0fcF065tojQ', title: 'Customer Review 2' },
  { id: '7zH5ZuIG1Qw', title: 'Customer Review 3' },
  { id: 'Vgu7vUvCCsc', title: 'Customer Review 4' },
  { id: 'i9RjS7dOASM', title: 'Customer Review 5' },
  { id: 'acXZqIGWB00', title: 'Customer Review 6' },
]

let created = 0
for (const g of GALLERIES) {
  const exists = await prisma.gallery.findUnique({ where: { slug: g.slug } })
  if (exists) { console.log(`SKIP gallery "${g.name}"`); continue }
  
  await prisma.gallery.create({
    data: {
      name: g.name,
      slug: g.slug,
      description: g.description,
      isActive: true,
      order: created,
    },
  })
  console.log(`CREATED gallery "${g.name}"`)
  created++
}

// Add YouTube videos to Interviews & TV gallery
const tvGallery = await prisma.gallery.findUnique({ where: { slug: 'interviews-tv' } })
if (tvGallery) {
  const existingItems = await prisma.galleryItem.count({ where: { galleryId: tvGallery.id } })
  if (existingItems === 0) {
    for (const v of YT_VIDEOS) {
      await prisma.galleryItem.create({
        data: {
          galleryId: tvGallery.id,
          type: 'YOUTUBE',
          section: 'INTERVIEWS_TV',
          externalUrl: `https://www.youtube.com/watch?v=${v.id}`,
          externalId: v.id,
          thumbnailUrl: `https://img.youtube.com/vi/${v.id}/hqdefault.jpg`,
          title: v.title,
          isActive: true,
        },
      })
    }
    console.log(`Added ${YT_VIDEOS.length} YouTube videos to "${tvGallery.name}" gallery`)
  } else {
    console.log(`SKIP YouTube videos — ${existingItems} items already exist`)
  }
}

const total = await prisma.gallery.count()
const items = await prisma.galleryItem.count()
console.log(`\nDone! ${total} galleries, ${items} gallery items`)
await prisma.$disconnect()
