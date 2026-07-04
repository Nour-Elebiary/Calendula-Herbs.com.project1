import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

const subs = await p.contactSubmission.findMany({ orderBy: { createdAt: 'desc' } })
console.log(`Contact submissions: ${subs.length}`)
for (const s of subs) {
  console.log(`\n--- ${s.name} <${s.email}> ---`)
  console.log('Phone:', s.phone || 'N/A')
  console.log('Message:', s.message?.slice(0, 200))
  console.log('Country:', s.country || 'N/A', '| Created:', s.createdAt)
  console.log('Read at:', s.readAt || 'unread')
}

await p.$disconnect()
