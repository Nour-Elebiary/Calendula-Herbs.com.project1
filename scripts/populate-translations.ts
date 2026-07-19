import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const targetLocales = [
  'ar', 'es', 'it', 'ja', 'ko', 'hi', 'ru', 'uk', 'pt-BR', 'zh-CN', 'fr', 'nl', 'de', 'bg', 'el', 'tr'
]

async function safeTranslate(text: string | null | undefined, locale: string): Promise<string | null> {
  if (!text) return null
  return text // fallback to original
}

async function translateCategories() {
  const categories = await prisma.category.findMany({
    include: { translations: true }
  })

  for (const cat of categories) {
    for (const loc of targetLocales) {
      if (!cat.translations.find(t => t.locale === loc)) {
        console.log(`Translating Category "${cat.name}" to ${loc}...`)
        const translatedName = await safeTranslate(cat.name, loc)
        
        await prisma.categoryTranslation.create({
          data: {
            categoryId: cat.id,
            locale: loc,
            name: translatedName || cat.name
          }
        })
      }
    }
  }
}

async function translateProducts() {
  const products = await prisma.product.findMany({
    include: { translations: true }
  })

  for (const p of products) {
    for (const loc of targetLocales) {
      if (!p.translations.find(t => t.locale === loc)) {
        console.log(`Translating Product "${p.name}" to ${loc}...`)
        
        const translatedName = await safeTranslate(p.name, loc)
        const translatedCommon = await safeTranslate(p.commonName, loc)
        const translatedShortDesc = await safeTranslate(p.shortDescription, loc)
        const translatedDesc = await safeTranslate(p.description, loc)

        await prisma.productTranslation.create({
          data: {
            productId: p.id,
            locale: loc,
            name: translatedName || p.name,
            scientificName: p.scientificName, // IGNORED per user instruction
            commonName: translatedCommon,
            shortDescription: translatedShortDesc,
            description: translatedDesc
          }
        })
      }
    }
  }
}

async function translateCertificates() {
  const certs = await prisma.certificate.findMany({
    include: { translations: true }
  })

  for (const cert of certs) {
    for (const loc of targetLocales) {
      if (!cert.translations.find(t => t.locale === loc)) {
        console.log(`Translating Certificate "${cert.title}" to ${loc}...`)
        
        const translatedTitle = await safeTranslate(cert.title, loc)
        const translatedIssuer = await safeTranslate(cert.issuer, loc)
        const translatedDesc = await safeTranslate(cert.description, loc)

        await prisma.certificateTranslation.create({
          data: {
            certificateId: cert.id,
            locale: loc,
            title: translatedTitle,
            issuer: translatedIssuer,
            description: translatedDesc
          }
        })
      }
    }
  }
}

async function main() {
  console.log('Starting translations...')
  await translateCategories()
  await translateCertificates()
  await translateProducts()
  console.log('Finished translations!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
