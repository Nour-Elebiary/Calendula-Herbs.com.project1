import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  // Update phones with ownerName
  await db.contactSetting.update({
    where: { id: 'main' },
    data: {
      phones: [
        { number: '+201120238857', ownerName: 'Nehad Elebiary' },
        { number: '+201127703323', ownerName: 'Rabie Mostafa' },
      ],
      contactMethods: [
        { type: 'whatsapp', value: '+201120238857', linkMode: 'auto', label: 'Nehad Elebiary — WhatsApp' },
        { type: 'telegram', value: 'EL_EBIARY', linkMode: 'auto', label: 'Nehad Elebiary — Telegram' },
        { type: 'viber', value: '+201120238857', linkMode: 'auto', label: 'Nehad Elebiary — Viber' },
        { type: 'whatsapp', value: '+201127703323', linkMode: 'auto', label: 'Rabie Mostafa — WhatsApp' },
      ],
    },
  })

  console.log('ContactSetting updated with owner names.')
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
