import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const messagesDir = join(__dirname, '..', 'src', 'messages')

const FAQ_ITEMS = [
  {
    question: 'What is your minimum order quantity (MOQ)?',
    answer: 'Our standard MOQ is 500–1,000 kg per product depending on the item and season. We can accommodate smaller trial orders (50–100 kg) for first-time qualified buyers. Contact our sales team to discuss your specific volume needs.'
  },
  {
    question: 'Do you offer free samples for quality evaluation?',
    answer: 'Yes, we provide free samples of 50–200 g for qualified B2B buyers. The buyer covers shipping costs unless otherwise negotiated. Submit a sample request through our website, and our team will prepare material from current production batches.'
  },
  {
    question: 'What sterilization options do you offer?',
    answer: 'We offer several sterilization methods including steam sterilization (autoclave), ethylene oxide (EtO), and gamma irradiation depending on product specifications and destination country requirements. Our processing facilities follow GMP and HACCP guidelines. Please specify your sterilization requirements when requesting a quote.'
  },
  {
    question: 'Can you provide pricing on your website?',
    answer: 'Herb and spice prices fluctuate with crop yields, market conditions, and seasonality. We provide accurate, current pricing only after understanding your specific requirements — volume, quality grade, packaging, and destination. Contact us for a tailored quotation.'
  },
  {
    question: 'What certifications do you hold?',
    answer: 'We hold 11 major certifications including ISO 9001, ISO 22000, EU Organic, USDA NOP, HALAL, KOSHER, BRCGS, FDA Registration, SEDEX/Semeta, NFSA Whitelist, and AHK Council membership. Visit our Certificates page for full details. We can provide certificates upon request for your compliance review.'
  },
  {
    question: 'What are your shipping terms and lead times?',
    answer: 'We ship worldwide via air and sea freight. Common incoterms include FOB (Damietta or Alexandria ports), CIF, and EXW. Lead times are 7–14 days for stock items and 20–30 days for custom processing. We work with reliable freight forwarders and can assist with logistics arrangements.'
  },
  {
    question: 'What payment terms do you accept?',
    answer: 'Payment terms are discussed and agreed per order based on order value, destination, and buyer history. Typical arrangements include T/T (wire transfer) and L/C (letter of credit). Contact our sales team to discuss the best option for your order.'
  },
  {
    question: 'Do you source exclusively from your own farms?',
    answer: 'We own and operate our own farms in Ibshaway, Fayoum, Egypt — over 500 acres dedicated to organic calendula, chamomile, hibiscus, and other botanicals. We supplement with trusted partner farms under our direct agronomist supervision to ensure consistent quality, traceability, and year-round availability.'
  },
  {
    question: 'How do you ensure product quality and consistency?',
    answer: 'Quality is ensured at every stage: seed selection, cultivation, harvesting, processing, and packaging. We conduct in-house laboratory testing for purity, potency, microbiological contamination, and heavy metals. Our quality management system is ISO 9001 and ISO 22000 certified, following GMP and HACCP guidelines throughout.'
  },
  {
    question: 'Can I visit your farm or processing facility?',
    answer: 'Yes, we welcome visits from serious buyers and importers. Please contact us in advance to schedule a tour of our farms, processing facilities, and quality control labs in Fayoum, Egypt. We recommend allowing at least two weeks for visa and travel arrangements.'
  },
  {
    question: 'How do I place a bulk order?',
    answer: 'Browse our product catalog, submit an inquiry through our Request a Quote form, or contact our sales team directly. We will respond within 24 hours with product specifications, current pricing, and next steps including sample provision and contract terms.'
  },
  {
    question: 'Do you offer private labelling or custom packaging?',
    answer: 'Yes, we offer private labelling, custom packaging, and OEM services for B2B partners. Minimum quantities apply. Contact us with your specifications for a detailed proposal.'
  },
]

const locales = ['en', 'ar', 'es', 'it', 'ja', 'ko', 'hi', 'ru', 'uk', 'pt-BR', 'zh-CN', 'fr', 'nl', 'de', 'bg', 'el', 'tr']

for (const locale of locales) {
  const filePath = join(messagesDir, `${locale}.json`)
  const content = JSON.parse(readFileSync(filePath, 'utf-8'))
  content.faq.items = FAQ_ITEMS
  writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n')
  console.log(`✅ Updated ${locale}.json with FAQ items`)
}
