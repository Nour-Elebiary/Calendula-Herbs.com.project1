import { requireAdmin, unauthorized } from '@/lib/admin-auth'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try { await requireAdmin() } catch { return unauthorized() }

  const [contact, cart, samples, productRequests] = await Promise.all([
    db.contactSubmission.count({ where: { isRead: false } }),
    db.cartInquiry.count({ where: { isRead: false } }),
    db.sampleRequest.count({ where: { isRead: false } }),
    db.productRequest.count({ where: { isRead: false } }),
  ])

  return NextResponse.json({ contact, cart, samples, productRequests, total: contact + cart + samples + productRequests })
}
