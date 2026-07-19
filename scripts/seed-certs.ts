import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  const logosDir = path.join(process.cwd(), 'public/certificates/Certificates Logos')
  const files = fs.readdirSync(logosDir)
  
  for (const file of files) {
    if (file.match(/\.(png|jpg|svg|gif)$/i)) {
      const name = path.parse(file).name
      
      // Upsert a Media object
      const media = await prisma.mediaFile.upsert({
        where: { id: `cert_logo_${name.replace(/\s+/g, '_')}` },
        update: {
          url: `/certificates/Certificates Logos/${file}`,
          name: `${name} Logo`,
        },
        create: {
          id: `cert_logo_${name.replace(/\s+/g, '_')}`,
          name: `${name} Logo`,
          originalName: file,
          type: 'IMAGE',
          url: `/certificates/Certificates Logos/${file}`,
          cloudinaryId: `local/cert_logo_${name}`,
          mimeType: file.endsWith('.svg') ? 'image/svg+xml' : 'image/png',
          sizeBytes: 1000,
        }
      })
      
      // Look for a corresponding PDF document in certificates folder
      let docMediaId = null
      const pdfPath = path.join(process.cwd(), 'public/certificates', `${name}.pdf`)
      if (fs.existsSync(pdfPath)) {
        const docMedia = await prisma.mediaFile.upsert({
          where: { id: `cert_doc_${name.replace(/\s+/g, '_')}` },
          update: {
            url: `/certificates/${name}.pdf`,
          },
          create: {
            id: `cert_doc_${name.replace(/\s+/g, '_')}`,
            name: `${name} PDF`,
            originalName: `${name}.pdf`,
            type: 'PDF',
            url: `/certificates/${name}.pdf`,
            cloudinaryId: `local/cert_doc_${name}`,
            mimeType: 'application/pdf',
            sizeBytes: 1000,
          }
        })
        docMediaId = docMedia.id
      }
      
      // Create or update Certificate. Wait, Certificate doesn't have a title unique constraint.
      // So we have to find it first.
      const existingCerts = await prisma.certificate.findMany({ where: { title: name } })
      if (existingCerts.length > 0) {
        await prisma.certificate.update({
          where: { id: existingCerts[0].id },
          data: {
            logoFileId: media.id,
            fileId: docMediaId,
            fileType: docMediaId ? 'PDF' : 'IMAGE',
            isActive: true
          }
        })
      } else {
        await prisma.certificate.create({
          data: {
            title: name,
            issuer: 'Various',
            logoFileId: media.id,
            fileId: docMediaId,
            fileType: docMediaId ? 'PDF' : 'IMAGE',
            isActive: true,
            order: 0
          }
        })
      }
      console.log(`Upserted certificate: ${name}`)
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
