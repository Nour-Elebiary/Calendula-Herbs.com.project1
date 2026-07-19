import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const CERT_LOGOS: Array<{ name: string; logoPath: string; pdfName?: string }> = [
  { name: 'AHK EGYPT',                          logoPath: '/certificates/Certificates Logos/AHK EGYPT.png' },
  { name: 'Agricultural Export Council (AEC)',   logoPath: '/certificates/Certificates Logos/Agricultural Export Council ( AEC ).png' },
  { name: 'BRCGS',                               logoPath: '/certificates/Certificates Logos/BRCGS.svg' },
  { name: 'COR',                                 logoPath: '/certificates/Certificates Logos/COR .png' },
  { name: 'EU',                                  logoPath: '/certificates/Certificates Logos/EU.svg',        pdfName: 'EU Certificate' },
  { name: 'FDA',                                 logoPath: '/certificates/Certificates Logos/FDA.png',        pdfName: 'FDA' },
  { name: 'FEC EGYPT',                           logoPath: '/certificates/Certificates Logos/FEC EGYPT.svg' },
  { name: 'FSSC 22000',                          logoPath: '/certificates/Certificates Logos/FSSC 22000.png' },
  { name: 'HALAL',                               logoPath: '/certificates/Certificates Logos/HALAL.svg' },
  { name: 'ISO 22000',                           logoPath: '/certificates/Certificates Logos/ISO 22000.png',  pdfName: 'ISO 22000' },
  { name: 'ISO 9001',                            logoPath: '/certificates/Certificates Logos/ISO 9001.gif',   pdfName: 'ISO 9001' },
  { name: 'KOSHER',                              logoPath: '/certificates/Certificates Logos/KOSHER.png' },
  { name: 'NFSA',                                logoPath: '/certificates/Certificates Logos/NFSA.png' },
  { name: 'SEDEX-SMETA',                         logoPath: '/certificates/Certificates Logos/SEDEX-SEMETA-nobg.svg', pdfName: 'SEDEX - SEMETA' },
  { name: 'USDA Organic',                        logoPath: '/certificates/Certificates Logos/USDA Organic Seal NOP.svg' },
]

const LOCALES = ['en', 'ar', 'es', 'it', 'ja', 'ko', 'hi', 'ru', 'uk', 'pt-BR', 'zh-CN', 'fr', 'nl', 'de', 'bg', 'el', 'tr']

function mimeForPath(path: string): string {
  if (path.endsWith('.svg')) return 'image/svg+xml'
  if (path.endsWith('.gif')) return 'image/gif'
  if (path.endsWith('.png')) return 'image/png'
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg'
  return 'image/png'
}

export async function GET() {
  try {
    const results: string[] = []

    for (let i = 0; i < CERT_LOGOS.length; i++) {
      const { name, logoPath, pdfName } = CERT_LOGOS[i]
      const logoId = `cert_logo_${name.replace(/[^a-z0-9]/gi, '_')}`

      // Upsert logo media
      const logo = await db.mediaFile.upsert({
        where: { id: logoId },
        update: { url: logoPath },
        create: {
          id: logoId,
          name: `${name} Logo`,
          originalName: logoPath.split('/').pop()!,
          type: 'IMAGE',
          url: logoPath,
          cloudinaryId: `local/cert/${logoId}`,
          mimeType: mimeForPath(logoPath),
          sizeBytes: 1000,
        },
      })

      // Optionally upsert PDF media
      let pdfId: string | null = null
      if (pdfName) {
        const pdfMediaId = `cert_pdf_${name.replace(/[^a-z0-9]/gi, '_')}`
        const pdfUrl = `/certificates/${pdfName}.pdf`
        const pdf = await db.mediaFile.upsert({
          where: { id: pdfMediaId },
          update: { url: pdfUrl },
          create: {
            id: pdfMediaId,
            name: `${name} PDF`,
            originalName: `${pdfName}.pdf`,
            type: 'PDF',
            url: pdfUrl,
            cloudinaryId: `local/cert_pdf/${pdfMediaId}`,
            mimeType: 'application/pdf',
            sizeBytes: 1000,
          },
        })
        pdfId = pdf.id
      }

      // Create or update certificate
      const existing = await db.certificate.findFirst({ where: { title: name } })
      if (existing) {
        await db.certificate.update({
          where: { id: existing.id },
          data: { logoFileId: logo.id, fileId: pdfId, fileType: pdfId ? 'PDF' : 'IMAGE', isActive: true, order: i },
        })
        results.push(`Updated: ${name}`)
      } else {
        await db.certificate.create({
          data: {
            title: name,
            logoFileId: logo.id,
            fileId: pdfId,
            fileType: pdfId ? 'PDF' : 'IMAGE',
            isActive: true,
            order: i,
            translations: {
              create: LOCALES.map(locale => ({ locale, title: name })),
            },
          },
        })
        results.push(`Created: ${name}`)
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (err) {
    console.error('[SEED CERTS]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
