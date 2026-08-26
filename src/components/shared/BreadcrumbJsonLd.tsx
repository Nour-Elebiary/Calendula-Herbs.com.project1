import { JsonLd } from './JsonLd'

export interface BreadcrumbItem {
  name: string
  /** Full URL, e.g. 'https://calendula-herbs.com/products' */
  url: string
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[]
}

/**
 * Renders Schema.org `BreadcrumbList` JSON-LD.
 *
 * Breadcrumbs appear as navigation paths in Google, Bing, and Yandex SERPs.
 * They improve click-through rate and help AI engines understand site hierarchy.
 *
 * Usage example:
 * ```tsx
 * <BreadcrumbJsonLd
 *   items={[
 *     { name: 'Home', url: 'https://calendula-herbs.com' },
 *     { name: 'Products', url: 'https://calendula-herbs.com/products' },
 *     { name: 'Chamomile', url: 'https://calendula-herbs.com/products/chamomile' },
 *   ]}
 * />
 * ```
 */
export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return <JsonLd data={data} />
}
