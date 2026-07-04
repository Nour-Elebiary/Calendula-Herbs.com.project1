import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const MEMBERS = [
  { name: 'Rabie Mostafa', title: 'Owner & CEO', memberType: 'BOARD', order: 0, contacts: [
    { type: 'EMAIL', value: 'rabie_shalabi@calendula-herbs.com' },
    { type: 'WHATSAPP', value: '+201127703323' },
    { type: 'LINKEDIN', value: 'https://www.linkedin.com/in/rabie-shalabi-07427b1b6/' },
    { type: 'FACEBOOK', value: 'https://www.facebook.com/rabie.ghaith' },
  ]},
  { name: 'Nehad Elebiary', title: 'Vice President & Co-founder', memberType: 'BOARD', order: 1, contacts: [
    { type: 'EMAIL', value: 'nehadelebiary@calendula-herbs.com' },
    { type: 'WHATSAPP', value: '+201120238857' },
    { type: 'LINKEDIN', value: 'https://www.linkedin.com/in/nehadelebiary/' },
  ]},
  { name: 'Sofy Sayed', title: 'Export Manager & QA Specialist', memberType: 'TEAM', order: 0, contacts: [
    { type: 'EMAIL', value: 'sofy@calendula-herbsspices.com' },
    { type: 'WHATSAPP', value: '+201119715662' },
    { type: 'LINKEDIN', value: 'https://www.linkedin.com/in/sofysaidsofy/' },
  ]},
  { name: 'Nour Eldin Elebiary', title: 'Sales Specialist', memberType: 'TEAM', order: 1, contacts: [
    { type: 'EMAIL', value: 'nour@calendula-herbsspices.com' },
    { type: 'WHATSAPP', value: '+201100497120' },
    { type: 'LINKEDIN', value: 'https://www.linkedin.com/in/nour-eldin-elebiary/' },
  ]},
  { name: 'Mostafa Abdallah', title: 'Sales Specialist', memberType: 'TEAM', order: 2, contacts: [
    { type: 'EMAIL', value: 'Mostafa@calendula-herbs.com' },
    { type: 'WHATSAPP', value: '+201065536968' },
    { type: 'LINKEDIN', value: 'https://www.linkedin.com/in/moustafaabdullah' },
  ]},
  { name: 'Sameha Sabra', title: 'Sales Specialist', memberType: 'TEAM', order: 3, contacts: [
    { type: 'EMAIL', value: 'sameha@calendula-herbs.com' },
    { type: 'WHATSAPP', value: '+201113535589' },
    { type: 'LINKEDIN', value: 'https://www.linkedin.com/in/sameha-sabra/' },
  ]},
  { name: 'Ameera Ahmed', title: 'Sales Specialist', memberType: 'TEAM', order: 4, contacts: [
    { type: 'EMAIL', value: 'export1@calendula-herbs.com' },
    { type: 'WHATSAPP', value: '+201125509631' },
    { type: 'LINKEDIN', value: 'https://www.linkedin.com/in/ameeraahmedroby/' },
  ]},
  { name: 'Habiba Mahmoud', title: 'Sales Specialist', memberType: 'TEAM', order: 5, contacts: [
    { type: 'EMAIL', value: 'export1@calendula-herbsspices.com' },
    { type: 'WHATSAPP', value: '+201020881535' },
  ]},
  { name: 'Walaa Ahmed', title: 'Sales Specialist', memberType: 'TEAM', order: 6, contacts: [
    { type: 'EMAIL', value: 'nour@calendula-herbsspices.com' },
    { type: 'WHATSAPP', value: '+201100497120' },
    { type: 'LINKEDIN', value: 'https://www.linkedin.com/in/nour-eldin-elebiary/' },
  ]},
  { name: 'Hanady Ammar', title: 'Sales Specialist', memberType: 'TEAM', order: 7, contacts: [
    { type: 'EMAIL', value: 'nehadelebiary@calendula-herbs.com' },
    { type: 'WHATSAPP', value: '+201120238857' },
    { type: 'LINKEDIN', value: 'https://www.linkedin.com/in/nehadelebiary/' },
  ]},
]

let created = 0
for (const member of MEMBERS) {
  const { contacts, ...data } = member
  const exists = await prisma.teamMember.findFirst({ where: { name: data.name } })
  if (exists) {
    console.log(`SKIP ${data.name} — already exists`)
    continue
  }
  const m = await prisma.teamMember.create({
    data: {
      ...data,
      contacts: { create: contacts },
    },
  })
  created++
  console.log(`CREATED ${data.name} (${m.id})`)
}

console.log(`\nDone! ${created} team members created.`)
await prisma.$disconnect()
