import { NextRequest, NextResponse } from 'next/server'
import { generateSignature } from '@/lib/cloudinary'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'

export async function GET(req: NextRequest) {
  try { await requireAdmin() } catch { return unauthorized() }
  try {
    const searchParams = req.nextUrl.searchParams
    const folder = searchParams.get('folder') || 'calendula_media'

    const { timestamp, signature } = await generateSignature(folder)

    return NextResponse.json({
      timestamp,
      signature,
      folder,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    })
  } catch (error) {
    console.error('Signature error:', error)
    return NextResponse.json({ error: 'Failed to generate signature' }, { status: 500 })
  }
}
