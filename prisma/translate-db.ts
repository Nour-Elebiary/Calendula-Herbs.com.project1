import { PrismaClient } from '@prisma/client'
import fs from 'fs'

function loadEnv(path: string): Record<string, string> {
  const text = fs.readFileSync(path, 'utf8')
  const env: Record<string, string> = {}
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*(\w+)=["']?(.*?)["']?\s*$/)
    if (m) env[m[1]] = m[2].replace(/^"|"$/g, '')
  }
  return env
}

const env = loadEnv('.env.local')

const db = new PrismaClient({
  datasourceUrl: env.DIRECT_URL || env.DATABASE_URL,
})

// ─── API Configuration ────────────────────────────────────────────────────────
const API_KEY = env.GEMINI_API_KEY_1 || env.GEMINI_API_KEY_2 || env.GEMINI_API_KEY_3
const PRIMARY_MODEL = 'gemini-flash-latest'
const FALLBACK_MODEL = 'gemini-2.0-flash'
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

const AUDIT_FILE = 'prisma/db-translations-audit.json'

const LOCALES = [
  'ar', 'bg', 'de', 'el', 'es', 'fr', 'hi', 'it',
  'ja', 'ko', 'nl', 'pt-BR', 'ru', 'tr', 'uk', 'zh-CN',
]

type ProductEn = { id: string; name: string; scientificName: string | null; commonName: string | null; shortDescription: string | null; description: string | null }
type CategoryEn = { id: string; name: string }
type CertificateEn = { id: string; title: string; issuer: string | null; description: string | null }

// ─── Locale-specific translation rules ────────────────────────────────────────
const LOCALE_RULES: Record<string, { name: string; rules: string[] }> = {
  ar: {
    name: 'Arabic',
    rules: [
      'Use Modern Standard Arabic (MSA) — فصحى العصر',
      'Formal business register appropriate for B2B export correspondence',
      'Brand name: "كاليندولا هيربس" — use consistently',
      'Use industry-standard botanical trade names (بابونج not كاموميل)',
      'Translate MOSH/MOAH as "زيوت معدية موس/موأ" with brief parenthetical explanation on first use',
    ],
  },
  ja: {
    name: 'Japanese',
    rules: [
      'Use 敬体/丁寧語 (formal desu-masu polite form) — never casual',
      'Brand: use "Calendula Herbs" in English (it is understood as a proper brand name)',
      'Use katakana for foreign plant names where no established kanji exists',
      'Industry terminology: カモミール (chamomile), レモングラス (lemongrass), etc.',
    ],
  },
  ko: {
    name: 'Korean',
    rules: [
      'Use 합쇼체 (formal polite speech) — 해요체 is too casual for B2B',
      'Brand: "칼렌둘라 허브스"',
      'Use established Korean trade names for herbs where they exist',
      'Keep English scientific names in parentheses where helpful',
    ],
  },
  hi: {
    name: 'Hindi',
    rules: [
      'Use formal आप-form throughout (आपको, हैं, etc.)',
      'Brand: "कैलेंडुला हर्ब्स"',
      'Use standard Hindi names for herbs: नींबू घास (lemongrass), पुदीना (peppermint), etc.',
      'Devanagari script only — no transliterated English',
    ],
  },
  zhCN: {
    name: 'Chinese Simplified',
    rules: [
      'Use formal business Chinese (正式/商务用语)',
      'Simplified characters only — no Traditional Chinese',
      'Brand: "金盏花草本" or "Calendula Herbs" (brand name, can stay English)',
      'Use established Chinese trade names for herbs',
    ],
  },
  de: {
    name: 'German',
    rules: [
      'Use formal "Sie" form throughout',
      'Use established German botanical trade names (Kamille, Pfefferminze, etc.)',
      'Correct noun capitalization (all nouns capitalized)',
      'Brand: "Calendula Herbs" (proper name, keep English)',
    ],
  },
  fr: {
    name: 'French',
    rules: [
      'Use formal "vous" form throughout',
      'Correct accents on all letters (é, è, ê, ô, û, ç, etc.)',
      'Use French botanical trade names (Camomille, Menthe poivrée, etc.)',
      'Brand: "Calendula Herbs"',
    ],
  },
  es: {
    name: 'Spanish',
    rules: [
      'Use formal "usted" form throughout',
      'Use Spanish/Latin American botanical trade names',
      'Brand: "Calendula Herbs"',
    ],
  },
  it: {
    name: 'Italian',
    rules: [
      'Use formal "Lei" form throughout',
      'Use Italian botanical trade names (Camomilla, Menta piperita, etc.)',
      'Brand: "Calendula Herbs"',
    ],
  },
  nl: {
    name: 'Dutch',
    rules: [
      'Use formal "u" form throughout',
      'Use Dutch trade names where established',
      'Brand: "Calendula Herbs"',
    ],
  },
  ptBR: {
    name: 'Portuguese (Brazil)',
    rules: [
      'Use formal "você" / "senhor(a)" register',
      'Brazilian Portuguese variants (not European PT)',
      'Use Brazilian trade names for herbs',
      'Brand: "Calendula Herbs"',
    ],
  },
  ru: {
    name: 'Russian',
    rules: [
      'Use formal Вы-form throughout',
      'Cyrillic script only',
      'Use established Russian trade names (Ромашка, Мята перечная, etc.)',
      'Brand: "Календула Хербс"',
    ],
  },
  uk: {
    name: 'Ukrainian',
    rules: [
      'Use formal Ви-form throughout',
      'Cyrillic script only — distinct from Russian vocabulary',
      'Use Ukrainian trade names (Ромашка, М\'ята перцева, etc.)',
      'Brand: "Календула Хербс"',
    ],
  },
  bg: {
    name: 'Bulgarian',
    rules: [
      'Use formal Вие-form throughout',
      'Cyrillic script',
      'Use Bulgarian trade names for herbs',
      'Brand: "Календула Хърбс"',
    ],
  },
  el: {
    name: 'Greek',
    rules: [
      'Use formal plural form throughout',
      'Greek script',
      'Use Greek trade names for herbs',
      'Brand: "Calendula Herbs"',
    ],
  },
  tr: {
    name: 'Turkish',
    rules: [
      'Use formal "siz" form throughout',
      'Use Turkish botanical trade names (Papatya, Nane, etc.)',
      'Correct Turkish characters (ı, İ, ş, Ş, ç, Ç, ğ, Ğ, ö, Ö, ü, Ü)',
      'Brand: "Calendula Herbs"',
    ],
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function callGemini(prompt: string, model: string): Promise<string | null> {
  const url = `${API_BASE}/${model}:generateContent`

  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': API_KEY,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error(`  API error (${res.status}): ${errText.substring(0, 200)}`)
      return null
    }

    const data = await res.json() as any

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      console.error(`  No text in response. Finish reason: ${data?.candidates?.[0]?.finishReason ?? 'unknown'}`)
      return null
    }

    return text
  } catch (err) {
    console.error(`  Network error: ${err}`)
    return null
  }
}

function buildProductPromptItems(prods: any[], productEnMap: Map<string, ProductEn>): any[] {
  return prods.map(p => {
    const en = productEnMap.get(p.productId)
    if (!en) return null

    return {
      type: 'product',
      id: p.productId,
      locale: p.locale,
      en_name: en.name,
      en_commonName: en.commonName ?? null,
      en_scientificName: en.scientificName ?? null,
      en_shortDescription: en.shortDescription ?? null,
      en_description: en.description ?? null,
      needsTranslation: {
        name: true,
        commonName: en.commonName !== null,
        shortDescription: en.shortDescription !== null,
        description: en.description !== null,
      },
    }
  }).filter(Boolean)
}

function buildCategoryPromptItems(cats: any[], catEnMap: Map<string, CategoryEn>): any[] {
  return cats.map(c => {
    const en = catEnMap.get(c.categoryId)
    if (!en) return null

    return {
      type: 'category',
      id: c.categoryId,
      locale: c.locale,
      en_name: en.name,
      needsTranslation: { name: true },
    }
  }).filter(Boolean)
}

function buildCertPromptItems(certs: any[], certEnMap: Map<string, CertificateEn>): any[] {
  return certs.map(c => {
    const en = certEnMap.get(c.certificateId)
    if (!en) return null

    return {
      type: 'certificate',
      id: c.certificateId,
      locale: c.locale,
      en_title: en.title,
      en_issuer: en.issuer ?? null,
      en_description: en.description ?? null,
      needsTranslation: {
        title: true,
        issuer: en.issuer !== null,
        description: en.description !== null,
      },
    }
  }).filter(Boolean)
}

function buildPrompt(
  locale: string,
  prods: any[],
  cats: any[],
  certs: any[],
  productEnMap: Map<string, ProductEn>,
  catEnMap: Map<string, CategoryEn>,
  certEnMap: Map<string, CertificateEn>,
): string {
  const ruleSet = LOCALE_RULES[locale] ?? { name: locale.toUpperCase(), rules: ['Use formal standard register'] }
  const langName = ruleSet.name

  const promptItems = [
    ...buildProductPromptItems(prods, productEnMap),
    ...buildCategoryPromptItems(cats, catEnMap),
    ...buildCertPromptItems(certs, certEnMap),
  ]

  if (promptItems.length === 0) return ''

  return `You are a professional B2B translator specializing in agricultural and herbal product catalogs.

Company: Calendula Herbs For Import & Export — an Egyptian exporter of premium herbs, spices, and natural products to global B2B buyers.

TASK: Translate the following records from ENGLISH to ${langName} (${locale}).

--- LOCALE-SPECIFIC RULES ---
${ruleSet.rules.map(r => `• ${r}`).join('\n')}

--- GENERAL RULES ---
• Use formal/professional business register throughout
• Preserve ALL HTML tags in description fields exactly as-is — do not modify, add, or remove any HTML
• NEVER translate scientific names (they are Latin) — keep them verbatim
• Keep certification acronyms untranslated: ISO, EU, USDA, GAP, GHP, MOSH/MOAH, HALAL, KOSHER, NOP, COR, JAS, BIO_SUISSE
• Use industry-standard trade names for each herb in the target language
• Product names should be concise and follow trade conventions (not literal translations)
• Boolean field "needsTranslation" tells you which fields must be translated — skip any field marked false
• Return ONLY valid JSON — no markdown fences, no explanation, no commentary

Below is a JSON array of records to translate. Each record includes the English source text for reference.
Return a JSON array of objects with ONLY the fields "type", "id", and the translated text fields.

INPUT RECORDS:
${JSON.stringify(promptItems, null, 2)}

Return ONLY valid JSON array.`
}

function tryParseJSON(text: string, label: string): any | null {
  // Strip markdown fences if present
  let cleaned = text.trim()
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
  }

  try {
    return JSON.parse(cleaned)
  } catch (e) {
    console.error(`  Failed to parse JSON for ${label}: ${(e as Error).message.substring(0, 100)}`)
    return null
  }
}

function applyProductTranslation(record: any, translation: any): any {
  const tFields = translation ?? {}
  if (tFields.name) record.name = tFields.name
  if (tFields.commonName !== undefined) record.commonName = tFields.commonName ?? null
  if (tFields.shortDescription !== undefined) record.shortDescription = tFields.shortDescription ?? null
  if (tFields.description !== undefined) record.description = tFields.description ?? null
  return record
}

function applyCategoryTranslation(record: any, translation: any): any {
  if (translation?.name) record.name = translation.name
  return record
}

function applyCertTranslation(record: any, translation: any): any {
  const tFields = translation ?? {}
  if (tFields.title) record.title = tFields.title
  if (tFields.issuer !== undefined) record.issuer = tFields.issuer ?? null
  if (tFields.description !== undefined) record.description = tFields.description ?? null
  return record
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('='.repeat(60))
  console.log('  Calendula Herbs — DB Translation Batch Script')
  console.log('  Using: Gemini Flash latest (primary) / Gemini 2.0 Flash (fallback)')
  console.log('='.repeat(60))

  // Step 1: Query English source content
  console.log('\n[1/4] Querying English source content from DB...')
  const sourceProducts = await db.product.findMany({
    select: { id: true, name: true, scientificName: true, commonName: true, shortDescription: true, description: true },
    where: { isActive: true },
  })
  const sourceCategories = await db.category.findMany({
    select: { id: true, name: true },
  })
  const sourceCerts = await db.certificate.findMany({
    select: { id: true, title: true, issuer: true, description: true },
    where: { isActive: true },
  })

  const productEnMap = new Map<string, ProductEn>(sourceProducts.map(p => [p.id, p]))
  const catEnMap = new Map<string, CategoryEn>(sourceCategories.map(c => [c.id, c]))
  const certEnMap = new Map<string, CertificateEn>(sourceCerts.map(c => [c.id, c]))

  console.log(`  Products (EN source): ${sourceProducts.length}`)
  console.log(`  Categories (EN source): ${sourceCategories.length}`)
  console.log(`  Certificates (EN source): ${sourceCerts.length}`)

  // Step 2: Read existing translations
  console.log('\n[2/4] Reading existing translations from audit file...')
  if (!fs.existsSync(AUDIT_FILE)) {
    console.error(`  ERROR: ${AUDIT_FILE} not found. Run export-translations.ts first.`)
    process.exit(1)
  }

  const auditData = JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf8'))
  console.log(`  Products (translations): ${auditData.products.length}`)
  console.log(`  Categories (translations): ${auditData.categories.length}`)
  console.log(`  Certificates (translations): ${auditData.certs.length}`)

  // Step 3: Translate each locale
  console.log('\n[3/4] Translating via Gemini API...')

  let totalTranslated = 0
  let totalErrors = 0
  let totalSkipped = 0

  for (const locale of LOCALES) {
    const ruleSet = LOCALE_RULES[locale]
    const langName = ruleSet?.name ?? locale

    const localeProds = auditData.products.filter((p: any) => p.locale === locale)
    const localeCats = auditData.categories.filter((c: any) => c.locale === locale)
    const localeCerts = auditData.certs.filter((c: any) => c.locale === locale)

    const recordCount = localeProds.length + localeCats.length + localeCerts.length

    if (recordCount === 0) {
      console.log(`  [${locale}] ${langName}: 0 records — skipping`)
      totalSkipped++
      continue
    }

    console.log(`\n  [${locale}] ${langName}: ${localeProds.length}p + ${localeCats.length}c + ${localeCerts.length}cert = ${recordCount} records`)

    const prompt = buildPrompt(locale, localeProds, localeCats, localeCerts, productEnMap, catEnMap, certEnMap)
    if (!prompt) {
      console.log(`    Skipping — no matching English source found`)
      totalSkipped++
      continue
    }

    // Try primary model, then fallback
    let responseText = await callGemini(prompt, PRIMARY_MODEL)
    if (!responseText) {
      console.log(`    Retrying with fallback model: ${FALLBACK_MODEL}`)
      responseText = await callGemini(prompt, FALLBACK_MODEL)
    }

    if (!responseText) {
      console.error(`    FAILED — both models returned no response`)
      totalErrors++
      continue
    }

    // Parse response JSON
    const translations = tryParseJSON(responseText, locale)
    if (!translations || !Array.isArray(translations)) {
      console.error(`    FAILED — response is not a valid JSON array`)
      totalErrors++
      continue
    }

    console.log(`    Raw response: ${translations.length} items`)

    // Apply translations back to audit data
    let applied = 0
    for (const item of translations) {
      if (!item || !item.id) continue

      if (item.type === 'product' || !item.type) {
        const idx = auditData.products.findIndex((p: any) => p.productId === item.id && p.locale === locale)
        if (idx !== -1) {
          auditData.products[idx] = applyProductTranslation(auditData.products[idx], item)
          applied++
        }
      } else if (item.type === 'category') {
        const idx = auditData.categories.findIndex((c: any) => c.categoryId === item.id && c.locale === locale)
        if (idx !== -1) {
          auditData.categories[idx] = applyCategoryTranslation(auditData.categories[idx], item)
          applied++
        }
      } else if (item.type === 'certificate') {
        const idx = auditData.certs.findIndex((c: any) => c.certificateId === item.id && c.locale === locale)
        if (idx !== -1) {
          auditData.certs[idx] = applyCertTranslation(auditData.certs[idx], item)
          applied++
        }
      }
    }

    totalTranslated += applied
    console.log(`    Applied translations: ${applied} records`)

    // Rate limit: 200ms between locales
    await sleep(200)
  }

  // Step 4: Write corrected audit file
  console.log('\n[4/4] Writing corrected translations to audit file...')
  fs.writeFileSync(AUDIT_FILE, JSON.stringify(auditData, null, 2))
  console.log(`  Written: ${AUDIT_FILE}`)

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('  TRANSLATION COMPLETE')
  console.log('  ' + '='.repeat(40))
  console.log(`  Locales processed: ${LOCALES.length}`)
  console.log(`  Records translated: ${totalTranslated}`)
  console.log(`  Errors: ${totalErrors}`)
  console.log(`  Skipped: ${totalSkipped}`)
  console.log('')
  console.log('  NEXT STEP: Run the import script to push to Supabase:')
  console.log('  pnpm tsx prisma/import-translations.ts')
  console.log('='.repeat(60))
}

main()
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
