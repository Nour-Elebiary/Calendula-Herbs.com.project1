import { readFileSync } from 'fs'
import { join } from 'path'

const messagesDir = join(__dirname, '..', 'src', 'messages')
const locales = ['en', 'ar', 'es', 'it', 'ja', 'ko', 'hi', 'ru', 'uk', 'pt-BR', 'zh-CN', 'fr', 'nl', 'de', 'bg', 'el', 'tr']

function collectKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null && !Array.isArray(v)
      ? collectKeys(v as Record<string, unknown>, `${prefix}${k}.`)
      : [`${prefix}${k}`]
  )
}

const enPath = join(messagesDir, 'en.json')
const enContent = JSON.parse(readFileSync(enPath, 'utf-8'))
const enKeys = collectKeys(enContent).sort()

let hasErrors = false

for (const locale of locales) {
  if (locale === 'en') continue
  const filePath = join(messagesDir, `${locale}.json`)
  const content = JSON.parse(readFileSync(filePath, 'utf-8'))
  const localeKeys = collectKeys(content).sort()

  const missing = enKeys.filter(k => !localeKeys.includes(k))
  const extra = localeKeys.filter(k => !enKeys.includes(k))

  if (missing.length > 0) {
    console.error(`❌ ${locale}: missing keys:\n  ${missing.join('\n  ')}`)
    hasErrors = true
  }
  if (extra.length > 0) {
    console.error(`⚠️  ${locale}: has extra keys not in en.json:\n  ${extra.join('\n  ')}`)
    hasErrors = true
  }
  if (missing.length === 0 && extra.length === 0) {
    console.log(`✅ ${locale}: all keys match en.json`)
  }
}

if (hasErrors) {
  console.error('\n❌ Locale consistency check failed!')
  process.exit(1)
} else {
  console.log('\n✅ All 17 locale files have identical key structure!')
}
