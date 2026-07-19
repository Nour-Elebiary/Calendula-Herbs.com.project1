import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const certs = await prisma.certificate.findMany({
    include: {
      translations: true,
      logo: true,
      file: true
    }
  })

  console.log(`Found ${certs.length} certificates total.`)
  for (const c of certs) {
    console.log(`[${c.id}] ${c.title} (Translations: ${c.translations.length}) | Active: ${c.isActive}`)
    console.log(`  -> Logo: ${c.logo?.url || 'NULL'} (ID: ${c.logoFileId || 'NULL'})`)
  }

  // Find duplicates based on title similarity
  console.log('\n--- Checking for duplicates ---')
  const activeCerts = certs.filter(c => c.isActive)
  const grouped = new Map()

  for (const c of activeCerts) {
    // Normalize title
    let norm = c.title.trim().toLowerCase()
      .replace(' certificate', '')
      .replace(' registration', '')
      .replace(' organic', '')
      .replace(':2018', '')
      .replace(':2015', '')
      .replace(' whitelist', '')
      .replace(' membership', '')
      .replace(' ( aec )', '')
    
    if (norm.includes('eu')) norm = 'eu'
    if (norm.includes('sedex')) norm = 'sedex'
    if (norm.includes('fec') || norm.includes('food export')) norm = 'fec'
    if (norm.includes('ahk')) norm = 'ahk'
    if (norm.includes('agricultural')) norm = 'aec'
    if (norm.includes('canadian')) norm = 'cor'

    if (!grouped.has(norm)) grouped.set(norm, [])
    grouped.get(norm).push(c)
  }

  for (const [norm, list] of grouped.entries()) {
    if (list.length > 1) {
      console.log(`\nDuplicate group: "${norm}"`)
      list.forEach((c: any) => console.log(` - [${c.id}] ${c.title} (Trans: ${c.translations.length}, Logo: ${c.logo?.url})`))
      
      // Keep the one with translations
      const withTrans = list.find((c: any) => c.translations.length > 0)
      const noTrans = list.filter((c: any) => c.translations.length === 0)
      
      if (withTrans && noTrans.length > 0) {
        // We have an old one and new ones
        for (const newer of noTrans) {
          if (newer.logoFileId && withTrans.logoFileId !== newer.logoFileId) {
             // If the older one doesn't have the new logo, or has a cloudinary one, update it!
             console.log(`   -> Updating old cert [${withTrans.id}] to use logo from [${newer.id}]`)
             await prisma.certificate.update({
               where: { id: withTrans.id },
               data: {
                 logoFileId: newer.logoFileId,
                 fileId: newer.fileId || withTrans.fileId
               }
             })
          }
          console.log(`   -> Deleting newer cert [${newer.id}]`)
          await prisma.certificate.delete({ where: { id: newer.id } })
        }
      }
    }
  }

  console.log('\nDone.')
}

main().catch(console.error).finally(() => prisma.$disconnect())
