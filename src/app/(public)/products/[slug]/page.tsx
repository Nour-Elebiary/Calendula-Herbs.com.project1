import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await db.product.findUnique({ where: { slug, isActive: true } })
  if (!product) return { title: 'Product Not Found' }
  return {
    title: `${product.name} | Calendula Herbs For Import & Export`,
    description: product.shortDescription,
  }
}

export default async function ProductDetailRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await db.product.findUnique({ where: { slug, isActive: true } })
  if (!product) notFound()
  redirect(`/products?product=${product.slug}`)
}
