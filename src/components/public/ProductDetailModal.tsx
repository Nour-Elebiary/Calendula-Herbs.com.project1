'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
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
  categories: { category: { id: string; name: string; slug: string } }[]
}

type Props = {
  slug: string | null
  onClose: () => void
}

const CUT_FORMS = ['Whole', 'Cut & Sifted', 'Powder', 'Tea Cut', 'Granulated']
const CERTIFICATIONS = ['EU Organic', 'USDA Organic', 'ISO 22000', 'HACCP', 'GMP']

export function ProductDetailModal({ slug, onClose }: Props) {
  const [product, setProduct] = useState<ProductFull | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return

    Promise.resolve().then(() => {
      setLoading(true)
      setError(null)
    })
    fetch(`/api/public/products/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.product) {
          setProduct(data.product)
          setSelectedImage(data.product.images?.[0]?.mediaFile?.url || null)
        } else {
          setError('Product not found')
        }
      })
      .catch(() => setError('Failed to load product'))
      .finally(() => setLoading(false))
  }, [slug])

  if (!slug) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto" role="dialog" aria-modal="true" aria-label="Product details">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-5xl my-8 mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          autoFocus
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-colors"
        >
          <X className="w-5 h-5 text-neutral-700" aria-hidden="true" />
        </button>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error || !product ? (
          <div className="p-12 text-center text-neutral-500">
            <p>{error || 'Product not found'}</p>
            <button onClick={onClose} className="mt-4 btn btn-primary">Close</button>
          </div>
        ) : (
          <div className="p-6 md:p-8">
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm text-neutral-400 mb-6">
              <Link href="/" className="hover:text-green-600 transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <Link href="/products" className="hover:text-green-600 transition-colors">Products</Link>
              <ChevronRight className="w-4 h-4 mx-2" />
              <span className="text-neutral-800 font-medium">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Left: Images */}
              <div className="space-y-4">
                <div className="aspect-square relative overflow-hidden rounded-xl bg-neutral-50">
                  {selectedImage ? (
                    <Image src={selectedImage} alt={product.name} fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
                      <Leaf className="w-20 h-20" />
                    </div>
                  )}
                </div>
                {product.images.length > 1 && (
                  <div className="grid grid-cols-5 gap-3">
                    {product.images.map(img => (
                      <button
                        key={img.id}
                        onClick={() => setSelectedImage(img.mediaFile.url)}
                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                          selectedImage === img.mediaFile.url ? 'border-green-500' : 'border-transparent hover:border-green-300'
                        }`}
                      >
                        <Image src={img.mediaFile.url} alt="" width={80} height={80} className="object-cover w-full h-full" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right: Details */}
              <div className="flex flex-col max-h-[70vh] overflow-y-auto pr-2">
                <div className="flex flex-wrap gap-2 mb-3">
                  {product.categories.map(c => (
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

                <h2 className="text-3xl font-display font-bold text-neutral-900 mb-1">{product.name}</h2>
                {product.scientificName && (
                  <p className="text-lg text-neutral-400 italic mb-4">{product.scientificName}</p>
                )}

                <div className="mb-4">
                  <span className="badge badge-amber text-sm">
                    <Package className="w-4 h-4" />
                    Min. Order: 500 KG
                  </span>
                </div>

                <p className="text-neutral-600 mb-6 leading-relaxed">{product.shortDescription}</p>

                {/* Highlights */}
                <div className="bg-green-50 rounded-xl p-5 mb-5">
                  <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-3">Product Highlights</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-neutral-600">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>Free samples available for quality evaluation</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-neutral-600">
                      <Scissors className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>Custom cut & labeling available upon request</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-neutral-600">
                      <Award className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>EU Organic / USDA Organic certified options</span>
                    </li>
                  </ul>
                </div>

                {/* Cut Forms + Certs */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Cut Forms</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {CUT_FORMS.map(f => (
                        <span key={f} className="text-xs px-2 py-1 rounded-full bg-white border border-neutral-200 text-neutral-600">{f}</span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-neutral-50 rounded-xl p-4">
                    <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Certifications</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {CERTIFICATIONS.map(c => (
                        <span key={c} className="text-xs px-2 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 flex items-center gap-1">
                          <Award className="w-3 h-3" />{c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <ProductActions productId={product.id} productName={product.name} minOrderKg={product.minOrderKg} />

                {/* Description */}
                {product.description && (
                  <div className="mt-6 pt-6 border-t border-neutral-200">
                    <h3 className="text-lg font-display font-bold text-neutral-900 mb-3">Product Information</h3>
                    <div className="text-neutral-600 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
