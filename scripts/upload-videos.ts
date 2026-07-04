import { v2 as cloudinary } from 'cloudinary'
import * as path from 'path'

cloudinary.config({
  cloud_name: 'dcukpuftg',
  api_key: '675339851565595',
  api_secret: 'Kzf1z9YSx8davluDFJF_yI9LwZg',
  secure: true,
})

async function upload(filePath: string, publicId: string) {
  console.log(`Uploading ${filePath}...`)
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: 'video',
    public_id: publicId,
    folder: 'calendula-herbs/videos',
    chunk_size: 6000000,
    eager: [
      { width: 1920, height: 1080, crop: 'limit', quality: 'auto', format: 'mp4' },
    ],
    eager_async: true,
  })
  console.log(`Uploaded: ${result.secure_url}`)
  return result
}

async function main() {
  const base = 'C:\\Users\\Asus\\AppData\\Local\\Temp\\opencode\\calendula-videos'
  const results = await Promise.all([
    upload(path.join(base, 'homepage-hero.mp4'), 'hero-homepage'),
    upload(path.join(base, 'about-hero.mp4'), 'hero-about'),
  ])
  console.log('\n--- All done ---')
  for (const r of results) {
    console.log(`${r.public_id}: ${r.secure_url}`)
  }
}

main().catch(console.error)
