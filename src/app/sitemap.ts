import { MetadataRoute } from 'next'
import { db } from '@/lib/db'

// Supported locales — mirrors src/i18n/routing.ts
const LOCALES = ['en', 'ar'] as const

type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Canonical domain — sanitize so Railway internal domains never leak into sitemaps
  const rawUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  const baseUrl =
    rawUrl && !rawUrl.includes('.railway.app') && !rawUrl.includes('localhost')
      ? rawUrl
      : 'https://www.calendula-herbs.com'

  // Fetch dynamic content
  const [products, productImages, categories, galleries] = await Promise.all([
    db.product.findMany({
      where: { isActive: true },
      select: { id: true, slug: true, name: true, updatedAt: true },
    }),
    // Separate image query to avoid Prisma select-depth TS issues
    db.productImage.findMany({
      where: { product: { isActive: true }, order: 0 },
      select: {
        productId: true,
        mediaFile: { select: { url: true } },
      },
    }),
    db.category.findMany({ select: { slug: true } }),
    db.gallery.findMany({
      select: { slug: true, updatedAt: true },
      where: { isActive: true },
    }),
  ])

  // Build a quick lookup: productId → image URL
  const imageMap = new Map<string, string>()
  for (const pi of productImages) {
    if (pi.mediaFile?.url) imageMap.set(pi.productId, pi.mediaFile.url)
  }

  // ── Helper: build hreflang alternates for a given path ──────────────────
  function alternates(path: string) {
    return {
      languages: Object.fromEntries(
        LOCALES.map((locale) => [locale, `${baseUrl}/${locale}${path}`])
      ) as Record<string, string>,
    }
  }

  // ── Helper: explicit changeFrequency cast ────────────────────────────────
  function freq(f: ChangeFreq): ChangeFreq { return f }

  // ── Static routes ────────────────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`,             priority: 1.0, changeFrequency: freq('weekly')  },
    { url: `${baseUrl}/about`,        priority: 0.8, changeFrequency: freq('monthly') },
    { url: `${baseUrl}/contact`,      priority: 0.8, changeFrequency: freq('monthly') },
    { url: `${baseUrl}/products`,     priority: 0.9, changeFrequency: freq('weekly')  },
    { url: `${baseUrl}/faq`,          priority: 0.7, changeFrequency: freq('monthly') },
    { url: `${baseUrl}/galleries`,    priority: 0.7, changeFrequency: freq('monthly') },
    { url: `${baseUrl}/certificates`, priority: 0.7, changeFrequency: freq('monthly') },
  ].map((entry) => ({
    ...entry,
    lastModified: new Date(),
    alternates: alternates(entry.url.replace(baseUrl, '')),
  }))

  // ── Product routes (highest priority — these are the money pages) ────────
  const productRoutes: MetadataRoute.Sitemap = products.map((product) => {
    const imageUrl = imageMap.get(product.id)

    return {
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: freq('weekly'),
      priority: 0.9,
      alternates: alternates(`/products/${product.slug}`),
      // images[] — supported by Next.js ≥ 14.2 for image sitemaps
      // Helps Google Images, Yandex Images, and Baidu Images index product photos
      ...(imageUrl && { images: [imageUrl] }),
    }
  })

  // ── Category routes ──────────────────────────────────────────────────────
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/products?category=${category.slug}`,
    lastModified: new Date(),
    changeFrequency: freq('weekly'),
    priority: 0.7,
    alternates: alternates(`/products?category=${category.slug}`),
  }))

  // ── Gallery routes ───────────────────────────────────────────────────────
  const galleryRoutes: MetadataRoute.Sitemap = galleries.map((gallery) => ({
    url: `${baseUrl}/galleries/${gallery.slug}`,
    lastModified: gallery.updatedAt,
    changeFrequency: freq('monthly'),
    priority: 0.6,
    alternates: alternates(`/galleries/${gallery.slug}`),
  }))

  return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...galleryRoutes]
}

