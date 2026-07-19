import React, { Suspense } from 'react'
import { Package, FileSearch } from 'lucide-react'
import { ProductRequestForm } from './ProductRequestForm'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('productRequest')
  return {
    title: t('heroMetadataTitle'),
    description: t('heroMetadataDesc'),
  }
}

export default async function ProductRequestPage() {
  const t = await getTranslations('productRequest')
  return (
    <div className="page-root">
      <div className="page-content">
        <section className="hero-page">
          <div className="hero-page__bg hero-page__bg--product-request" />
          <div className="hero-page__content">
            <div className="hero-page__glass-card">
              <h1 className="hero-page__title">{t('heroTitle')}</h1>
              <p className="hero-page__desc">{t('heroDesc')}</p>
            </div>
          </div>
        </section>

        <div className="section" style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
          <div className="grid lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="font-display text-2xl font-medium mb-4" style={{ color: 'var(--color-text-primary)' }}>{t('howItWorks')}</h2>
                <ul className="space-y-4">
                  {[
                    { icon: FileSearch, titleKey: 'step1Title', descKey: 'step1Desc' },
                    { icon: Package, titleKey: 'step2Title', descKey: 'step2Desc' },
                    { icon: Package, titleKey: 'step3Title', descKey: 'step3Desc' },
                  ].map((step, i) => (
                    <li key={i} className="flex gap-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(94,158,102,0.10)' }}
                      >
                        <step.icon className="w-5 h-5" style={{ color: 'var(--color-green-600)' }} />
                      </div>
                      <div>
                        <h4 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{t(step.titleKey)}</h4>
                        <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>{t(step.descKey)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card-glass p-6 space-y-3">
                <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{t('whatWeCanSource')}</h3>
                <ul className="space-y-2" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                  <li className="flex items-start gap-2"><span className="text-green-600 shrink-0">•</span> {t('item1')}</li>
                  <li className="flex items-start gap-2"><span className="text-green-600 shrink-0">•</span> {t('item2')}</li>
                  <li className="flex items-start gap-2"><span className="text-green-600 shrink-0">•</span> {t('item3')}</li>
                  <li className="flex items-start gap-2"><span className="text-green-600 shrink-0">•</span> {t('item4')}</li>
                  <li className="flex items-start gap-2"><span className="text-green-600 shrink-0">•</span> {t('item5')}</li>
                  <li className="flex items-start gap-2"><span className="text-green-600 shrink-0">•</span> {t('item6')}</li>
                </ul>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="card-glass p-8 md:p-10">
                <h2 className="font-display text-3xl font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>{t('formTitle')}</h2>
                <p className="mb-8" style={{ color: 'var(--color-text-tertiary)' }}>{t('formDesc')}</p>
                <Suspense fallback={<div className="text-center py-8" style={{ color: 'var(--color-text-tertiary)' }}>{t('loading')}</div>}>
                  <ProductRequestForm />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
