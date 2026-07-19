import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const messagesDir = join(__dirname, '..', 'src', 'messages')
const locales = [
  'en', 'ar', 'es', 'it', 'ja', 'ko', 'hi', 'ru',
  'uk', 'pt-BR', 'zh-CN', 'fr', 'nl', 'de', 'bg', 'el', 'tr',
]

function readJson(locale) {
  return JSON.parse(readFileSync(join(messagesDir, `${locale}.json`), 'utf-8'))
}

function collectKeys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null && !Array.isArray(v)
      ? collectKeys(v, `${prefix}${k}.`)
      : `${prefix}${k}`
  )
}

function collectArrayKeys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) => {
    const key = `${prefix}${k}`
    if (Array.isArray(v)) {
      return v.length > 0 && typeof v[0] === 'object'
        ? [`${key}[]`]
        : [key]
    }
    if (typeof v === 'object' && v !== null) {
      return collectArrayKeys(v, `${key}.`)
    }
    return [key]
  })
}

const en = readJson('en')
const enKeys = collectKeys(en)
const enArrayKeys = collectArrayKeys(en)

let exitCode = 0

for (const locale of locales) {
  if (locale === 'en') continue

  const messages = readJson(locale)
  const localeKeys = collectKeys(messages)
  const localeArrayKeys = collectArrayKeys(messages)

  const missing = enKeys.filter(k => !localeKeys.includes(k))
  const extra = localeKeys.filter(k => !enKeys.includes(k))
  const arrayDiff = enArrayKeys.filter(k => !localeArrayKeys.includes(k))

  if (missing.length > 0) {
    console.error(`❌ ${locale}: missing ${missing.length} keys:`)
    missing.forEach(k => console.error(`   - ${k}`))
    exitCode = 1
  }
  if (extra.length > 0) {
    console.warn(`⚠ ${locale}: ${extra.length} extra keys (not in en.json)`)
    extra.forEach(k => console.warn(`   - ${k}`))
  }
  if (arrayDiff.length > 0) {
    console.error(`❌ ${locale}: missing ${arrayDiff.length} array keys:`)
    arrayDiff.forEach(k => console.error(`   - ${k}`))
    exitCode = 1
  }
  if (missing.length === 0 && arrayDiff.length === 0) {
    console.log(`✅ ${locale}: all keys match en.json`)
  }
}

process.exit(exitCode)
