import { PrismaClient } from '@prisma/client'
import { v2 as cloudinary } from 'cloudinary'
import https from 'https'
import { pipeline } from 'stream'
import { createWriteStream, unlinkSync, existsSync, mkdirSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

cloudinary.config({
  cloud_name: 'dcukpuftg',
  api_key: '675339851565595',
  api_secret: 'Kzf1z9YSx8davluDFJF_yI9LwZg',
})

const prisma = new PrismaClient()
const TMP = join(tmpdir(), 'ch-certs')
if (!existsSync(TMP)) mkdirSync(TMP, { recursive: true })

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(dest)
    https.get(url.replace(/^http:/, 'https:'), (res) => {
      if (res.statusCode >= 300 && res.headers.location) {
        file.close(); try { unlinkSync(dest) } catch {}
        return download(res.headers.location, dest).then(resolve).catch(reject)
      }
      pipeline(res, file, (err) => err ? reject(err) : resolve())
    }).on('error', reject)
  })
}

const CERTS = [
  { title: 'ISO 22000:2018', issuer: 'Food Safety Management System', url: 'https://calendula-herbs.com/wp-content/uploads/2018/07/iso-certificate-3.jpg' },
  { title: 'ISO 9001:2015', issuer: 'Quality Management System (TÜV)', url: 'https://calendula-herbs.com/wp-content/uploads/2021/01/calendulaiso9001-jan2021.jpeg' },
  { title: 'HALAL Certificate', issuer: 'Halal Quality Control', url: 'https://calendula-herbs.com/wp-content/uploads/2021/08/halal.png' },
  { title: 'EU Organic Certificate', issuer: 'Control Union Certifications', url: 'https://calendula-herbs.com/wp-content/uploads/2018/07/organic-certificate-1.jpg' },
  { title: 'USDA NOP Organic', issuer: 'USDA National Organic Program', url: 'https://calendula-herbs.com/wp-content/uploads/2021/10/nopcertificate.png' },
  { title: 'KOSHER Certificate', issuer: 'Kosher Certification', url: null },
  { title: 'FDA Registration', issuer: 'U.S. Food & Drug Administration', url: 'https://calendula-herbs.com/wp-content/uploads/2020/08/CALENDULA-HERBS-FDA-Certificate-2020.jpg' },
  { title: 'BRCGS Certificate', issuer: 'Brand Reputation Compliance Global Standards', url: null },
  { title: 'KOSHER Certificate', issuer: 'Kosher Certification', url: null },
  { title: 'SEDEX / SMETA', issuer: 'Supplier Ethical Data Exchange', url: null },
  { title: 'NFSA Whitelist', issuer: 'National Food Safety Authority (Egypt)', url: null },
  { title: 'AHK Membership', issuer: 'Arab-Hungarian Chamber of Commerce', url: null },
]

// Remove duplicates first
const seen = new Set()
const uniqueCerts = CERTS.filter(c => {
  if (seen.has(c.title)) return false
  seen.add(c.title)
  return true
})

// Delete existing placeholder cert
const existing = await prisma.certificate.findFirst({ where: { title: 'ISO 22000:2018' } })
if (existing && !existing.fileId) {
  await prisma.certificate.delete({ where: { id: existing.id } })
  console.log('Deleted empty placeholder ISO 22000:2018')
}

let order = 0
for (const cert of uniqueCerts) {
  const exists = await prisma.certificate.findFirst({ where: { title: cert.title } })
  if (exists) { console.log(`SKIP ${cert.title}`); order++; continue }

  if (!cert.url) {
    await prisma.certificate.create({
      data: { title: cert.title, issuer: cert.issuer, fileType: 'IMAGE', order },
    })
    console.log(`CREATED ${cert.title} (no image)`)
    order++
    continue
  }

  const ext = cert.url.split('.').pop().split('?')[0] || 'jpg'
  const tmpPath = join(TMP, `cert_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`)
  
  console.log(`  DL ${cert.title}...`)
  try {
    await download(cert.url, tmpPath)
  } catch (e) {
    console.log(`  FAIL download — creating without image`)
    await prisma.certificate.create({
      data: { title: cert.title, issuer: cert.issuer, fileType: 'IMAGE', order },
    })
    order++; continue
  }

  console.log(`  Uploading to Cloudinary...`)
  const result = await cloudinary.uploader.upload(tmpPath, {
    folder: 'calendula-herbs/certificates',
    resource_type: 'auto',
  })
  try { unlinkSync(tmpPath) } catch {}

  const media = await prisma.mediaFile.create({
    data: {
      name: cert.title,
      originalName: `${cert.title}.${ext}`,
      type: 'IMAGE',
      url: result.secure_url,
      cloudinaryId: result.public_id,
      thumbnailUrl: result.secure_url.replace('/upload/', '/upload/w_400,q_auto/'),
      mimeType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
      sizeBytes: result.bytes,
      width: result.width || null,
      height: result.height || null,
    },
  })

  await prisma.certificate.create({
    data: { title: cert.title, issuer: cert.issuer, fileId: media.id, fileType: 'IMAGE', order },
  })
  console.log(`  CREATED ${cert.title} ✓`)
  order++
}

console.log(`\nDone! Total certificates: ${order}`)
await prisma.$disconnect()
