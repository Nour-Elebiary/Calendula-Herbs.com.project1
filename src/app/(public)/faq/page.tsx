import React from 'react'
import { db } from '@/lib/db'
import { HelpCircle, ChevronDown } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const normalizedUrl = siteUrl.startsWith('http://') || siteUrl.startsWith('https://')
  ? siteUrl
  : `https://${siteUrl}`

export async function generateMetadata() {
  const t = await getTranslations('faq')
  return {
    title: t('heroMetadataTitle'),
    description: t('heroMetadataDesc'),
  }
}

type FaqItem = { question: string; answer: string }

function FaqAccordion({ items }: { items: FaqItem[] }) {
  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <details key={index} className="card-glass group [&[open]]:border-[var(--color-border-accent)]">
          <summary className="flex items-center justify-between p-5 md:p-6 cursor-pointer list-none">
            <span className="text-left font-medium pr-4" style={{ color: 'var(--color-text-primary)' }}>
              {item.question}
            </span>
            <ChevronDown
              className="h-5 w-5 shrink-0 transition-transform duration-200 group-open:rotate-180"
              style={{ color: 'var(--color-green-600)' }}
            />
          </summary>
          <div
            className="px-5 md:px-6 pb-5 md:pb-6 pt-4"
            style={{ borderTop: '1px solid var(--color-border-subtle)' }}
          >
            <p className="leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              {item.answer}
            </p>
          </div>
        </details>
      ))}
    </div>
  )
}

function FaqPageSchema({ items }: { items: FaqItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export default async function FaqPage() {
  const t = await getTranslations('faq')
  const tn = await getTranslations('nav')
  const setting = await db.siteSetting.findUnique({ where: { key: 'faqs' } })

  const defaultFaqs: FaqItem[] = t.raw('items') as FaqItem[]
  let faqs: FaqItem[] = defaultFaqs
  if (setting?.value) {
    try {
      const parsed = JSON.parse(setting.value)
      if (Array.isArray(parsed) && parsed.length > 0) faqs = parsed
    } catch {}
  }

  return (
    <div className="page-root">
      <div className="page-content">
        <section className="hero-page">
          <div className="hero-page__bg hero-page__bg--faq" />
          <div className="hero-page__content">
            <div className="hero-page__glass-card">
              <h1 className="hero-page__title">{t('heroTitle')}</h1>
              <p className="hero-page__desc">{t('heroDesc')}</p>
            </div>
          </div>
        </section>

        <FaqPageSchema items={faqs} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: tn('home'), item: normalizedUrl },
                { '@type': 'ListItem', position: 2, name: t('heroTitle'), item: `${normalizedUrl}/faq` },
              ],
            }),
          }}
        />

        <div className="section" style={{ maxWidth: 'var(--container-tight)', margin: '0 auto' }}>
          {faqs.length === 0 ? (
            <div className="card-glass py-24 text-center">
              <HelpCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-text-tertiary)' }} />
              <h3 className="font-display text-2xl font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>{t('empty')}</h3>
            </div>
          ) : (
            <FaqAccordion items={faqs} />
          )}

          <div
            className="card-glass mt-16 p-8 md:p-10 text-center"
            style={{ borderColor: 'var(--color-border-accent)' }}
          >
            <h2 className="font-display text-2xl font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>{t('stillQuestions')}</h2>
            <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>{t('teamReady')}</p>
            <a href="/contact" className="btn btn-primary btn-lg">{t('contactButton')}</a>
          </div>
        </div>
      </div>
    </div>
  )
}
