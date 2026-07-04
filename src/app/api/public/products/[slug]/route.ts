import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  try {
    const product = await db.product.findUnique({
      where: { slug, isActive: true },
      include: {
        images: { orderBy: { order: 'asc' }, include: { mediaFile: true } },
        categories: { include: { category: true } },
      },
    })

    if (!product) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (err) {
    console.error('[PUBLIC PRODUCT]', err)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}
