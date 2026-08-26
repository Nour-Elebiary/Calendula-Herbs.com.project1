import { NextRequest, NextResponse } from 'next/server'
import { generateSignature } from '@/lib/cloudinary'
import { withAdminAuth, apiError } from '@/lib/route-helpers'
import { getRequiredEnvVar, getOptionalEnvVar } from '@/lib/env'

export const GET = withAdminAuth(async (req) => {
  try {
    const folder = req.nextUrl.searchParams.get('folder') || 'calendula_media'
    const { timestamp, signature } = await generateSignature(folder)
    return NextResponse.json({
      timestamp,
      signature,
      folder,
      cloudName: getOptionalEnvVar('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME', ''),
      apiKey: getRequiredEnvVar('CLOUDINARY_API_KEY'),
    })
  } catch (err) {
    return apiError('Failed to generate signature', 500, err)
  }
})
