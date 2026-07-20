import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  const members = await db.teamMember.findMany({
    where: { isActive: true },
    include: { contacts: true },
    orderBy: { order: 'asc' },
  })

  console.log('\n=== Team Member Phone/Messaging Contacts ===\n')
  for (const m of members) {
    const phoneContacts = m.contacts.filter(c =>
      ['PHONE', 'WHATSAPP', 'VIBER', 'SIGNAL', 'TELEGRAM'].includes(c.type.toUpperCase())
    )
    if (phoneContacts.length > 0) {
      console.log(`${m.name} (${m.title}):`)
      phoneContacts.forEach(c =>
        console.log(`  [${c.type}] ${c.value}${c.label ? ` (label: "${c.label}")` : ''}`)
      )
    }
  }

  const contact = await db.contactSetting.findUnique({ where: { id: 'main' } })
  console.log('\n=== ContactSetting.phones ===')
  console.log(JSON.stringify(contact?.phones, null, 2))
  console.log('\n=== ContactSetting.contactMethods ===')
  console.log(JSON.stringify(contact?.contactMethods, null, 2))
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
