import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { requireAdmin, unauthorized } from '@/lib/admin-auth'

// GET all site settings as a key-value map
export async function GET() {
  try { await requireAdmin() } catch { return unauthorized() }
  try {
    const settings = await db.siteSetting.findMany()
    const map: Record<string, string> = {}
    settings.forEach(s => { map[s.key] = s.value })
    return NextResponse.json({ settings: map })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// PATCH — upsert one or many keys
const patchSchema = z.record(z.string(), z.string())

export async function PATCH(req: NextRequest) {
  try { await requireAdmin() } catch { return unauthorized() }
  try {
    const json = await req.json()
    const data = patchSchema.parse(json)

    await Promise.all(
      Object.entries(data).map(([key, value]) =>
        db.siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
