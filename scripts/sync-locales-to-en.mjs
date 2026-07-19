import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const messagesDir = join(__dirname, '..', 'src', 'messages')

const locales = ['en', 'ar', 'es', 'it', 'ja', 'ko', 'hi', 'ru', 'uk', 'pt-BR', 'zh-CN', 'fr', 'nl', 'de', 'bg', 'el', 'tr']

function ensureKeysMatch(source, target, path = '') {
  for (const [key, value] of Object.entries(source)) {
    const fullPath = path ? `${path}.${key}` : key
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      if (!target[key] || typeof target[key] !== 'object' || Array.isArray(target[key])) {
        target[key] = {}
      }
      ensureKeysMatch(value, target[key], fullPath)
    } else if (!(key in target) || typeof target[key] !== typeof value) {
      target[key] = value
    }
  }
}

const enContent = JSON.parse(readFileSync(join(messagesDir, 'en.json'), 'utf-8'))

for (const locale of locales) {
  if (locale === 'en') continue
  const filePath = join(messagesDir, `${locale}.json`)
  const content = JSON.parse(readFileSync(filePath, 'utf-8'))
  ensureKeysMatch(enContent, content)
  writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n')
  console.log(`✅ ${locale} synchronized`)
}

console.log('\n✅ All locales synchronized with en.json structure')
