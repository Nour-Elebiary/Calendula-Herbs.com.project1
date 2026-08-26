import type { Metadata } from 'next'
import { Cormorant_Garamond, Dancing_Script, DM_Sans, JetBrains_Mono, Noto_Naskh_Arabic } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { isRtlLocale, routing, type Locale } from '@/i18n/routing'
import { JsonLd } from '@/components/shared/JsonLd'
import './globals.css'

const cormorantGaramond = Cormorant_Garamond({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
})

const dancingScript = Dancing_Script({
  variable: '--font-script',
  subsets: ['latin'],
  weight: ['600', '700'],
  display: 'swap',
})

const dmSans = DM_Sans({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
})

const notoNaskhArabic = Noto_Naskh_Arabic({
  variable: '--font-arabic',
  subsets: ['arabic'],
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://calendula-herbs.com'
const normalizedUrl = siteUrl.startsWith('http://') || siteUrl.startsWith('https://')
  ? siteUrl
  : `https://${siteUrl}`

export const metadata: Metadata = {
  metadataBase: new URL(normalizedUrl),
  title: {
    template: '%s | Calendula Herbs',
    default: 'Calendula Herbs For Import & Export — Premium Organic Herbs from Egypt',
  },
  description:
    'Premium organic herbs, spices & seeds from Egypt. Certified organic, global export. Calendula, chamomile, hibiscus, moringa and more.',
  keywords: [
    'organic herbs Egypt',
    'herb export',
    'calendula herb',
    'chamomile Egypt',
    'organic spices',
    'herb import export',
    'Egyptian herbs supplier',
    'bulk herbs wholesale',
    'moringa export Egypt',
    'hibiscus karkade export',
    'فلفل الأعشاب مصر',
    '有机草药出口',
  ],
  authors: [{ name: 'Calendula Herbs For Import & Export' }],
  creator: 'Calendula Herbs',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['ar_EG', 'zh_CN', 'ru_RU'],
    siteName: 'Calendula Herbs',
    url: normalizedUrl,
    images: [{ url: `${normalizedUrl}/og-image.jpg`, width: 1200, height: 630, alt: 'Calendula Herbs — Premium Organic Herbs from Egypt' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@CalendulaHerbs',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  // ── Search Engine Webmaster Verification ──────────────────────────────
  // All values come from environment variables — never hard-code tokens here.
  // Set each variable in your hosting platform (Vercel → Environment Variables).
  verification: {
    // Google Search Console → Settings → Ownership → HTML meta tag method
    google: process.env.GOOGLE_SITE_VERIFICATION || '',
    // Yandex Webmaster → Site validation → Meta tag
    yandex: process.env.YANDEX_VERIFICATION || '',
    other: {
      // Bing Webmaster Tools → Add site → Meta tag method
      'msvalidate.01': process.env.BING_SITE_VERIFICATION || '',
      // Baidu Ziyuan (百度站长平台) → Site management → Meta verification
      'baidu-site-verification': process.env.BAIDU_SITE_VERIFICATION || '',
      // Naver Search Advisor (South Korea)
      'naver-site-verification': process.env.NAVER_SITE_VERIFICATION || '',
      // 360 Search / Haosou (China)
      '360-site-verification': process.env.HAOSOU_SITE_VERIFICATION || '',
      // Sogou Webmaster (China)
      'sogou_verification': process.env.SOGOU_SITE_VERIFICATION || '',
      // Seznam Webmaster (Czechia)
      'seznam-wmt': process.env.SEZNAM_SITE_VERIFICATION || '',
      // Pinterest domain verification (improves Rich Pin discovery)
      'p:domain_verify': process.env.PINTEREST_SITE_VERIFICATION || '',
    },
  },
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${normalizedUrl}/#organization`,
  name: 'Calendula Herbs For Import & Export',
  alternateName: ['Calendula Herbs', 'كالنديولا هيربس للاستيراد والتصدير', '金盏花草药进出口'],
  url: normalizedUrl,
  logo: {
    '@type': 'ImageObject',
    url: `${normalizedUrl}/icon`,
    contentUrl: `${normalizedUrl}/icon`,
  },
  description:
    'Premium certified organic herbs, spices & seeds from Egypt. Specialising in calendula, chamomile, hibiscus, moringa, and more — supplied globally in bulk.',
  foundingDate: '2015',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'EG',
    addressRegion: 'Fayoum',
    addressLocality: 'Fayoum',
  },
  areaServed: { '@type': 'Place', 'name': 'Worldwide' },
  knowsAbout: [
    'Organic Herbs', 'Herbal Export', 'Calendula', 'Chamomile', 'Hibiscus',
    'Moringa', 'Organic Spices', 'Bulk Herb Wholesale', 'Egyptian Agriculture',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Egyptian Organic Herbs & Spices Catalog',
    url: `${normalizedUrl}/products`,
  },
  sameAs: [
    'https://eg.linkedin.com/company/calendula-herbs-import-export',
  ],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'sales',
      availableLanguage: ['English', 'Arabic'],
      url: `${normalizedUrl}/contact`,
    },
    {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      availableLanguage: ['English', 'Arabic'],
      url: `${normalizedUrl}/contact`,
    },
  ],
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${normalizedUrl}/#website`,
  name: 'Calendula Herbs',
  url: normalizedUrl,
  inLanguage: ['en', 'ar'],
  publisher: { '@id': `${normalizedUrl}/#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${normalizedUrl}/products?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

// FAQPage JSON-LD — critical for AEO (Answer Engine Optimization).
// AI assistants (Perplexity, Copilot, Gemini) extract these Q&A pairs
// to answer user questions, building brand visibility in AI search.
const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Where are Calendula Herbs products sourced from?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'All Calendula Herbs products are grown and processed in Fayoum, Egypt — a region renowned for its fertile agricultural land along the Nile basin. We control the entire supply chain from cultivation to export.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Calendula Herbs export globally?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Calendula Herbs For Import & Export ships certified organic herbs, spices, and seeds worldwide, including to Europe, the United States, Asia, and the GCC countries.',
      },
    },
    {
      '@type': 'Question',
      name: 'What herbs and spices does Calendula Herbs supply?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Our product range includes calendula flowers, chamomile, hibiscus (karkade), moringa, fenugreek, black seed (nigella sativa), cumin, coriander, dill, fennel, peppermint, spearmint, and many more Egyptian-grown organic herbs and spices.',
      },
    },
    {
      '@type': 'Question',
      name: 'What certifications does Calendula Herbs hold?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Calendula Herbs holds international organic certifications. Full certification documentation is available on our Certificates page and provided to buyers upon request.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the minimum order quantity (MOQ)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Minimum order quantities vary by product. Most bulk herbs start at 25 kg. Contact us for a custom quote based on your specific volume and packaging requirements.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I request a sample before placing a bulk order?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Calendula Herbs offers product samples to qualified buyers. You can submit a sample request directly on our website.',
      },
    },
  ],
}

export const dynamic = 'force-dynamic'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()
  const dir = isRtlLocale(locale as Locale) ? 'rtl' : 'ltr'

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${cormorantGaramond.variable} ${dancingScript.variable} ${dmSans.variable} ${jetbrainsMono.variable} ${notoNaskhArabic.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FAFAF6" />
        <link rel="apple-touch-icon" href="/icon" />
        <link rel="alternate" hrefLang={locale} href={normalizedUrl} />
        {routing.locales.map(l => (
          <link key={l} rel="alternate" hrefLang={l} href={normalizedUrl} />
        ))}
        <link rel="alternate" hrefLang="x-default" href={normalizedUrl} />
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var theme = localStorage.getItem('calendula-theme');
                if (!theme) theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                if (theme === 'dark') document.documentElement.classList.add('dark');
              } catch(e) {}
            })();
          `
        }} />
        <JsonLd data={organizationJsonLd} />
        <JsonLd data={websiteJsonLd} />
        <JsonLd data={faqJsonLd} />
      </head>
      <body className="min-h-full flex flex-col antialiased bg-[var(--color-bg-void)] text-[var(--color-text-primary)]">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <div id="main-content">
            {children}
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
