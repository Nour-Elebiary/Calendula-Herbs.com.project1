import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const messagesDir = join(__dirname, '..', 'src', 'messages')

const locales = ['en', 'ar', 'es', 'it', 'ja', 'ko', 'hi', 'ru', 'uk', 'pt-BR', 'zh-CN', 'fr', 'nl', 'de', 'bg', 'el', 'tr']

function collectKeys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null && !Array.isArray(v)
      ? collectKeys(v, `${prefix}${k}.`)
      : [`${prefix}${k}`]
  )
}

function getValue(obj, keyPath) {
  const parts = keyPath.split('.')
  let current = obj
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined
    current = current[part]
  }
  return current
}

function removeExtraKeys(obj, keysToRemove, prefix = '') {
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (keysToRemove.has(fullKey) && typeof obj[key] !== 'object') {
      delete obj[key]
    } else if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      removeExtraKeys(obj[key], keysToRemove, fullKey)
    }
  }
}

const enContent = JSON.parse(readFileSync(join(messagesDir, 'en.json'), 'utf-8'))
const enKeys = new Set(collectKeys(enContent))

for (const locale of locales) {
  if (locale === 'en') continue
  const filePath = join(messagesDir, `${locale}.json`)
  const content = JSON.parse(readFileSync(filePath, 'utf-8'))
  const localeKeys = collectKeys(content)

  const extraKeys = localeKeys.filter(k => !enKeys.has(k))
  const missingKeys = [...enKeys].filter(k => !localeKeys.includes(k))

  // Remove extra keys
  if (extraKeys.length > 0) {
    const extraSet = new Set(extraKeys)
    removeExtraKeys(content, extraSet)
  }

  // Add faq.items for missing faq section
  // (the items were already added by add-faq-items.mjs)
  if (missingKeys.length > 0 && missingKeys.some(k => k.startsWith('faq.items'))) {
    content.faq = content.faq || {}
    content.faq.items = enContent.faq.items
  }

  writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n')
  console.log(`✅ ${locale}: removed ${extraKeys.length} extra keys, has ${[...enKeys].filter(k => localeKeys.filter(lk => !enKeys.has(lk)).length > 0 || !localeKeys.includes(k)).length} missing keys`)
}

console.log('\n✅ All locales synchronized with en.json')
