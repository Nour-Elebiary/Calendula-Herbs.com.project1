import { readFileSync, readdirSync, statSync } from 'fs'
import { join, dirname, extname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const envExample = readFileSync(join(root, '.env.example'), 'utf-8')
const exampleVars = [...envExample.matchAll(/^(\w+)=/gm)].map(m => m[1])

function findEnvRefs(dir) {
  const refs = new Set()
  const entries = readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory() && !entry.name.startsWith('node_modules') && !entry.name.startsWith('.')) {
      for (const r of findEnvRefs(full)) refs.add(r)
    } else if (entry.isFile() && /\.(ts|tsx|js|mjs)$/.test(entry.name)) {
      const content = readFileSync(full, 'utf-8')
      const matches = content.matchAll(/process\.env\.(\w+)/g)
      for (const m of matches) refs.add(m[1])
    }
  }
  return [...refs]
}

const codeVars = findEnvRefs(join(root, 'src'))

const notInCode = exampleVars.filter(v => !codeVars.includes(v))
const notInExample = codeVars.filter(v => !exampleVars.includes(v) && v !== 'NODE_ENV')

let exitCode = 0

if (notInCode.length > 0) {
  console.warn(`⚠  In .env.example but not used in src/:`)
  notInCode.forEach(v => console.warn(`   - ${v}`))
}

if (notInExample.length > 0) {
  console.error(`❌ Used in src/ but missing from .env.example:`)
  notInExample.forEach(v => console.error(`   - ${v}`))
  exitCode = 1
}

if (exitCode === 0) {
  console.log('✅ All env vars in .env.example are accounted for in src/')
}

process.exit(exitCode)
