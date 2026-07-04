'use client'

import React, { useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Leaf, Package } from 'lucide-react'
import { ProductDetailModal } from '@/components/public/ProductDetailModal'
import { Card3D } from '@/components/public/Card3D'

type ProductCard = {
  id: string
  slug: string
  name: string
  scientificName: string | null
  shortDescription: string | null
  isOrganic: boolean
  organicType: string | null
  conventionalType: string | null
  minOrderKg: number
  mainImage: string | null
  categories: { id: string; name: string; slug: string }[]
}

type Props = {
  products: ProductCard[]
}

export function ProductGridClient({ products }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeSlug = searchParams.get('product')

  const openProduct = useCallback((slug: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('product', slug)
    router.replace(`/products?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  const closeProduct = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('product')
    const qs = params.toString()
    router.replace(qs ? `/products?${qs}` : '/products', { scroll: false })
  }, [router, searchParams])

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          return (
            <Card3D key={product.id}>
              <button
                onClick={() => openProduct(product.slug)}
                className="card-glass card-product group text-left w-full"
              >
              <div className="card-product__stage">
                {product.mainImage ? (
                  <Image 
                    src={product.mainImage} 
                    alt={product.name} 
                    fill 
                    className="card-product__image" 
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[var(--color-text-tertiary)]">
                    <Leaf className="w-10 h-10 opacity-30" />
                  </div>
                )}
                {product.organicType && (
                  <span className="badge badge-green absolute top-3 left-3 z-10">
                    {product.organicType}
                  </span>
                )}
                {product.conventionalType && !product.organicType && (
                  <span className="badge badge-amber absolute top-3 left-3 z-10">
                    {product.conventionalType}
                  </span>
                )}
              </div>
              <div className="card-product__body">
                <div className="flex flex-wrap gap-1">
                  {product.categories.slice(0, 2).map(c => (
                    <span key={c.id} className="card-product__label">
                      {c.name}
                    </span>
                  ))}
                </div>
                <h3 className="card-product__name group-hover:text-[var(--color-green-600)] transition-colors">
                  {product.name}
                </h3>
                {product.scientificName && (
                  <p className="card-product__cuts italic">{product.scientificName}</p>
                )}
                <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">
                  {product.shortDescription || 'Contact us for bulk export quotes and full specifications.'}
                </p>
                <div className="card-product__footer">
                  <span className="badge badge-amber text-[10px]">
                    <Package className="w-3 h-3" />
                    Min. 500–1,000 KG
                  </span>
                </div>
              </div>
            </button>
            </Card3D>
          )
        })}
      </div>

      <ProductDetailModal slug={activeSlug} onClose={closeProduct} />
    </>
  )
}
