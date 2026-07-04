import type { Metadata } from 'next'
import { Cormorant_Garamond, Dancing_Script, DM_Sans, JetBrains_Mono } from 'next/font/google'
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

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  ),
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
  ],
  authors: [{ name: 'Calendula Herbs For Import & Export' }],
  creator: 'Calendula Herbs',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Calendula Herbs',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${cormorantGaramond.variable} ${dancingScript.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FAFAF6" />
        <link rel="apple-touch-icon" href="/icon" />
      </head>
      <body className="min-h-full flex flex-col antialiased bg-[var(--color-bg-void)] text-[var(--color-text-primary)]">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <div id="main-content">
          {children}
        </div>
      </body>
    </html>
  )
}
