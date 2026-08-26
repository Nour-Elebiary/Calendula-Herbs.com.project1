import React from 'react'
import { db } from '@/lib/db'
import { COMPANY_FOUNDED_YEAR } from '@/lib/constants'
import Link from 'next/link'
import { getTranslations, getLocale } from 'next-intl/server'
import { HeroSection } from '@/components/public/home/HeroSection'
import { StatsBar } from '@/components/public/home/StatsBar'
import { FeaturedProductsSection } from '@/components/public/home/FeaturedProductsSection'
import { BotanicalAboutSection } from '@/components/public/home/BotanicalAboutSection'
import { ProcessSection } from '@/components/public/home/ProcessSection'
import { CertsBanner } from '@/components/public/home/CertsBanner'
import { ScrollReveal } from '@/components/public/shared/ScrollReveal'

export async function generateMetadata() {
  const t = await getTranslations('home')
  
  let founded = COMPANY_FOUNDED_YEAR
  try {
    const setting = await db.siteSetting.findUnique({ where: { key: 'company_founded' } })
    if (setting?.value) founded = setting.value
  } catch (err) {
    console.error('generateMetadata: DB fetch failed, using default founded year')
  }

  return {
    title: 'Home | Calendula Herbs For Import & Export',
    description: t('heroDescription', { year: founded }).replace(/<[^>]+>/g, ''),
  }
}

export default async function HomePage() {
  const t = await getTranslations('home')
  const locale = await getLocale()
  type FeaturedProductImage = { mediaFile: { url: string } }
  type FeaturedProduct = {
    id: string; slug: string; name: string
    scientificName: string | null; commonName: string | null
    shortDescription: string | null
    isOrganic: boolean; organicType: string | null
    conventionalType: string | null; minOrderKg: number
    availableCuts: string[]
    images: FeaturedProductImage[]
    translations?: { name: string; commonName: string | null; shortDescription: string | null }[]
  }

  let featuredProducts: FeaturedProduct[] = []
  const settings: Record<string, string> = {}

  try {
    const [products, settingsRow] = await Promise.all([
      db.product.findMany({
        where: { isFeatured: true, isActive: true },
        include: {
          images: { orderBy: { order: 'asc' }, take: 1, include: { mediaFile: true } },
          translations: { where: { locale } }
        },
        orderBy: { order: 'asc' },
        take: 6,
      }),
      db.siteSetting.findMany({
        where: { key: { in: ['site_tagline', 'company_founded'] } }
      }),
    ])
    featuredProducts = products.map(p => {
      const tr = p.translations?.[0]
      return {
        ...p,
        name: tr?.name ?? p.name,
        commonName: tr?.commonName ?? p.commonName,
        shortDescription: tr?.shortDescription ?? p.shortDescription
      }
    })
    settingsRow.forEach(s => { settings[s.key] = s.value })
  } catch (err) {
    console.error('HomePage: DB fetch failed, rendering with defaults:', err)
  }

  return (
    <div className="flex flex-col">
      {/* 2. HERO */}
      <HeroSection
        tagline={settings.site_tagline || ''}
        founded={settings.company_founded || COMPANY_FOUNDED_YEAR}
      />

      {/* 3. CERT STRIP — trust signals above fold */}
      <section className="section section--tint">
        <div className="container max-w-7xl">
          <CertsBanner />
        </div>
      </section>

      {/* 4. ABOUT INTRO — Heritage stats */}
      <section className="section">
        <div className="container max-w-7xl">
          <StatsBar />
        </div>
      </section>

      {/* 5. PRODUCTS — Featured products */}
      <FeaturedProductsSection products={featuredProducts} />

      {/* 6. HOW IT WORKS — Process */}
      <ProcessSection />

      {/* 7. SERVICES — Custom cut, labeling, samples, sterilization */}
      <BotanicalAboutSection />

      {/* 8. BIOFACH — Expo presence */}
      <ScrollReveal>
        <section className="section section--tint">
          <div className="container max-w-7xl text-center">
            <div className="card-glass p-12 max-w-3xl mx-auto">
              <span className="badge badge-calendula mb-4">{t('biofachBadge')}</span>
              <h2 className="font-display text-3xl md:text-4xl font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {t('biofachTitle')}
              </h2>
              <p className="mt-4" style={{ color: 'var(--color-text-secondary)' }}>
                {t('biofachDesc')}
              </p>
              <div className="flex items-center justify-center gap-4 mt-8 flex-wrap">
                <Link href="/contact" className="btn btn-primary">{t('biofachCta')}</Link>
                <Link href="/certificates" className="btn btn-secondary">{t('biofachSecondaryCta')}</Link>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 10. CONTACT CTA */}
      <ScrollReveal>
        <section className="section section-cta-green relative overflow-hidden">

          <div className="container max-w-7xl text-center relative z-10">
            <h2 className="font-display text-4xl md:text-5xl font-medium" style={{ color: 'rgba(250,250,246,0.95)' }}>
              {t('ctaAltTitle')}
            </h2>
            <p className="mt-4 text-lg max-w-2xl mx-auto" style={{ color: 'rgba(250,250,246,0.75)' }}>
              {t('ctaAltDesc')}
            </p>
            <div className="flex items-center justify-center gap-4 mt-10 flex-wrap">
              <Link href="/contact" className="btn btn-accent btn-lg">{t('ctaAltButton')}</Link>
              <Link href="/products" className="btn" style={{
                padding: 'var(--space-4) var(--space-10)',
                background: 'transparent',
                color: 'rgba(250,250,246,0.95)',
                border: '1px solid rgba(250,250,246,0.3)',
                borderRadius: 'var(--radius-full)'
              }}>
                {t('ctaAltSecondary')}
              </Link>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  )
}
