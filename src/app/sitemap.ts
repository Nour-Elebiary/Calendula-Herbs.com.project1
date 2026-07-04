import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://calendulaherbs.com'

  // Fetch dynamic content
  const [products, categories, galleries] = await Promise.all([
    db.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true }
    }),
    db.category.findMany({
      select: { slug: true }
    }),
    db.gallery.findMany({
      select: { slug: true, updatedAt: true },
      where: { isActive: true }
    }),
  ])

  // Static routes
  const staticRoutes = [
    '',
    '/about',
    '/contact',
    '/products',
    '/faq',
    '/galleries',
    '/certificates',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Product routes
  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }))

  // Category routes (no updatedAt on Category model — use current date)
  const categoryRoutes = categories.map((category) => ({
    url: `${baseUrl}/products?category=${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Gallery routes
  const galleryRoutes = galleries.map((gallery) => ({
    url: `${baseUrl}/galleries/${gallery.slug}`,
    lastModified: gallery.updatedAt,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...galleryRoutes]
}
