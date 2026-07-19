import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixCOR() {
  const badCert = await prisma.certificate.findFirst({
    where: { title: 'COR ' }
  })
  
  if (badCert) {
    console.log('Found cert with title "COR "')
    await prisma.certificate.update({
      where: { id: badCert.id },
      data: { title: 'COR' }
    })
    console.log('Updated cert title to "COR"')
  }

  // Find the bad MediaFile
  const badMedia = await prisma.mediaFile.findFirst({
    where: { name: 'COR  Logo' } // Because it appended " Logo" to "COR "
  })

  if (badMedia) {
    console.log('Found media file with name "COR  Logo"')
    await prisma.mediaFile.update({
      where: { id: badMedia.id },
      data: {
        name: 'COR Logo',
        originalName: 'COR.png',
        url: '/certificates/Certificates Logos/COR.png',
        cloudinaryId: 'local/cert_logo_COR'
      }
    })
    console.log('Updated media file to COR.png')
  } else {
    // If we used the ID to upsert in seed-certs.ts: 
    // `cert_logo_${name.replace(/\s+/g, '_')}` => `cert_logo_COR_`
    const altMedia = await prisma.mediaFile.findUnique({
      where: { id: 'cert_logo_COR_' }
    })
    if (altMedia) {
      console.log('Found media file with id "cert_logo_COR_"')
      await prisma.mediaFile.update({
        where: { id: altMedia.id },
        data: {
          name: 'COR Logo',
          originalName: 'COR.png',
          url: '/certificates/Certificates Logos/COR.png',
        }
      })
      console.log('Updated media file to COR.png')
    }
  }

  // Also fix translations for COR if there are any
  if (badCert) {
    const translations = await prisma.certificateTranslation.findMany({
      where: { certificateId: badCert.id }
    })
    for (const t of translations) {
      if (t.title === 'COR ') {
        await prisma.certificateTranslation.update({
          where: {
            certificateId_locale: { certificateId: badCert.id, locale: t.locale }
          },
          data: { title: 'COR' }
        })
        console.log(`Fixed translation for ${t.locale}`)
      }
    }
  }
}

fixCOR()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
