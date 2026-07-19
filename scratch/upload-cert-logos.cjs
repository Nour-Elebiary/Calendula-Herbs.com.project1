/**
 * upload-cert-logos.js
 * Plain CJS script — no TypeScript, no ESM issues.
 * Run: node scratch/upload-cert-logos.js
 */

'use strict'

const fs = require('fs')
const path = require('path')
const https = require('https')
const crypto = require('crypto')

const CLOUD_NAME = 'dcukpuftg'
const API_KEY    = '675339851565595'
const API_SECRET = 'Kzf1z9YSx8davluDFJF_yI9LwZg'

const LOGOS_DIR    = path.join(__dirname, '..', 'public', 'certificates', 'Certificates Logos')
const UPLOAD_FOLDER = 'calendula_media/cert_logos'

// ── Upload to Cloudinary via raw multipart/form-data ──────────────────────
function uploadToCloudinary(filePath, publicId) {
  return new Promise((resolve, reject) => {
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const toSign = `folder=${UPLOAD_FOLDER}&public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`
    const signature = crypto.createHash('sha1').update(toSign).digest('hex')

    const boundary = '----FormBoundary' + crypto.randomBytes(8).toString('hex')
    const fileBuffer = fs.readFileSync(filePath)
    const ext = path.extname(filePath).slice(1).toLowerCase()
    const mimeType =
      ext === 'svg' ? 'image/svg+xml' :
      ext === 'gif' ? 'image/gif' :
      ext === 'png' ? 'image/png' :
      ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
      'application/octet-stream'

    const parts = []

    const addField = (name, value) => {
      parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`))
    }

    addField('api_key', API_KEY)
    addField('timestamp', timestamp)
    addField('signature', signature)
    addField('folder', UPLOAD_FOLDER)
    addField('public_id', publicId)

    parts.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${path.basename(filePath)}"\r\nContent-Type: ${mimeType}\r\n\r\n`
    ))
    parts.push(fileBuffer)
    parts.push(Buffer.from(`\r\n--${boundary}--\r\n`))

    const body = Buffer.concat(parts)

    const options = {
      hostname: 'api.cloudinary.com',
      path: `/v1_1/${CLOUD_NAME}/image/upload`,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      },
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          if (json.error) reject(new Error(json.error.message))
          else resolve(json)
        } catch (e) { reject(e) }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

async function main() {
  // Lazy-load PrismaClient at runtime using CommonJS
  const { PrismaClient } = require('@prisma/client')
  const prisma = new PrismaClient()

  try {
    const files = fs.readdirSync(LOGOS_DIR).filter(f => fs.statSync(path.join(LOGOS_DIR, f)).isFile())
    console.log(`\nFound ${files.length} logo files in local folder.`)

    const localMediaFiles = await prisma.mediaFile.findMany({
      where: { cloudinaryId: { startsWith: 'local/' } },
    })
    console.log(`Found ${localMediaFiles.length} local-path MediaFile records in DB.\n`)

    for (const file of files) {
      const filePath = path.join(LOGOS_DIR, file)
      // Sanitise to a safe Cloudinary public_id
      const baseName  = path.basename(file, path.extname(file))
      const publicId  = baseName.replace(/[^a-zA-Z0-9_-]/g, '_')

      process.stdout.write(`Uploading: ${file}  →  ${publicId} ... `)

      try {
        const result = await uploadToCloudinary(filePath, publicId)
        const cloudUrl = result.secure_url
        console.log(`✓  ${cloudUrl}`)

        // Match the DB record by original filename
        const match = localMediaFiles.find(
          m => m.originalName === file || m.url.endsWith(file)
        )

        if (match) {
          await prisma.mediaFile.update({
            where: { id: match.id },
            data: {
              url: cloudUrl,
              cloudinaryId: result.public_id,
              thumbnailUrl: null,
              width: result.width || null,
              height: result.height || null,
            },
          })
          console.log(`   ↳ DB updated: ${match.id}`)
        } else {
          console.log(`   ⚠ No DB record matched filename: ${file}`)
        }
      } catch (err) {
        console.error(`   ✗ Error: ${err.message}`)
      }
    }

    console.log('\n✅ All done!')
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(err => { console.error(err); process.exit(1) })
