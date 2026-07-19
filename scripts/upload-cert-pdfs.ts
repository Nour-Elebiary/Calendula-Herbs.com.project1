import { db } from '@/lib/db'
import { cloudinary } from '@/lib/cloudinary'

interface CertPdfMeta {
  fileName: string     // exact filename in public/certificates/
  mediaFileId: string  // existing or new MediaFile id
  certTitle: string    // Certificate.title to match
  label: string        // human label
}

const CERT_PDFS: CertPdfMeta[] = [
  { fileName: 'FDA.pdf',             mediaFileId: 'cert_doc_FDA',        certTitle: 'FDA Registration',          label: 'FDA' },
  { fileName: 'ISO 22000.pdf',       mediaFileId: 'cert_doc_ISO_22000',  certTitle: 'ISO 22000:2018',            label: 'ISO 22000' },
  { fileName: 'ISO 9001.pdf',        mediaFileId: 'cert_doc_ISO_9001',   certTitle: 'ISO 9001:2015',             label: 'ISO 9001' },
  { fileName: 'SEDEX - SEMETA.pdf',  mediaFileId: 'cert_pdf_SEDEX_SEMETA', certTitle: 'SEDEX / SMETA',          label: 'SEDEX / SMETA' },
]

const FOLDER = 'calendula_media/cert_pdfs'
const ROOT = 'public/certificates'

async function main() {
  for (const cert of CERT_PDFS) {
    const filePath = `${ROOT}/${cert.fileName}`

    console.log(`Uploading ${cert.fileName}...`)
    const result = await cloudinary.uploader.upload(filePath, {
      folder: FOLDER,
      public_id: cert.mediaFileId,
      resource_type: 'image', // Cloudinary treats PDFs as image type
    })

    console.log(`  → ${result.secure_url} (${result.bytes} bytes)`)

    await db.mediaFile.upsert({
      where: { id: cert.mediaFileId },
      create: {
        id: cert.mediaFileId,
        name: `${cert.label} PDF`,
        originalName: cert.fileName,
        type: 'PDF',
        url: result.secure_url,
        cloudinaryId: result.public_id,
        mimeType: 'application/pdf',
        sizeBytes: result.bytes,
      },
      update: {
        url: result.secure_url,
        cloudinaryId: result.public_id,
        sizeBytes: result.bytes,
        thumbnailUrl: cloudinary.url(result.public_id, { width: 400, format: 'jpg', transformation: { page: 1 } }),
      },
    })
    console.log(`  → DB record ${cert.mediaFileId} upserted`)

    await db.certificate.updateMany({
      where: { title: cert.certTitle },
      data: { fileId: cert.mediaFileId, fileType: 'PDF' },
    })
    console.log(`  → Certificate "${cert.certTitle}" updated`)
  }

  console.log('\nDone! All certificates uploaded.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
