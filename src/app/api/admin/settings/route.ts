import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import { withAdminAuth, withValidation, apiError } from '@/lib/route-helpers'

// GET all site settings as a key-value map
export const GET = withAdminAuth(async () => {
  try {
    const settings = await db.siteSetting.findMany()
    const map: Record<string, string> = {}
    settings.forEach(s => { map[s.key] = s.value })
    return NextResponse.json({ settings: map })
  } catch (err) {
    return apiError('Failed to fetch settings', 500, err)
  }
})

// PATCH — upsert one or many keys
const patchSchema = z.record(z.string(), z.string())

export const PATCH = withAdminAuth(
  withValidation(patchSchema, async (_, __, _adminId, data) => {
    try {
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
      return apiError('Failed to save settings', 500, err)
    }
  })
)
