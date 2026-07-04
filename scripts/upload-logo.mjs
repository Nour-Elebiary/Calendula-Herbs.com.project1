import { v2 as cloudinary } from 'cloudinary'
import { createReadStream } from 'fs'
import path from 'path'

cloudinary.config({
  cloud_name: 'dcukpuftg',
  api_key: '675339851565595',
  api_secret: 'Kzf1z9YSx8davluDFJF_yI9LwZg',
})

const logoPath = path.resolve('..', "CUTTER PLOTTER 37 X20 (1).pdf (1) (1).png")

// Upload with resize to appropriate logo dimensions (maintain aspect ratio, no crop)
const result = await cloudinary.uploader.upload(logoPath, {
  folder: 'calendula-herbs/brand',
  public_id: 'logo',
  // Resize to 200px height, auto width, no crop — entire image preserved
  transformation: [
    { height: 200, width: null, crop: 'fit', quality: 'auto', format: 'auto' }
  ],
  overwrite: true,
})

console.log('Uploaded!')
console.log('URL:', result.secure_url)
console.log('Dimensions:', result.width, 'x', result.height)
console.log('Public ID:', result.public_id)
