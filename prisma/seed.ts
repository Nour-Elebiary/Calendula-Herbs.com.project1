import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 1. Read the initial key from secrets.json (if it exists)
  // We'll use a placeholder password hash if not, as the user will be forced to change it.
  let initialKey = 'CHANGE_ME'
  try {
    const secretsPath = path.join(process.cwd(), 'secrets.json')
    if (fs.existsSync(secretsPath)) {
      const secrets = JSON.parse(fs.readFileSync(secretsPath, 'utf8'))
      if (secrets.adminInitialKey) {
        initialKey = secrets.adminInitialKey
      }
    }
  } catch (_err) {
    console.log('Could not read secrets.json, using fallback key.')
  }

  // Hash the initial key (cost factor 12)
  const passwordHash = await bcrypt.hash(initialKey, 12)

  // 2. Create the first admin user
  // This uses upsert so we don't duplicate if seeded twice.
  const adminEmail = process.env.ADMIN_EMAIL || 'nour.elebiary448@gmail.com'
  
  const admin = await prisma.admin.upsert({
    where: { email: adminEmail },
    update: {
      recoveryEmails: ['nour.elebiary448@gmail.com', 'nour@calendula-herbsspices.com'],
    },
    create: {
      name: 'Nour Elebiary',
      email: adminEmail,
      passwordHash: passwordHash,
      recoveryEmails: ['nour.elebiary448@gmail.com', 'nour@calendula-herbsspices.com'],
    },
  })
  console.log(`✅ Admin user ensured: ${admin.email}`)

  // 3. Create default Site Settings
  const defaultSettings = [
    { key: 'primary_color', value: '#15803d' }, // Green-700
    { key: 'secondary_color', value: '#166534' }, // Green-800
    { key: 'accent_color', value: '#facc15' }, // Yellow-400
    { key: 'background_color', value: '#ffffff' },
    { key: 'foreground_color', value: '#0f172a' },
    { key: 'company_name', value: 'Calendula Herbs For Import & Export' },
    { key: 'company_tagline', value: 'Premium Organic Herbs, Spices & Seeds from Egypt to the World' },
  ]

  for (const setting of defaultSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: {
        key: setting.key,
        value: setting.value,
      },
    })
  }
  console.log('✅ Default site settings ensured.')

  // 4. Create default Contact Settings
  const defaultContactMethods = [
    { type: 'whatsapp',  value: '+201000000000', linkMode: 'auto' },
    { type: 'telegram',  value: 'calendulaherbs', linkMode: 'auto' },
    { type: 'viber',     value: '+201000000000', linkMode: 'auto' },
    { type: 'skype',     value: 'calendulaherbs', linkMode: 'auto' },
  ]

  await prisma.contactSetting.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      managingEmails: [adminEmail],
      publicEmails: ['info@calendulaherbs.com'],
      phones: ['+201000000000'],
      mapAddress: 'New Sea Street, Ibshaway, Fayoum, Egypt — ZIP 63611',
      formEnabled: true,
      contactMethods: defaultContactMethods,
    },
  })
  console.log('✅ Default contact settings ensured.')

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
