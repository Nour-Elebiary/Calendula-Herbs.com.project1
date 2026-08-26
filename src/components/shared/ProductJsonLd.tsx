import { JsonLd } from './JsonLd'

interface ProductJsonLdProps {
  name: string
  description?: string | null
  image?: string
  url: string
  sku?: string
  /** If true → 'InStock', otherwise 'OutOfStock' */
  inStock?: boolean
  /** ISO 4217 currency code, default USD */
  currency?: string
  /** Minimum price shown — use MOQ-based unit price if available */
  price?: number
  brand?: string
  /** e.g. 'Organic Herb' | 'Spice' */
  category?: string
  countryOfOrigin?: string
}

/**
 * Renders Schema.org `Product` JSON-LD for a product detail page.
 *
 * Used by: `/products/[slug]` and the product modal section of `/products`.
 *
 * Benefits:
 *  - Google/Bing: eligibility for rich results (price, availability badge)
 *  - Yandex: product cards in Yandex Market-adjacent results
 *  - Baidu: structured product information in Baidu shopping results
 *  - AI answer engines: structured factual data for product Q&A
 */
export function ProductJsonLd({
  name,
  description,
  image,
  url,
  sku,
  inStock = true,
  currency = 'USD',
  price,
  brand = 'Calendula Herbs',
  category,
  countryOfOrigin = 'EG',
}: ProductJsonLdProps) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://calendula-herbs.com'

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    url,
    ...(description && { description }),
    ...(image && { image }),
    ...(sku && { sku }),
    ...(category && { category }),
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    manufacturer: {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'Calendula Herbs For Import & Export',
      addressCountry: countryOfOrigin,
    },
    countryOfOrigin: {
      '@type': 'Country',
      name: 'Egypt',
    },
    offers: {
      '@type': 'Offer',
      url,
      availability: `https://schema.org/${inStock ? 'InStock' : 'OutOfStock'}`,
      itemCondition: 'https://schema.org/NewCondition',
      ...(price != null && {
        price,
        priceCurrency: currency,
      }),
      seller: {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'Calendula Herbs For Import & Export',
      },
    },
  }

  return <JsonLd data={data} />
}
