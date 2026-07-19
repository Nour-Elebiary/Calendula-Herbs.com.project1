import React from 'react'
import DOMPurify from 'isomorphic-dompurify'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('terms')
  return {
    title: t('heroMetadataTitle'),
    description: t('heroMetadataDesc'),
  }
}

const TERMS_SECTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

export default async function TermsPage() {
  const t = await getTranslations('terms')
  return (
    <div className="page-root">
      <div className="page-content">
        <section className="hero-page">
          <div className="hero-page__bg hero-page__bg--legal" />
          <div className="hero-page__content">
            <div className="hero-page__glass-card">
              <h1 className="hero-page__title">{t('heroTitle')}</h1>
              <p className="text-sm mt-2" style={{ color: 'var(--color-text-tertiary)' }}>{t('lastUpdated', { date: 'June 2026' })}</p>
            </div>
          </div>
        </section>

        <div className="section" style={{ maxWidth: 'var(--container-tight)', margin: '0 auto' }}>
          <div className="card-glass p-8 md:p-10 space-y-6" style={{ color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-loose)' }}>
            {TERMS_SECTIONS.map((i) => {
              const sectionKey = `section${i}`
              return (
                <div key={i}>
                  <h2 className="font-display text-2xl font-medium" style={{ color: 'var(--color-text-primary)' }}>
                    {t(`${sectionKey}.title`)}
                  </h2>
                  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(t.raw(`${sectionKey}.body`) || '') }} />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
