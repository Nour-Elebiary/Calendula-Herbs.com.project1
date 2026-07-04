/**
 * generate-image.mjs — Free AI image generator
 *
 * Providers (in priority order):
 *   1. Pollinations.ai — truly free, no API key, no auth, unlimited
 *   2. OpenRouter     — requires OPENROUTER_API_KEY in .env
 *   3. Puter.js       — requires PUTER_AUTH_TOKEN in .env
 *
 * Usage:
 *   node .agents/skills/image-generator/scripts/generate-image.mjs \
 *     --prompt "dried chamomile flowers, white background" \
 *     --output "chamomile.png"
 *
 * Options:
 *   --prompt   Required. Image description.
 *   --output   Output file path (default: ./output-{timestamp}.png)
 *   --provider pollinations|openrouter|puter (default: pollinations)
 *   --width    Image width (default: 1024)
 *   --height   Image height (default: 1024)
 */

import { config } from 'dotenv'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load .env from project root (2 levels up from scripts/)
const rootDir = path.resolve(__dirname, '../../../../')
const envPaths = [
  path.join(rootDir, '.env'),
  path.join(rootDir, '.env.local'),
]
for (const p of envPaths) {
  if (existsSync(p)) config({ path: p })
}

function parseArgs() {
  const args = process.argv.slice(2)
  const opts = {
    prompt: null, output: null, provider: 'pollinations',
    width: 1024, height: 1024
  }
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--prompt':    opts.prompt = args[++i]; break
      case '--output':    opts.output = args[++i]; break
      case '--provider':  opts.provider = args[++i]; break
      case '--width':     opts.width = parseInt(args[++i], 10); break
      case '--height':    opts.height = parseInt(args[++i], 10); break
    }
  }
  if (!opts.prompt) throw new Error('--prompt is required')
  if (!opts.output) opts.output = `./output-${Date.now()}.png`
  if (!path.isAbsolute(opts.output)) opts.output = path.resolve(process.cwd(), opts.output)
  return opts
}

async function downloadImage(url) {
  const resp = await fetch(url)
  if (!resp.ok) throw new Error(`Download failed: ${resp.status}`)
  return Buffer.from(await resp.arrayBuffer())
}

// ── Provider: Pollinations.ai (truly free, no API key) ───
// API: GET https://image.pollinations.ai/prompt/{prompt}
// Params: width, height, model, seed, nologo=true
async function generatePollinations({ prompt, width, height }) {
  const url = new URL(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`)
  url.searchParams.set('width', String(width))
  url.searchParams.set('height', String(height))
  url.searchParams.set('nologo', 'true')
  url.searchParams.set('model', 'flux')  // Good quality realistic model
  return downloadImage(url.toString())
}

// ── Provider: OpenRouter ─────────────────────────────────
async function generateOpenRouter({ prompt, width, height }) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set in .env')

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://calendula-herbs.com',
      'X-Title': 'Calendula Herbs Image Generator',
    },
    body: JSON.stringify({
      model: 'google/gemini-3-pro-image-preview',
      messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenRouter ${response.status}: ${err.slice(0, 200)}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Empty response')

  // Extract image URL from markdown or direct URL
  const mdMatch = content.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/)
  if (mdMatch) return downloadImage(mdMatch[1])
  const urlMatch = content.match(/https?:\/\/[^\s"']+\.(png|jpg|jpeg|webp)/i)
  if (urlMatch) return downloadImage(urlMatch[0])

  // Try JSON
  try {
    const parsed = JSON.parse(content)
    const imgUrl = parsed.imageUrl || parsed.url || parsed.image || parsed.data
    if (typeof imgUrl === 'string' && imgUrl.startsWith('http')) return downloadImage(imgUrl)
    if (typeof imgUrl === 'string') return Buffer.from(imgUrl, 'base64')
  } catch {}

  throw new Error(`Unrecognized format: ${content.slice(0, 100)}`)
}

// ── Provider: Puter.js ────────────────────────────────────
async function generatePuter({ prompt, width, height }) {
  const { default: PuterModule } = await import('@heyputer/puter.js')
  const puter = PuterModule.puter || PuterModule.default
  const authToken = process.env.PUTER_AUTH_TOKEN
  if (authToken) puter.setAuthToken(authToken)

  const result = await puter.ai.txt2img(prompt, {
    model: 'gemini-3-pro-image-preview', width, height
  })

  if (Buffer.isBuffer(result)) return result
  const url = result?.imageUrl || result?.url || result?.src
  if (url) return downloadImage(url)
  throw new Error(`Unexpected Puter.js result type: ${typeof result}`)
}

// ── Main ──────────────────────────────────────────────────
async function main() {
  const opts = parseArgs()
  console.log(`🎨 Generating image...`)
  console.log(`   Provider: ${opts.provider}`)
  console.log(`   Prompt:   ${opts.prompt.slice(0, 120)}`)

  let imageBuffer
  switch (opts.provider) {
    case 'puter':
      imageBuffer = await generatePuter(opts)
      break
    case 'openrouter':
      imageBuffer = await generateOpenRouter(opts)
      break
    default:
      imageBuffer = await generatePollinations(opts)
  }

  await mkdir(path.dirname(opts.output), { recursive: true })
  await writeFile(opts.output, imageBuffer)
  console.log(`✅ Image saved to: ${opts.output}`)
  console.log(`   Size: ${(imageBuffer.length / 1024).toFixed(1)} KB`)
}

main().catch(err => {
  console.error(`❌ Failed: ${err.message}`)
  process.exit(1)
})
