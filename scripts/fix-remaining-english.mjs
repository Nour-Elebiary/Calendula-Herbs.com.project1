import fs from 'fs';

// Files that need fixes and their translations
// Format: { file: { keyPath: 'translation' } }
const fixes = {
  'de.json': {
    'faq.heroMetadataTitle': 'FAQ | Calendula Herbs',
    'cart.nameLabel': 'Name *',
  },
  'fr.json': {
    'nav.contact': 'Contact',
    'productDetail.certifications': 'Certifications',
    'contact.messageLabel': 'Message',
    'contact.emailLabel2': 'E-mail',
    'faq.heroMetadataTitle': 'FAQ | Calendula Herbs',
    'cart.emailLabel': 'E-mail *',
    'productActions.email': 'E-mail *',
  },
  'it.json': {
    'nav.home': 'Home',
    'home.moq': 'CQ: {weight} kg',
    'productDetail.home': 'Home',
    'contact.emailLabel2': 'Email',
    'contact.companyPlaceholder': 'Erbe SRL',
    'faq.heroMetadataTitle': 'FAQ | Calendula Herbs',
    'common.privacyPolicy': 'Informativa sulla Privacy',
    'cart.moq': 'CQ: {weight} kg',
    'cart.companyPlaceholder': 'Erbe SRL',
    'cart.emailLabel': 'Email *',
    'productActions.moq': 'CQ: {weight} kg',
    'productActions.email': 'Email *',
  },
  'pt-BR.json': {
    'faq.heroMetadataTitle': 'FAQ | Calendula Herbs',
  },
  'nl.json': {
    'nav.home': 'Home',
    'nav.contact': 'Contact',
    'home.moq': 'MOQ: {weight} kg',
    'productDetail.home': 'Home',
    'contact.directTitle': 'Direct Contact',
    'faq.heroMetadataTitle': 'FAQ | Calendula Herbs',
    'cart.moq': 'MOQ: {weight} kg',
    'productActions.moq': 'MOQ: {weight} kg',
  },
  'ru.json': {
    'contact.emailLabel2': 'Email',
    'faq.heroMetadataTitle': 'FAQ | Calendula Herbs',
    'cart.emailLabel': 'Email *',
    'productActions.email': 'Email *',
  },
  'uk.json': {
    'contact.companyPlaceholder': 'ТОВ "Трави"',
    'faq.heroMetadataTitle': 'FAQ | Calendula Herbs',
  },
  'el.json': {
    'contact.emailLabel2': 'Email',
    'contact.companyPlaceholder': 'Herbs Ελλάς',
    'cart.namePlaceholder': 'Γιάννης Παπαδόπουλος',
    'cart.companyPlaceholder': 'Herbs Ελλάς',
    'cart.emailLabel': 'Email *',
    'cart.emailPlaceholder': 'giannis@example.com',
    'productActions.email': 'Email *',
  },
  'ja.json': {
    'contact.companyPlaceholder': 'ハーブ合同会社',
    'faq.heroMetadataTitle': 'FAQ | Calendula Herbs',
    'common.allRightsReserved': 'All rights reserved.',
    'cart.companyPlaceholder': 'ハーブ合同会社',
  },
  'ko.json': {
    'contact.companyPlaceholder': '허브 유한회사',
    'faq.heroMetadataTitle': 'FAQ | Calendula Herbs',
    'common.allRightsReserved': 'All rights reserved.',
    'cart.companyPlaceholder': '허브 유한회사',
    'cart.emailPlaceholder': 'jane@example.com',
    'cart.phonePlaceholder': '+82 10-1234-5678',
  },
  'hi.json': {
    'cart.emailPlaceholder': 'jane@example.com',
    'cart.phonePlaceholder': '+91 9876543210',
  },
  'ar.json': {
    'contact.emailPlaceholder': 'jane@example.com',
    'contact.phonePlaceholder': '+20 123 456 7890',
    'cart.emailPlaceholder': 'jane@example.com',
    'cart.phonePlaceholder': '+20 123 456 7890',
  },
};

function setKey(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
}

for (const [file, keys] of Object.entries(fixes)) {
  const path = 'src/messages/' + file;
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  for (const [keyPath, translation] of Object.entries(keys)) {
    setKey(data, keyPath, translation);
  }
  fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log('Fixed ' + file);
}

// Validate all
console.log('\n--- Validation ---');
for (const [file] of Object.entries(fixes)) {
  const path = 'src/messages/' + file;
  try {
    JSON.parse(fs.readFileSync(path, 'utf8'));
    console.log(file + ': OK');
  } catch(e) {
    console.log(file + ': FAIL - ' + e.message);
  }
}
