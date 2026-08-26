import React, { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { db } from '@/lib/db'
import { Leaf, Search, Package, FileSearch } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { ProductGridClient } from './ProductGridClient'
import { getTranslations, getLocale } from 'next-intl/server'
import { JsonLd } from '@/components/shared/JsonLd'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://calendula-herbs.com'
const normalizedUrl = siteUrl.startsWith('http://') || siteUrl.startsWith('https://')
  ? siteUrl
  : `https://${siteUrl}`

export async function generateMetadata() {
  const t = await getTranslations('products')
  return {
    title: t('heroMetadataTitle'),
    description: t('heroMetadataDesc'),
  }
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const t = await getTranslations('products')
  const tn = await getTranslations('nav')
  const locale = await getLocale()
  const { q, category } = await searchParams

  const [categories, products] = await Promise.all([
    db.category.findMany({
      orderBy: { order: 'asc' },
      include: { translations: { where: { locale } } },
    }),
    db.product.findMany({
      where: {
        isActive: true,
        ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
        ...(category ? { categories: { some: { category: { slug: category } } } } : {})
      },
      include: {
        images: { orderBy: { order: 'asc' }, include: { mediaFile: true } },
        categories: { include: { category: true } },
        translations: { where: { locale } },
      },
      orderBy: { order: 'asc' }
    })
  ])

  const categoryNameMap = new Map(
    categories.map(c => [c.id, c.translations?.[0]?.name ?? c.name])
  )

  const productCards = products.map((product) => {
    const tr = product.translations[0]
    const mainImage = product.images[0]?.mediaFile.url
    return {
      id: product.id,
      slug: product.slug,
      name: tr?.name ?? product.name,
      scientificName: tr?.scientificName ?? product.scientificName,
      commonName: tr?.commonName ?? product.commonName,
      shortDescription: tr?.shortDescription ?? product.shortDescription,
      description: tr?.description ?? product.description,
      isOrganic: product.isOrganic,
      organicType: product.organicType,
      conventionalType: product.conventionalType,
      minOrderKg: product.minOrderKg,
      availableCuts: product.availableCuts,
      mainImage,
      images: product.images.map(img => ({
        id: img.id,
        url: img.mediaFile.url,
        thumbnailUrl: img.mediaFile.thumbnailUrl,
      })),
      categories: product.categories.map(c => ({
        id: c.category.id,
        name: categoryNameMap.get(c.category.id) ?? c.category.name,
        slug: c.category.slug,
      })),
    }
  })

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: productCards.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: p.name,
        description: p.shortDescription,
        ...(p.mainImage ? { image: p.mainImage } : {}),
        offers: {
          '@type': 'Offer',
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          description: `Minimum order: ${p.minOrderKg} KG`,
        },
      },
    })),
  }

  return (
    <div className="page-root">
      <div className="page-content">
        <JsonLd data={productSchema} />

        <JsonLd data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: tn('home'), item: normalizedUrl },
            { '@type': 'ListItem', position: 2, name: t('heroTitle'), item: `${normalizedUrl}/products` },
          ],
        }} />

        {/* Header */}
        <section className="hero-page">
          <div className="hero-page__bg hero-page__bg--products" />
          <div className="hero-page__overlay hero-page__overlay--products" />
          <div className="hero-page__content">
            <div className="hero-page__glass-card hero-page__glass-card--dark">
              <h1 className="hero-page__title">{t('heroTitle')}</h1>
              <p className="hero-page__desc">{t('heroDesc')}</p>
            </div>
          </div>
        </section>

        <div className="container" style={{ marginTop: '-2rem' }}>
          <div className="flex flex-col md:flex-row gap-8">
            
            {/* Sidebar / Filters */}
            <div className="w-full md:w-64 shrink-0 space-y-6">
              <div className="card-glass p-6">
                <form className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
                  <Input 
                    name="q"
                    defaultValue={q}
                    placeholder={t('searchPlaceholder')} 
                    className="pl-10 bg-[var(--color-glass-fill)]"
                  />
                  {category && <input type="hidden" name="category" value={category} />}
                </form>

                <h3 className="font-display font-bold text-lg text-[var(--color-text-primary)] mb-4">{t('sidebarTitle')}</h3>
                <ul className="space-y-2">
                  <li>
                    <Link 
                      href={q ? `/products?q=${q}` : `/products`}
                      className={`block px-3 py-2 rounded-lg text-sm transition-colors ${!category ? 'bg-[var(--color-green-500)] text-[var(--color-text-inverse)] font-medium' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]'}`}
                    >
                      {t('filterAllLabel')}
                    </Link>
                  </li>
                  {categories.map(c => {
                    const ctName = c.translations?.[0]?.name
                    return (
                      <li key={c.id}>
                        <Link
                          href={`/products?category=${c.slug}${q ? `&q=${q}` : ''}`}
                          className={`block px-3 py-2 rounded-lg text-sm transition-colors ${category === c.slug ? 'bg-[var(--color-green-500)] text-[var(--color-text-inverse)] font-medium' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)]'}`}
                        >
                          {ctName ?? c.name}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1 pb-16">
              {products.length === 0 ? (
                <div className="card-glass p-16 text-center">
                  <Leaf className="w-12 h-12 text-[var(--color-text-tertiary)] mx-auto mb-4 opacity-40" />
                  <h3 className="text-xl font-medium text-[var(--color-text-primary)] mb-2">{t('noResults')}</h3>
                  <p className="text-[var(--color-text-secondary)] mb-6">{t('noResultsDesc')}</p>
                  <Link href="/products" className="btn btn-primary">{t('clearFilters')}</Link>
                </div>
              ) : (
                <Suspense fallback={<div className="text-center py-12 text-[var(--color-text-secondary)]">{t('loading')}</div>}>
                  <ProductGridClient products={productCards} />
                </Suspense>
              )}

              {/* Can't find what you need? */}
              <div className="mt-12 card-glass p-8 text-center border-2 border-dashed border-[var(--color-green-200)]">
                <FileSearch className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--color-green-600)' }} />
                <h3 className="font-display text-xl font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>{t('cantFindTitle')}</h3>
                <p className="text-sm mb-4" style={{ color: 'var(--color-text-tertiary)' }}>{t('cantFindDesc')}</p>
                <Link href="/product-request" className="btn btn-accent">
                  <FileSearch className="w-4 h-4 mr-2" /> {t('requestProduct')}
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
