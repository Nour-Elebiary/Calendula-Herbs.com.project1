'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Leaf } from 'lucide-react'
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
  shortDescription: string | null
  isOrganic: boolean
  organicType: string | null
  conventionalType: string | null
  images: ProductImage[]
}

const categoryLookup: Record<string, string> = {
  herbs: 'Dried Herbs',
  spices: 'Spices',
  seeds: 'Seeds',
  flowers: 'Dried Flowers',
}

const cutsLookup: Record<string, string> = {
  whole: 'Whole',
  crushed: 'Crushed',
  powder: 'Powdered',
  cut_sifted: 'Cut & Sifted',
}

export function FeaturedProductsSection({ products }: { products: Product[] }) {
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
            <SectionLabel>Our Collection</SectionLabel>
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="text-4xl md:text-5xl font-display font-[400] leading-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Featured Products
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="text-lg font-light max-w-2xl mx-auto"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Discover our most sought-after botanicals, meticulously grown and processed to meet international standards.
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
            const category = categoryLookup[product.slug.split('-')[0]] || 'Botanicals'
            const cuts = product.shortDescription
              ? Object.values(cutsLookup).slice(0, 2).join(', ')
              : 'Whole, Cut & Sifted'
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
                    <span className="card-product__label">{category}</span>
                    <h3 className="card-product__name group-hover" style={{ color: 'var(--color-calendula-500)' }}>
                      {product.name}
                    </h3>
                    {product.scientificName && (
                      <p className="italic text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
                        {product.scientificName}
                      </p>
                    )}
                    <p className="card-product__cuts">
                      Available: {cuts}
                    </p>
                    <div className="card-product__footer">
                      <span className="badge badge-calendula">MOQ: 500 kg</span>
                      <button
                        className="btn-icon"
                        aria-label={`Request quote for ${product.name}`}
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
