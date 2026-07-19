import { v2 as cloudinary } from 'cloudinary'
import { getRequiredEnvVar } from '@/lib/env'

cloudinary.config({
  cloud_name: getRequiredEnvVar('CLOUDINARY_CLOUD_NAME'),
  api_key: getRequiredEnvVar('CLOUDINARY_API_KEY'),
  api_secret: getRequiredEnvVar('CLOUDINARY_API_SECRET'),
  secure: true,
})

export { cloudinary }

export async function generateSignature(folder: string) {
  const timestamp = Math.round(new Date().getTime() / 1000)
  const paramsToSign = {
    timestamp,
    folder,
  }

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    getRequiredEnvVar('CLOUDINARY_API_SECRET')
  )

  return { timestamp, signature }
}
