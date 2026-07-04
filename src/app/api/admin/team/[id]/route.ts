import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'

const updateSchema = z.object({
  name: z.string().optional(),
  title: z.string().optional(),
  bio: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  photoId: z.string().nullable().optional(),
  memberType: z.enum(['TEAM', 'BOARD']).optional(),
  contacts: z.array(z.object({
    id: z.string().optional(),
    type: z.enum(['EMAIL', 'PHONE', 'LINKEDIN', 'TWITTER', 'WHATSAPP', 'FACEBOOK', 'INSTAGRAM', 'TELEGRAM', 'VIBER', 'WECHAT', 'SIGNAL', 'MESSENGER', 'LINE', 'DISCORD', 'YOUTUBE', 'TIKTOK', 'SNAPCHAT', 'WEBSITE', 'OTHER']),
    label: z.string().nullable().optional(),
    value: z.string(),
    icon: z.string().nullable().optional()
  })).optional()
})

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin() } catch { return unauthorized() }
  try {
    const { id } = await params
    const member = await db.teamMember.findUnique({
      where: { id },
      include: {
        photo: { select: { url: true } },
        contacts: true
      }
    })
    
    if (!member) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ member })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin() } catch { return unauthorized() }
  try {
    const { id } = await params
    const json = await req.json()
    const data = updateSchema.parse(json)
    
    // We handle contacts separately from main update
    const { contacts, ...mainData } = data
    
    const member = await db.teamMember.update({
      where: { id },
      data: mainData
    })
    
    if (contacts !== undefined) {
      // Very simple sync approach: delete all existing contacts and recreate them.
      await db.teamContact.deleteMany({ where: { memberId: id } })
      
      if (contacts.length > 0) {
        await db.teamContact.createMany({
          data: contacts.map(c => ({
            memberId: id,
            type: c.type,
            label: c.label || null,
            value: c.value,
            icon: c.icon || null
          }))
        })
      }
    }
    
    return NextResponse.json({ member })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { await requireAdmin() } catch { return unauthorized() }
  try {
    const { id } = await params
    await db.teamMember.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
