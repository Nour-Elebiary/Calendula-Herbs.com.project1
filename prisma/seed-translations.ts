import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const NON_ENGLISH_LOCALES = [
  'ar', 'es', 'it', 'ja', 'ko', 'hi', 'ru', 'uk',
  'pt-BR', 'zh-CN', 'fr', 'nl', 'de', 'bg', 'el', 'tr',
]

const LOCALES_SUPPORTED_BY_LIBRETRANSLATE = new Set([
  'ar', 'es', 'it', 'ja', 'ko', 'ru', 'uk',
  'pt', 'zh', 'fr', 'nl', 'de', 'bg', 'el', 'tr',
])

function libreTarget(locale: string): string | null {
  if (locale === 'pt-BR') return 'pt'
  if (locale === 'zh-CN') return 'zh'
  return LOCALES_SUPPORTED_BY_LIBRETRANSLATE.has(locale) ? locale : null
}

async function translateText(text: string, targetLocale: string): Promise<string> {
  const target = libreTarget(targetLocale)
  if (!target || !text.trim()) return text

  try {
    const res = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: text, source: 'en', target }),
    })
    if (!res.ok) {
      console.warn(`  LibreTranslate returned ${res.status} for "${text}" → ${target}`)
      return text
    }
    const data = await res.json() as { translatedText: string }
    return data.translatedText || text
  } catch (err) {
    console.warn(`  LibreTranslate request failed for "${text}" → ${target}: ${err}`)
    return text
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

function wrapInParagraphs(text: string): string {
  if (!text.trim()) return text
  const lines = text.split('\n').filter(Boolean)
  if (lines.length <= 1 && !text.includes('. ')) {
    return `<p>${text}</p>`
  }
  return lines.map(l => `<p>${l}</p>`).join('\n')
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function seedProductTranslations() {
  console.log('\n─── Product Translations ───\n')

  const products = await db.product.findMany({ include: { translations: true } })
  console.log(`Found ${products.length} products`)

  for (const product of products) {
    const enTranslation = product.translations.find(t => t.locale === 'en')
    const en = enTranslation ?? {
      name: product.name,
      scientificName: product.scientificName,
      commonName: product.commonName,
      shortDescription: product.shortDescription,
      description: product.description,
    }

    console.log(`\nProduct: ${en.name} (${product.id})`)

    for (const locale of NON_ENGLISH_LOCALES) {
      if (locale === 'hi') {
        await db.productTranslation.upsert({
          where: { productId_locale: { productId: product.id, locale } },
          create: {
            productId: product.id,
            locale,
            name: en.name,
            scientificName: product.scientificName,
            commonName: en.commonName,
            shortDescription: en.shortDescription,
            description: en.description,
          },
          update: {
            name: en.name,
            commonName: en.commonName,
            shortDescription: en.shortDescription,
            description: en.description,
          },
        })
        console.log(`  ${locale}: skipped (Hindi not supported, copied English)`)
        continue
      }

      const translatedName = await translateText(en.name, locale)
      await sleep(100)

      const translatedCommonName = en.commonName
        ? await translateText(en.commonName, locale)
        : null
      await sleep(100)

      const translatedShortDesc = en.shortDescription
        ? await translateText(en.shortDescription, locale)
        : null
      await sleep(100)

      let translatedDesc: string | null = null
      if (en.description) {
        const plainText = stripHtml(en.description)
        const translatedPlain = await translateText(plainText, locale)
        translatedDesc = wrapInParagraphs(translatedPlain)
        await sleep(100)
      }

      await db.productTranslation.upsert({
        where: { productId_locale: { productId: product.id, locale } },
        create: {
          productId: product.id,
          locale,
          name: translatedName,
          scientificName: product.scientificName,
          commonName: translatedCommonName,
          shortDescription: translatedShortDesc,
          description: translatedDesc,
        },
        update: {
          name: translatedName,
          commonName: translatedCommonName,
          shortDescription: translatedShortDesc,
          description: translatedDesc,
        },
      })

      console.log(`  ${locale}: ✓`)
    }
  }
}

async function seedCategoryTranslations() {
  console.log('\n─── Category Translations ───\n')

  const categories = await db.category.findMany({ include: { translations: true } })
  console.log(`Found ${categories.length} categories`)

  for (const category of categories) {
    const enTranslation = category.translations.find(t => t.locale === 'en')
    const enName = enTranslation?.name ?? category.name

    console.log(`\nCategory: ${enName} (${category.id})`)

    for (const locale of NON_ENGLISH_LOCALES) {
      if (locale === 'hi') {
        await db.categoryTranslation.upsert({
          where: { categoryId_locale: { categoryId: category.id, locale } },
          create: { categoryId: category.id, locale, name: enName },
          update: { name: enName },
        })
        console.log(`  ${locale}: skipped (Hindi not supported, copied English)`)
        continue
      }

      const translatedName = await translateText(enName, locale)
      await sleep(100)

      await db.categoryTranslation.upsert({
        where: { categoryId_locale: { categoryId: category.id, locale } },
        create: { categoryId: category.id, locale, name: translatedName },
        update: { name: translatedName },
      })

      console.log(`  ${locale}: ✓`)
    }
  }
}

async function main() {
  console.log('=== Seed Translations ===\n')
  console.log('Target locales:', NON_ENGLISH_LOCALES.join(', '))

  await seedProductTranslations()
  await seedCategoryTranslations()

  console.log('\n=== Done ===')
}

main()
  .catch(e => {
    console.error('Fatal error:', e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
