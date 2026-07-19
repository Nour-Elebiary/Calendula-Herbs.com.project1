import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const locale = req.nextUrl.searchParams.get('locale') || 'en'
  try {
    const product = await db.product.findUnique({
      where: { slug, isActive: true },
      include: {
        images: { orderBy: { order: 'asc' }, include: { mediaFile: true } },
        categories: { include: { category: { include: { translations: { where: { locale } } } } } },
        translations: { where: { locale } },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const tr = product.translations?.[0]
    const enriched = {
      ...product,
      name: tr?.name ?? product.name,
      scientificName: tr?.scientificName ?? product.scientificName,
      commonName: tr?.commonName ?? product.commonName,
      shortDescription: tr?.shortDescription ?? product.shortDescription,
      description: tr?.description ?? product.description,
      categories: product.categories
        .filter(pc => pc.category)
        .map(pc => ({
          ...pc,
          category: {
            ...pc.category!,
            name: pc.category!.translations?.[0]?.name ?? pc.category!.name,
          },
        })),
    }

    return NextResponse.json({ product: enriched })
  } catch (err) {
    console.error('[PUBLIC PRODUCT]', err)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}
