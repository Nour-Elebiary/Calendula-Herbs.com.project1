import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const messagesDir = join(__dirname, '..', 'src', 'messages')

const CUT_TRANSLATIONS = {
  ar: {
    WHOLE: 'كامل',
    CRUSHED: 'مكسر',
    POWDER: 'مسحوق',
    CUT_SIFTED: 'مقطع ومنخول',
    GRANULATED: 'محبب',
    LEAF: 'أوراق',
    STEM: 'سيقان',
    ROOT: 'جذور',
    TBC: 'سيتم التأكيد',
  },
  bg: {
    WHOLE: 'Цял',
    CRUSHED: 'Нарязан',
    POWDER: 'Прах',
    CUT_SIFTED: 'Рязан и пресят',
    GRANULATED: 'Гранулиран',
    LEAF: 'Листо',
    STEM: 'Стъбло',
    ROOT: 'Корен',
    TBC: 'За потвърждаване',
  },
  de: {
    WHOLE: 'Ganz',
    CRUSHED: 'Zerkleinert',
    POWDER: 'Pulver',
    CUT_SIFTED: 'Geschnitten und Gesiebt',
    GRANULATED: 'Granuliert',
    LEAF: 'Blatt',
    STEM: 'Stängel',
    ROOT: 'Wurzel',
    TBC: 'Wird bestätigt',
  },
  el: {
    WHOLE: 'Ολόκληρο',
    CRUSHED: 'Θρυμματισμένο',
    POWDER: 'Σκόνη',
    CUT_SIFTED: 'Κομμένο και Κοσκινισμένο',
    GRANULATED: 'Κοκκώδες',
    LEAF: 'Φύλλο',
    STEM: 'Μίσχος',
    ROOT: 'Ρίζα',
    TBC: 'Προς Επιβεβαίωση',
  },
  es: {
    WHOLE: 'Entero',
    CRUSHED: 'Triturado',
    POWDER: 'Polvo',
    CUT_SIFTED: 'Cortado y Tamizado',
    GRANULATED: 'Granulado',
    LEAF: 'Hoja',
    STEM: 'Tallo',
    ROOT: 'Raíz',
    TBC: 'Por Confirmar',
  },
  fr: {
    WHOLE: 'Entier',
    CRUSHED: 'Broyé',
    POWDER: 'Poudre',
    CUT_SIFTED: 'Coupé et Tamisé',
    GRANULATED: 'Granulé',
    LEAF: 'Feuille',
    STEM: 'Tige',
    ROOT: 'Racine',
    TBC: 'À Confirmer',
  },
  hi: {
    WHOLE: 'साबुत',
    CRUSHED: 'कुचला हुआ',
    POWDER: 'पाउडर',
    CUT_SIFTED: 'कट और छना हुआ',
    GRANULATED: 'दानेदार',
    LEAF: 'पत्ती',
    STEM: 'तना',
    ROOT: 'जड़',
    TBC: 'पुष्टि की जानी है',
  },
  it: {
    WHOLE: 'Intero',
    CRUSHED: 'Spezzato',
    POWDER: 'Polvere',
    CUT_SIFTED: 'Tagliato e Setacciato',
    GRANULATED: 'Granulato',
    LEAF: 'Foglia',
    STEM: 'Gambo',
    ROOT: 'Radice',
    TBC: 'Da Confermare',
  },
  ja: {
    WHOLE: 'ホール',
    CRUSHED: 'クラッシュド',
    POWDER: 'パウダー',
    CUT_SIFTED: 'カット＆シフテッド',
    GRANULATED: '顆粒',
    LEAF: 'リーフ',
    STEM: 'ステム',
    ROOT: 'ルート',
    TBC: '確認中',
  },
  ko: {
    WHOLE: '통조각',
    CRUSHED: '으깬 것',
    POWDER: '분말',
    CUT_SIFTED: '절단 및 체거름',
    GRANULATED: '과립',
    LEAF: '잎',
    STEM: '줄기',
    ROOT: '뿌리',
    TBC: '확인 필요',
  },
  nl: {
    WHOLE: 'Geheel',
    CRUSHED: 'Gebroken',
    POWDER: 'Poeder',
    CUT_SIFTED: 'Gesneden en Gezeefd',
    GRANULATED: 'Gegranuleerd',
    LEAF: 'Blad',
    STEM: 'Stengel',
    ROOT: 'Wortel',
    TBC: 'Te Bevestigen',
  },
  'pt-BR': {
    WHOLE: 'Inteiro',
    CRUSHED: 'Triturado',
    POWDER: 'Pó',
    CUT_SIFTED: 'Cortado e Peneirado',
    GRANULATED: 'Granulado',
    LEAF: 'Folha',
    STEM: 'Caule',
    ROOT: 'Raiz',
    TBC: 'A Confirmar',
  },
  ru: {
    WHOLE: 'Целый',
    CRUSHED: 'Дробленый',
    POWDER: 'Порошок',
    CUT_SIFTED: 'Резаный и просеянный',
    GRANULATED: 'Гранулированный',
    LEAF: 'Лист',
    STEM: 'Стебель',
    ROOT: 'Корень',
    TBC: 'Будет подтверждено',
  },
  tr: {
    WHOLE: 'Bütün',
    CRUSHED: 'Kırık',
    POWDER: 'Toz',
    CUT_SIFTED: 'Kesilmiş ve Elenmiş',
    GRANULATED: 'Granül',
    LEAF: 'Yaprak',
    STEM: 'Sap',
    ROOT: 'Kök',
    TBC: 'Onaylanacak',
  },
  uk: {
    WHOLE: 'Цілий',
    CRUSHED: 'Дроблений',
    POWDER: 'Порошок',
    CUT_SIFTED: 'Різаний та просіяний',
    GRANULATED: 'Гранульований',
    LEAF: 'Лист',
    STEM: 'Стебло',
    ROOT: 'Корінь',
    TBC: 'Буде підтверджено',
  },
  'zh-CN': {
    WHOLE: '整颗',
    CRUSHED: '压碎',
    POWDER: '粉末',
    CUT_SIFTED: '切碎过筛',
    GRANULATED: '颗粒',
    LEAF: '叶子',
    STEM: '茎',
    ROOT: '根',
    TBC: '待确认',
  },
}

const NO_DESCRIPTION = {
  ar: 'اتصل بنا للحصول على عروض أسعار التصدير بالجملة والمواصفات الكاملة.',
  bg: 'Свържете се с нас за оферти за износ на едро и пълни спецификации.',
  de: 'Kontaktieren Sie uns für Großeinkaufsangebote und vollständige Spezifikationen.',
  el: 'Επικοινωνήστε μαζί μας για προσφορές χονδρικής εξαγωγής και πλήρεις προδιαγραφές.',
  es: 'Contáctenos para cotizaciones de exportación al por mayor y especificaciones completas.',
  fr: 'Contactez-nous pour des devis d\'exportation en gros et des spécifications complètes.',
  hi: 'थोक निर्यात कोट्स और पूर्ण विशिष्टताओं के लिए हमसे संपर्क करें।',
  it: 'Contattaci per preventivi di esportazione all\'ingrosso e specifiche complete.',
  ja: '卸売りの輸出見積もりと完全な仕様についてはお問い合わせください。',
  ko: '도매 수출 견적 및 전체 사양에 대해 문의하십시오.',
  nl: 'Neem contact met ons op voor groothandelsexportoffertes en volledige specificaties.',
  'pt-BR': 'Contacte-nos para cotações de exportação a granel e especificações completas.',
  ru: 'Свяжитесь с нами для получения оптовых экспортных предложений и полных спецификаций.',
  tr: 'Toplu ihracat fiyat teklifleri ve tam özellikler için bizimle iletişime geçin.',
  uk: 'Зв\'яжіться з нами для отримання оптових експортних пропозицій та повних специфікацій.',
  'zh-CN': '联系我们获取批量出口报价和完整规格。',
}

const CUTFORM_EMPTY = {
  ar: 'اتصل بنا لخيارات التقطيع',
  bg: 'Свържете се с нас за опции за рязане',
  de: 'Kontaktieren Sie uns für Schnittoptionen',
  el: 'Επικοινωνήστε μαζί μας για επιλογές κοπής',
  es: 'Contáctenos para opciones de corte',
  fr: 'Contactez-nous pour les options de coupe',
  hi: 'कट विकल्पों के लिए हमसे संपर्क करें',
  it: 'Contattaci per le opzioni di taglio',
  ja: 'カットオプションについてはお問い合わせください',
  ko: '절단 옵션에 대해 문의하십시오',
  nl: 'Neem contact op voor snijopties',
  'pt-BR': 'Contacte-nos para opções de corte',
  ru: 'Свяжитесь с нами для выбора вариантов нарезки',
  tr: 'Kesim seçenekleri için bizimle iletişime geçin',
  uk: 'Зв\'яжіться з нами для вибору варіантів нарізки',
  'zh-CN': '联系我们了解切割选项',
}

const CERT_AVAILABLE = {
  ar: 'الشهادات متاحة',
  bg: 'Налични сертификати',
  de: 'Zertifizierungen verfügbar',
  el: 'Διαθέσιμες Πιστοποιήσεις',
  es: 'Certificaciones disponibles',
  fr: 'Certifications disponibles',
  hi: 'प्रमाणपत्र उपलब्ध हैं',
  it: 'Certificazioni disponibili',
  ja: '認証可能',
  ko: '인증 가능',
  nl: 'Certificeringen beschikbaar',
  'pt-BR': 'Certificações disponíveis',
  ru: 'Сертификаты доступны',
  tr: 'Sertifikalar mevcut',
  uk: 'Сертифікати доступні',
  'zh-CN': '可提供认证',
}

function addCutForms(locale) {
  const filePath = join(messagesDir, `${locale}.json`)
  if (!existsSync(filePath)) {
    console.log(`Skipping ${locale}: file not found`)
    return
  }
  let content = readFileSync(filePath, 'utf-8')

  // 1. Add cutForms object to products section
  // Find: "requestProduct": "..." near end of products block, followed by "  },"
  const requestLine = content.match(/^\s+"requestProduct": ".*?",?$/m)
  if (!requestLine) {
    console.log(`Skipping ${locale}: no requestProduct found`)
    return
  }

  const requestLineStr = requestLine[0]
  const hasTrailingComma = requestLineStr.endsWith(',')
  const cleanLine = hasTrailingComma ? requestLineStr.slice(0, -1) : requestLineStr

  // Build the cutForms JSON object
  const cuts = CUT_TRANSLATIONS[locale]
  const cutFormsLines = [
    `    "noDescription": "${NO_DESCRIPTION[locale]}",`,
    `    "cutForms": {`,
    ...Object.entries(cuts).map(([key, val], i, arr) =>
      `      "${key}": "${val}"${i < arr.length - 1 ? ',' : ''}`
    ),
    `    }`,
  ]
  const replacement = cleanLine + ',\n' + cutFormsLines.join('\n')

  content = content.replace(requestLineStr, replacement)

  // 2. Translate cutFormEmpty and certAvailable in productDetail
  content = content.replace(
    `"cutFormEmpty": "Contact us for cut options"`,
    `"cutFormEmpty": "${CUTFORM_EMPTY[locale]}"`
  )
  content = content.replace(
    `"certAvailable": "Certifications Available"`,
    `"certAvailable": "${CERT_AVAILABLE[locale]}"`
  )

  writeFileSync(filePath, content, 'utf-8')
  console.log(`✓ Updated ${locale}`)
}

const locales = Object.keys(CUT_TRANSLATIONS)
locales.forEach(addCutForms)
console.log(`\nDone! Updated ${locales.length} locale files.`)
