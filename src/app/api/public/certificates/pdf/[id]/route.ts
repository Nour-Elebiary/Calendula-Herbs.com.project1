import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const cert = await db.certificate.findUnique({
      where: { id },
      include: { file: true },
    })

    if (!cert || !cert.file?.cloudinaryId) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }

    const downloadUrl = cloudinary.utils.private_download_url(cert.file.cloudinaryId, 'pdf', {
      resource_type: 'auto',
      type: 'upload',
      attachment: false,
    })

    const response = await fetch(downloadUrl)
    if (!response.ok) {
      console.error(`[PDF PROXY] Cloudinary returned ${response.status} for ${cert.file.cloudinaryId}`)
      return NextResponse.json({ error: 'Failed to fetch PDF' }, { status: 502 })
    }

    const blob = await response.blob()
    return new NextResponse(blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${cert.title}.pdf"`,
        'Content-Length': blob.size.toString(),
      },
    })
  } catch (err) {
    console.error('[PDF PROXY]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
