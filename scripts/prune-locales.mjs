import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const messagesDir = join(__dirname, '..', 'src', 'messages')

const locales = ['ar', 'es', 'it', 'ja', 'ko', 'hi', 'ru', 'uk', 'pt-BR', 'zh-CN', 'fr', 'nl', 'de', 'bg', 'el', 'tr']

function collectKeys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null && !Array.isArray(v)
      ? collectKeys(v, `${prefix}${k}.`)
      : [`${prefix}${k}`]
  )
}

function getByPath(obj, path) {
  return path.split('.').reduce((o, k) => o?.[k], obj)
}

function delByPath(obj, path) {
  const parts = path.split('.')
  const key = parts.pop()
  const parent = parts.reduce((o, k) => o?.[k], obj)
  if (parent) delete parent[key]
}

const enContent = JSON.parse(readFileSync(join(messagesDir, 'en.json'), 'utf-8'))
const enKeys = new Set(collectKeys(enContent))

for (const locale of locales) {
  const filePath = join(messagesDir, `${locale}.json`)
  const content = JSON.parse(readFileSync(filePath, 'utf-8'))
  const localeKeys = collectKeys(content)

  const extra = localeKeys.filter(k => !enKeys.has(k))
  for (const k of extra) delByPath(content, k)

  writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n')
  console.log(`✅ ${locale}: removed ${extra.length} extra keys`)
}

console.log('\n✅ All locales pruned')
