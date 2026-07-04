import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export async function requireAdmin(): Promise<string> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new AuthError('Unauthorized')
  }
  return session.user.id as string
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
