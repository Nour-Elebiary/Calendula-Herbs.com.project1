import React from 'react'
import { db } from '@/lib/db'
import Link from 'next/link'
import { HeroSection } from '@/components/public/home/HeroSection'
import { StatsBar } from '@/components/public/home/StatsBar'
import { FeaturedProductsSection } from '@/components/public/home/FeaturedProductsSection'
import { BotanicalAboutSection } from '@/components/public/home/BotanicalAboutSection'
import { ProcessSection } from '@/components/public/home/ProcessSection'
import { CertsBanner } from '@/components/public/home/CertsBanner'
import { ScrollReveal } from '@/components/public/shared/ScrollReveal'

export const metadata = {
  title: 'Home | Calendula Herbs For Import & Export',
  description: 'Premium Egyptian dried herbs, spices, herbal tea and seeds for global export. Certified organic, 45 years of farming heritage.',
}

export default async function HomePage() {
  const [featuredProducts, settingsRow] = await Promise.all([
    db.product.findMany({
      where: { isFeatured: true, isActive: true },
      include: { images: { orderBy: { order: 'asc' }, take: 1, include: { mediaFile: true } } },
      orderBy: { order: 'asc' },
      take: 6,
    }),
    db.siteSetting.findMany({
      where: { key: { in: ['site_tagline', 'company_founded'] } }
    }),
  ])

  const settings: Record<string, string> = {}
  settingsRow.forEach(s => { settings[s.key] = s.value })

  return (
    <div className="flex flex-col">
      {/* 2. HERO */}
      <HeroSection
        tagline={settings.site_tagline || ''}
        founded={settings.company_founded || '2005'}
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
              <span className="badge badge-calendula mb-4">BIOFACH Participant</span>
              <h2 className="font-display text-3xl md:text-4xl font-medium" style={{ color: 'var(--color-text-primary)' }}>
                Exhibiting at BIOFACH for Over 4 Years
              </h2>
              <p className="mt-4" style={{ color: 'var(--color-text-secondary)' }}>
                Meet us at the world&apos;s leading organic trade fair. Connect with our team to discuss partnerships, sample our products, and experience our quality firsthand.
              </p>
              <div className="flex items-center justify-center gap-4 mt-8 flex-wrap">
                <Link href="/contact" className="btn btn-primary">Contact Us for a Meeting</Link>
                <Link href="/certificates" className="btn btn-secondary">View Our Certificates</Link>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* 10. CONTACT CTA */}
      <ScrollReveal>
        <section className="section" style={{ background: 'var(--color-green-800)' }}>
          <div className="container max-w-7xl text-center">
            <h2 className="font-display text-4xl md:text-5xl font-medium" style={{ color: 'var(--color-text-inverse)' }}>
              Ready to Source Premium Egyptian Herbs?
            </h2>
            <p className="mt-4 text-lg max-w-2xl mx-auto" style={{ color: 'rgba(250,250,246,0.75)' }}>
              Get in touch with our team for bulk quotes, product specifications, and sample requests.
            </p>
            <div className="flex items-center justify-center gap-4 mt-10 flex-wrap">
              <Link href="/contact" className="btn btn-accent btn-lg">Request a Quote</Link>
              <Link href="/products" className="btn" style={{
                padding: 'var(--space-4) var(--space-10)',
                background: 'transparent',
                color: 'var(--color-text-inverse)',
                border: '1px solid rgba(250,250,246,0.3)',
                borderRadius: 'var(--radius-full)'
              }}>
                Browse Products
              </Link>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  )
}
