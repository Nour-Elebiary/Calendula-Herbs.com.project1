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

// ─── API Configuration ────────────────────────────────────────────────────────
const KEYS = [
  env.GEMINI_API_KEY_1,
  env.GEMINI_API_KEY_2,
  env.GEMINI_API_KEY_3,
].filter(Boolean)

const PRIMARY_MODEL = 'gemini-flash-latest'
const FALLBACK_MODEL = 'gemini-2.0-flash'
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models'
const MESSAGES_DIR = 'src/messages'

const SOURCE_LOCALE = 'en'
const TARGET_LOCALES = [
  'ar', 'bg', 'de', 'el', 'es', 'fr', 'hi', 'it',
  'ja', 'ko', 'nl', 'pt-BR', 'ru', 'tr', 'uk', 'zh-CN',
]

// ─── Locale-specific rules ────────────────────────────────────────────────────
const LOCALE_RULES: Record<string, { name: string; rules: string[] }> = {
  ar: {
    name: 'Arabic',
    rules: [
      'Modern Standard Arabic (MSA) — فصحى العصر',
      'Formal business register for B2B export website',
      'Website navigation should use concise, natural Arabic UI terms',
      'Brand name: "كاليندولا هيربس" — use consistently across all pages',
    ],
  },
  bg: {
    name: 'Bulgarian',
    rules: [
      'Formal Вие-form throughout',
      'Cyrillic script',
      'Brand: "Календула Хърбс"',
    ],
  },
  de: {
    name: 'German',
    rules: [
      'Formal "Sie" form throughout',
      'Correct noun capitalization (all nouns capitalized)',
      'Brand: "Calendula Herbs" (proper name, keep English)',
    ],
  },
  el: {
    name: 'Greek',
    rules: [
      'Formal plural form throughout',
      'Greek script',
      'Brand: "Calendula Herbs"',
    ],
  },
  es: {
    name: 'Spanish',
    rules: [
      'Formal "usted" form throughout',
      'Standard Spanish (Latin American neutral — avoid region-specific slang)',
      'Brand: "Calendula Herbs"',
    ],
  },
  fr: {
    name: 'French',
    rules: [
      'Formal "vous" form throughout',
      'Correct accents on all letters (é, è, ê, ô, û, ç, etc.)',
      'Brand: "Calendula Herbs"',
    ],
  },
  hi: {
    name: 'Hindi',
    rules: [
      'Formal आप-form throughout (आपको, हैं, etc.)',
      'Devanagari script only — no transliterated English',
      'Brand: "कैलेंडुला हर्ब्स"',
    ],
  },
  it: {
    name: 'Italian',
    rules: [
      'Formal "Lei" form throughout',
      'Brand: "Calendula Herbs"',
    ],
  },
  ja: {
    name: 'Japanese',
    rules: [
      'Use 敬体/丁寧語 (formal desu-masu polite form) — never casual',
      'Brand: use "Calendula Herbs" in English (proper brand name)',
      'Navigation items should be concise Japanese (e.g., 製品, お問い合わせ)',
    ],
  },
  ko: {
    name: 'Korean',
    rules: [
      'Use 합쇼체 (formal polite speech)',
      'Brand: "칼렌둘라 허브스"',
      'Hangul script',
    ],
  },
  nl: {
    name: 'Dutch',
    rules: [
      'Formal "u" form throughout',
      'Brand: "Calendula Herbs"',
    ],
  },
  'pt-BR': {
    name: 'Portuguese (Brazil)',
    rules: [
      'Formal "você" / "senhor(a)" register',
      'Brazilian Portuguese variants (not European PT)',
      'Brand: "Calendula Herbs"',
    ],
  },
  ru: {
    name: 'Russian',
    rules: [
      'Formal Вы-form throughout',
      'Cyrillic script only',
      'Brand: "Календула Хербс"',
    ],
  },
  tr: {
    name: 'Turkish',
    rules: [
      'Formal "siz" form throughout',
      'Correct Turkish characters (ı, İ, ş, Ş, ç, Ç, ğ, Ğ, ö, Ö, ü, Ü)',
      'Brand: "Calendula Herbs"',
    ],
  },
  uk: {
    name: 'Ukrainian',
    rules: [
      'Formal Ви-form throughout',
      'Cyrillic script only — distinct from Russian vocabulary',
      'Brand: "Календула Хербс"',
    ],
  },
  'zh-CN': {
    name: 'Chinese Simplified',
    rules: [
      'Formal business Chinese (正式/商务用语)',
      'Simplified characters only — no Traditional Chinese',
      'Brand: "Calendula Herbs" or "金盏花草本" (can stay English as brand name)',
    ],
  },
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function flatten(obj: any, prefix: string): Record<string, string> {
  const result: Record<string, string> = {}
  for (const key of Object.keys(obj).sort()) {
    const val = obj[key]
    const path = prefix ? `${prefix}.${key}` : key
    if (Array.isArray(val)) {
      val.forEach((item, i) => {
        if (typeof item === 'object' && item !== null) {
          for (const sk of Object.keys(item)) {
            const sv = item[sk]
            if (typeof sv === 'string') {
              result[`${path}[${i}].${sk}`] = sv
            }
          }
        }
      })
    } else if (typeof val === 'object' && val !== null) {
      Object.assign(result, flatten(val, path))
    } else if (typeof val === 'string') {
      result[path] = val
    }
  }
  return result
}

function unflatten(flat: Record<string, string>): any {
  const root: any = {}
  for (const path of Object.keys(flat).sort()) {
    const parts = path.split('.')
    let current = root
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/)
      if (arrayMatch) {
        const arrKey = arrayMatch[1]
        const idx = parseInt(arrayMatch[2])
        if (!current[arrKey]) current[arrKey] = []
        if (!current[arrKey][idx]) current[arrKey][idx] = {}
        if (i === parts.length - 1) {
          current[arrKey][idx] = flat[path]
        } else {
          current = current[arrKey][idx]
        }
      } else {
        if (i === parts.length - 1) {
          current[part] = flat[path]
        } else {
          if (!current[part]) current[part] = {}
          current = current[part]
        }
      }
    }
  }
  return root
}

function validateNested(english: any, translated: any, path: string = ''): string[] {
  const errors: string[] = []
  for (const key of Object.keys(english)) {
    const p = path ? `${path}.${key}` : key
    const ev = english[key]
    const tv = translated[key]
    if (Array.isArray(ev)) {
      if (!Array.isArray(tv)) {
        errors.push(`${p}: expected array, got ${typeof tv}`)
      } else if (ev.length !== tv.length) {
        errors.push(`${p}: array length mismatch (${ev.length} vs ${tv.length})`)
      } else {
        for (let i = 0; i < ev.length; i++) {
          if (typeof ev[i] === 'object' && ev[i] !== null) {
            errors.push(...validateNested(ev[i], tv[i] || {}, `${p}[${i}]`))
          }
        }
      }
    } else if (typeof ev === 'object' && ev !== null) {
      if (typeof tv !== 'object' || tv === null || Array.isArray(tv)) {
        errors.push(`${p}: expected object, got ${typeof tv}`)
      } else {
        errors.push(...validateNested(ev, tv, p))
      }
    } else if (typeof ev === 'string') {
      if (typeof tv !== 'string') {
        errors.push(`${p}: expected string, got ${typeof tv}`)
      } else {
        const placeholders = ev.match(/\{[^}]+\}/g) || []
        for (const ph of placeholders) {
          if (!tv.includes(ph)) {
            errors.push(`${p}: missing placeholder ${ph} in translated value`)
          }
        }
      }
    }
  }
  return errors
}

async function callGemini(prompt: string, model: string, apiKey: string): Promise<string | null> {
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
        'X-goog-api-key': apiKey,
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

function buildPrompt(locale: string, flatSource: Record<string, string>): string {
  const ruleSet = LOCALE_RULES[locale] ?? { name: locale, rules: ['Use formal standard register'] }

  return `You are a professional B2B website translator for an Egyptian herb export company.

COMPANY: Calendula Herbs For Import & Export — premium B2B exporter of organic herbs, spices, and botanicals.

TASK: Translate the following website UI content from ENGLISH to ${ruleSet.name} (${locale}). This is the entire website content — navigation, homepage, product pages, FAQ, contact form, etc.

--- LOCALE-SPECIFIC RULES ---
${ruleSet.rules.map(r => `• ${r}`).join('\n')}

--- GENERAL RULES ---
• Professional B2B register — premium, trustworthy, approachable
• Brand taglines must be idiomatic and compelling in the target language (not word-for-word literal)
• FAQ questions and answers: natural, conversational B2B tone matching the English original's professionalism
• Navigation items and UI labels should be concise and follow web/mobile conventions
• Use industry-standard terminology for herb, spice, and botanical names
• Preserve ALL HTML tags exactly as-is — do not modify, add, or remove any: <br />, <p>, <ul>, <li>, <strong>, <a href="...">
• Preserve ALL template placeholders exactly as-is — they are app variables: {year}, {count}, {name}, {weight}, {field}, {min}, {max}, {date}, {cuts}, {index}
• Return ONLY valid JSON with the exact same keys as in the input — no markdown fences, no explanation, no extra commentary

Translate each value from English to ${ruleSet.name}. Keep all keys unchanged.

INPUT (flat key-value pairs):
${JSON.stringify(flatSource, null, 2)}

Return ONLY valid JSON.`
}

function tryParseJSON(text: string): any | null {
  let cleaned = text.trim()
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
  }
  try {
    return JSON.parse(cleaned)
  } catch (e) {
    return null
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('='.repeat(60))
  console.log('  Calendula Herbs — Message File Translation Script')
  console.log(`  Models: ${PRIMARY_MODEL} (primary) / ${FALLBACK_MODEL} (fallback)`)
  console.log(`  API keys available: ${KEYS.length}`)
  console.log('='.repeat(60))

  // Load English source
  const enPath = `${MESSAGES_DIR}/${SOURCE_LOCALE}.json`
  const englishNested = JSON.parse(fs.readFileSync(enPath, 'utf8'))
  const flatEnglish = flatten(englishNested, '')
  const totalKeys = Object.keys(flatEnglish).length

  console.log(`\nEnglish source: ${totalKeys} flattened keys\n`)

  let totalOk = 0
  let totalErrors = 0
  let totalSkipped = 0

  for (const locale of TARGET_LOCALES) {
    const localePath = `${MESSAGES_DIR}/${locale}.json`
    const ruleSet = LOCALE_RULES[locale]
    const langName = ruleSet?.name ?? locale

    if (!fs.existsSync(localePath)) {
      console.log(`  [${locale}] ${langName}: file not found — skipping`)
      totalSkipped++
      continue
    }

    process.stdout.write(`  [${locale}] ${langName}: translating ${totalKeys} keys... `)

    const prompt = buildPrompt(locale, flatEnglish)

    // Try each API key with primary model, then fallback model
    let responseText: string | null = null
    let usedKey: string | null = null
    let usedModel: string | null = null

    for (const key of KEYS) {
      responseText = await callGemini(prompt, PRIMARY_MODEL, key)
      if (responseText) {
        usedKey = key
        usedModel = PRIMARY_MODEL
        break
      }
      process.stdout.write('(primary failed, trying fallback) ')
      responseText = await callGemini(prompt, FALLBACK_MODEL, key)
      if (responseText) {
        usedKey = key
        usedModel = FALLBACK_MODEL
        break
      }
      if (KEYS.length > 1) process.stdout.write('(key exhausted, trying next key) ')
    }

    if (!responseText) {
      console.error(`FAILED — all keys and models exhausted`)
      totalErrors++
      continue
    }

    // Parse response
    const flatTranslated = tryParseJSON(responseText)
    if (!flatTranslated || typeof flatTranslated !== 'object' || Array.isArray(flatTranslated)) {
      console.error(`FAILED — invalid JSON response`)
      totalErrors++
      continue
    }

    // Unflatten to nested structure
    const translatedNested = unflatten(flatTranslated)

    // Validate structure and placeholders
    const validationErrors = validateNested(englishNested, translatedNested)
    if (validationErrors.length > 0) {
      console.error(`VALIDATION FAILED (${validationErrors.length} errors)`)
      for (const err of validationErrors.slice(0, 5)) {
        console.error(`    ${err}`)
      }
      totalErrors++
      continue
    }

    // Write the translated file
    fs.writeFileSync(localePath, JSON.stringify(translatedNested, null, 2) + '\n')

    console.log(`OK (${usedModel})`)
    totalOk++

    // Rate limit between locales
    await sleep(300)
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('  TRANSLATION COMPLETE')
  console.log('  ' + '='.repeat(40))
  console.log(`  Locales processed: ${totalOk}`)
  console.log(`  Errors: ${totalErrors}`)
  console.log(`  Skipped: ${totalSkipped}`)
  console.log('='.repeat(60))
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
