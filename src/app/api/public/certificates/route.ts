import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const certs = await db.certificate.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: { file: { select: { url: true, thumbnailUrl: true, type: true } } },
    })
    return NextResponse.json({ certs })
  } catch (err) {
    console.error('[PUBLIC CERTIFICATES]', err)
    return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 })
  }
}
