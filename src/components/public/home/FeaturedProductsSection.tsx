'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Leaf } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { fadeInUp, staggerContainer, cardVariant } from '@/lib/animations'
import { SectionLabel } from '../shared/SectionLabel'
import { Card3D } from '@/components/public/Card3D'

type ProductImage = {
  mediaFile: { url: string }
}

type Product = {
  id: string
  slug: string
  name: string
  scientificName: string | null
  commonName: string | null
  shortDescription: string | null
  isOrganic: boolean
  organicType: string | null
  conventionalType: string | null
  minOrderKg: number
  availableCuts: string[]
  images: ProductImage[]
}

export function FeaturedProductsSection({ products }: { products: Product[] }) {
  const t = useTranslations('home')
  const tp = useTranslations('products')
  if (products.length === 0) return null

  return (
    <section className="py-24" style={{ backgroundColor: 'var(--color-bg-void)' }}>
      <div className="container mx-auto max-w-7xl">
        <motion.div
          className="text-center space-y-4 mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp}>
            <SectionLabel>{t('ourCollection')}</SectionLabel>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-4xl md:text-5xl font-display font-[400] leading-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {t('featuredProducts')}
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-lg font-light max-w-2xl mx-auto"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            {t('featuredDesc')}
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {products.map((product) => {
            const mainImage = product.images[0]?.mediaFile.url
            const displayName = product.commonName || product.name
            const cuts = product.availableCuts?.length
              ? product.availableCuts.map(c => tp('cutForms.' + c) || c).slice(0, 2).join(', ')
              : tp('cutForms.WHOLE') + ', ' + tp('cutForms.CUT_SIFTED')
            return (
              <motion.div key={product.id} variants={cardVariant}>
                <Card3D>
                <Link href={`/products?product=${product.slug}`} className="card-glass card-product group block no-underline">
                  <div className="card-product__stage">
                    {mainImage ? (
                      <Image
                        src={mainImage}
                        alt={product.name}
                        width={320}
                        height={320}
                        className="card-product__image"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={true}
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <Leaf className="w-12 h-12" style={{ color: 'var(--color-text-tertiary)' }} />
                      </div>
                    )}
                    {product.organicType && (
                      <div className="badge badge-green absolute top-3 left-3 z-10">
                        {product.organicType}
                      </div>
                    )}
                    {product.conventionalType && !product.organicType && (
                      <div className="badge badge-amber absolute top-3 left-3 z-10">
                        {product.conventionalType}
                      </div>
                    )}
                  </div>
                  <div className="card-product__body px-4 pb-4">
                    <h3 className="card-product__name group-hover" style={{ color: 'var(--color-calendula-500)' }}>
                      {displayName}
                    </h3>
                    {product.scientificName && (
                      <p className="italic text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                        {product.scientificName}
                      </p>
                    )}
                    {product.availableCuts && product.availableCuts.length > 0 && (
                      <p className="card-product__cuts">
                        {cuts}
                      </p>
                    )}
                    <div className="card-product__footer">
                      <span className="badge badge-calendula">{t('moq', { weight: product.minOrderKg.toLocaleString() })}</span>
                      <button
                        className="btn-icon"
                        aria-label={t('requestQuoteAria', { name: product.name })}
                        onClick={(e) => { e.preventDefault(); window.location.href = `/contact?product=${product.slug}` }}
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Link>
                </Card3D>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
