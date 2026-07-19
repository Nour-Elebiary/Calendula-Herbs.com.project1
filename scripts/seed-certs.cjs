const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function main() {
  const logosDir = path.join('e:/Calendula Herbs Website Project/calendula-herbs/public/certificates/Certificates Logos');
  const files = fs.readdirSync(logosDir);
  
  for (const file of files) {
    if (file.match(/\.(png|jpg|svg|gif)$/i)) {
      const name = path.parse(file).name;
      
      // Upsert a Media object
      const media = await prisma.media.upsert({
        where: { url: `/certificates/Certificates Logos/${file}` },
        update: {},
        create: {
          url: `/certificates/Certificates Logos/${file}`,
          type: 'IMAGE',
          alt: `${name} Logo`,
        }
      });
      
      // Look for a corresponding PDF document in certificates folder
      let docMediaId = null;
      const pdfPath = path.join('e:/Calendula Herbs Website Project/calendula-herbs/public/certificates', `${name}.pdf`);
      if (fs.existsSync(pdfPath)) {
        const docMedia = await prisma.media.upsert({
          where: { url: `/certificates/${name}.pdf` },
          update: {},
          create: {
            url: `/certificates/${name}.pdf`,
            type: 'DOCUMENT',
            alt: `${name} PDF`,
          }
        });
        docMediaId = docMedia.id;
      }
      
      // Create or update Certificate
      await prisma.certificate.upsert({
        where: { title: name },
        update: {
          logoId: media.id,
          documentId: docMediaId,
          isActive: true
        },
        create: {
          title: name,
          issuer: 'Various',
          issueDate: new Date(),
          logoId: media.id,
          documentId: docMediaId,
          isActive: true,
          order: 0
        }
      });
      console.log(`Upserted certificate: ${name}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
