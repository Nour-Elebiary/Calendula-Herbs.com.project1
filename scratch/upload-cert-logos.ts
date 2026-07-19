/**
 * upload-cert-logos.ts
 * ---------------------
 * Uploads every certificate logo from public/certificates/Certificates Logos/
 * to Cloudinary, then updates the matching MediaFile DB record with the real URL.
 * 
 * Run:  npx ts-node --compiler-options '{"module":"commonjs"}' scratch/upload-cert-logos.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'
import * as http from 'http'
import * as crypto from 'crypto'
import { PrismaClient } from '@prisma/client'

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dcukpuftg'
const API_KEY     = process.env.CLOUDINARY_API_KEY    || '675339851565595'
const API_SECRET  = process.env.CLOUDINARY_API_SECRET || 'Kzf1z9YSx8davluDFJF_yI9LwZg'

const LOGOS_DIR = path.join(__dirname, '..', 'public', 'certificates', 'Certificates Logos')
const UPLOAD_FOLDER = 'calendula_media/cert_logos'

const prisma = new PrismaClient()

// ── Simple multipart upload via native https ───────────────────────────────
function uploadToCloudinary(filePath: string, publicId: string): Promise<{ secure_url: string; public_id: string; format: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const toSign = `folder=${UPLOAD_FOLDER}&public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`
    const signature = crypto.createHash('sha1').update(toSign).digest('hex')

    const boundary = '----FormBoundary' + crypto.randomBytes(8).toString('hex')
    const fileBuffer = fs.readFileSync(filePath)
    const ext = path.extname(filePath).slice(1).toLowerCase()
    const mimeType = ext === 'svg' ? 'image/svg+xml' : ext === 'gif' ? 'image/gif' : ext === 'png' ? 'image/png' : 'application/octet-stream'

    const parts: Buffer[] = []

    const addField = (name: string, value: string) => {
      parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`))
    }

    addField('api_key', API_KEY)
    addField('timestamp', timestamp)
    addField('signature', signature)
    addField('folder', UPLOAD_FOLDER)
    addField('public_id', publicId)

    // File field
    parts.push(Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${path.basename(filePath)}"\r\nContent-Type: ${mimeType}\r\n\r\n`))
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
      res.on('data', (chunk) => (data += chunk))
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          if (json.error) reject(new Error(json.error.message))
          else resolve(json)
        } catch (e) {
          reject(e)
        }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

async function main() {
  const files = fs.readdirSync(LOGOS_DIR)
  console.log(`Found ${files.length} logo files to upload.\n`)

  // Get all local MediaFile records
  const localMediaFiles = await prisma.mediaFile.findMany({
    where: { cloudinaryId: { startsWith: 'local/' } },
  })
  console.log(`Found ${localMediaFiles.length} local MediaFile DB records.\n`)

  for (const file of files) {
    const filePath = path.join(LOGOS_DIR, file)
    const stat = fs.statSync(filePath)
    if (!stat.isFile()) continue

    const ext = path.extname(file).slice(1).toLowerCase()
    // Sanitize filename for use as cloudinary public_id
    const publicId = path.basename(file, path.extname(file)).replace(/[^a-zA-Z0-9_-]/g, '_')

    console.log(`Uploading: ${file} => public_id: ${publicId}`)

    try {
      const result = await uploadToCloudinary(filePath, publicId)
      const cloudUrl = result.secure_url
      console.log(`  ✓ Uploaded: ${cloudUrl}`)

      // Find the matching MediaFile by its local URL (matching the filename)
      const match = localMediaFiles.find(m => m.originalName === file || m.url.includes(file))
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
        console.log(`  ✓ Updated DB record: ${match.id}`)
      } else {
        console.log(`  ⚠ No matching DB record found for: ${file}`)
      }
    } catch (err: any) {
      console.error(`  ✗ Failed to upload ${file}:`, err.message)
    }
  }

  console.log('\n✅ Done! All certificate logos uploaded to Cloudinary.')
}

main().catch(console.error).finally(() => prisma.$disconnect())
