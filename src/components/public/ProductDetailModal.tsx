'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { X, Leaf, CheckCircle2, Package, Award, Scissors, ChevronRight, Loader2 } from 'lucide-react'
import { ProductActions } from './ProductActions'
import DOMPurify from 'isomorphic-dompurify'

type ProductFull = {
  id: string
  name: string
  scientificName: string | null
  slug: string
  description: string | null
  shortDescription: string | null
  isOrganic: boolean
  organicType: string | null
  conventionalType: string | null
  minOrderKg: number
  images: { id: string; mediaFile: { url: string; thumbnailUrl: string | null } }[]
  categories: { category: { id: string; name: string; slug: string; translations?: { name: string }[] } }[]
}

type Props = {
  slug: string | null
  onClose: () => void
}

export function ProductDetailModal({ slug, onClose }: Props) {
  const t = useTranslations('productDetail')
  const [product, setProduct] = useState<ProductFull | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const locale = useLocale()

  useEffect(() => {
    if (!slug) return

    Promise.resolve().then(() => {
      setLoading(true)
      setError(null)
    })
    fetch(`/api/public/products/${slug}?locale=${locale}`)
      .then(async r => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}))
          throw new Error(body.error || `Failed to load product (${r.status})`)
        }
        return r.json()
      })
      .then(data => {
        setProduct(data.product)
        setSelectedImage(data.product.images?.[0]?.mediaFile?.url || null)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [slug, locale])

  if (!slug) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto" role="dialog" aria-modal="true" aria-label={t('closeAria')}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
        aria-hidden="true"
      />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
        className="relative w-full max-w-5xl my-8 mx-4 rounded-2xl overflow-hidden"
        style={{
          background: 'var(--color-bg-elevated)',
          boxShadow: 'var(--shadow-float)',
        }}
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          autoFocus
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-[var(--color-bg-card)] hover:bg-[var(--color-bg-elevated)] flex items-center justify-center shadow-lg transition-colors"
        >
          <X className="w-5 h-5 text-[var(--color-text-primary)]" aria-hidden="true" />
        </button>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error || !product ? (
          <div className="p-12 text-center text-[var(--color-text-tertiary)]">
            <p>{error || t('productNotFound')}</p>
            <button onClick={onClose} className="mt-4 btn btn-primary">{t('close')}</button>
          </div>
        ) : (
          <div className="p-6 md:p-8">
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm text-[var(--color-text-tertiary)] mb-6">
              <Link href="/" className="hover:text-green-600 transition-colors">{t('home')}</Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <Link href="/products" className="hover:text-green-600 transition-colors">{t('products')}</Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-[var(--color-text-primary)] font-medium">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Left: Images */}
              <div className="space-y-4">
                <div className="aspect-square relative overflow-hidden rounded-xl bg-neutral-50">
                  {selectedImage ? (
                    <Image src={selectedImage} alt={product.name} fill sizes="(max-width: 1024px) 100vw, 50vw" priority className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[var(--color-text-tertiary)]">
                      <Leaf className="w-20 h-20" />
                    </div>
                  )}
                </div>
                {product.images?.length > 1 && (
                  <div className="grid grid-cols-5 gap-3">
                    {product.images.map(img => (
                      img.mediaFile ? (
                        <button
                          key={img.id}
                          onClick={() => setSelectedImage(img.mediaFile.url)}
                          className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                            selectedImage === img.mediaFile.url ? 'border-green-500' : 'border-transparent hover:border-green-300'
                          }`}
                        >
                          <Image src={img.mediaFile.url} alt="" width={80} height={80} className="object-cover w-full h-full" />
                        </button>
                      ) : null
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Details */}
              <div className="flex flex-col max-h-[70vh] lg:max-h-[85vh] overflow-y-auto pr-2" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                <div className="flex flex-wrap gap-2 mb-3">
                  {product.categories?.map(c => (
                    <span key={c.category.id} className="badge badge-green">{c.category.name}</span>
                  ))}
                  {product.organicType && (
                    <span className="badge badge-green">
                      <Leaf className="w-3 h-3" />
                      {product.organicType}
                    </span>
                  )}
                  {product.conventionalType && (
                    <span className="badge badge-amber">
                      <Leaf className="w-3 h-3" />
                      {product.conventionalType}
                    </span>
                  )}
                </div>

                <h2 className="text-3xl font-display font-bold text-[var(--color-text-primary)] mb-1">{product.name}</h2>
                {product.scientificName && (
                  <p className="text-lg text-[var(--color-text-tertiary)] italic mb-4">{product.scientificName}</p>
                )}

                <div className="mb-4">
                  <span className="badge badge-amber text-sm">
                    <Package className="w-4 h-4" />
                    {t('minOrder', { weight: product.minOrderKg.toLocaleString() })}
                  </span>
                </div>

                <p className="text-[var(--color-text-secondary)] mb-6 leading-relaxed">{product.shortDescription}</p>

                {/* Highlights */}
                <div className="bg-green-50 rounded-xl p-5 mb-5">
                  <h3 className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest mb-3">{t('productHighlights')}</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>{t('highlightFreeSamples')}</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                      <Scissors className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>{t('highlightCustomCut')}</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)]">
                      <Award className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>{t('highlightOrganicOptions')}</span>
                    </li>
                  </ul>
                </div>

                {/* Cut Forms + Certs */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest mb-2">{t('cutForms')}</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {['whole', 'cutSifted', 'powder', 'teaCut', 'granulated'].map(key => (
                        <span key={key} className="text-xs px-2 py-1 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] text-[var(--color-text-secondary)]">{t(`cutForm.${key}`)}</span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-[var(--color-text-tertiary)] uppercase tracking-widest mb-2">{t('certifications')}</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {['eu_organic', 'usda', 'iso22000', 'haccp', 'gmp'].map(key => (
                        <span key={key} className="text-xs px-2 py-1 rounded-full bg-green-50 border border-green-200 text-green-800 flex items-center gap-1">
                          <Award className="w-3 h-3" />{t(`cert.${key}`)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <ProductActions productId={product.id} productName={product.name} minOrderKg={product.minOrderKg} />

                {/* Description */}
                {product.description && (
                  <div className="mt-6 pt-6 border-t border-[var(--color-border-subtle)]">
                    <h3 className="text-lg font-display font-bold text-[var(--color-text-primary)] mb-3">{t('productInformation')}</h3>
                    <div className="text-neutral-600 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
