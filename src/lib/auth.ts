import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'
import { db } from '@/lib/db'
import { verifyPassword } from '@/lib/security'

type ExtendedToken = {
  id?: string
  email?: string | null
  name?: string | null
  sessionId?: string
  error?: string
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        // Fetch admin from DB
        const admin = await db.admin.findUnique({
          where: { email },
        })

        if (!admin) return null

        // Check lockout
        if (admin.lockedUntil && admin.lockedUntil > new Date()) {
          throw new Error('LOCKED')
        }

        // Verify password
        const valid = await verifyPassword(password, admin.passwordHash)

        if (!valid) {
          // Increment failed attempts
          const newAttempts = admin.failedAttempts + 1
          const lockedUntil =
            newAttempts >= 5
              ? new Date(Date.now() + 15 * 60 * 1000) // 15-minute lockout
              : null

          await db.admin.update({
            where: { id: admin.id },
            data: {
              failedAttempts: newAttempts,
              ...(lockedUntil ? { lockedUntil } : {}),
            },
          })

          return null
        }

        // Get IP and User Agent
        let ip = 'unknown'
        let userAgent = 'unknown'
        
        if (req instanceof Request) {
           ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                req.headers.get('x-real-ip') || 
                'unknown'
           userAgent = req.headers.get('user-agent') || 'unknown'
        }

        // Geolocation
        let country = 'Unknown'
        if (ip !== 'unknown' && ip !== '127.0.0.1' && ip !== '::1') {
          try {
            const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=country`)
            const geoData = await geoRes.json()
            if (geoData && geoData.country) {
              country = geoData.country
            }
          } catch {
             // ignore
          }
        }

        // Successful login — reset failed attempts and update last login info
        await db.admin.update({
          where: { id: admin.id },
          data: {
            failedAttempts: 0,
            lockedUntil: null,
            lastLoginIp: ip,
            lastLoginUserAgent: userAgent,
            lastLoginCountry: country,
            lastLoginAt: new Date(),
          },
        })

        // Create AdminSession
        const sessionId = crypto.randomUUID()
        await db.adminSession.create({
          data: {
            adminId: admin.id,
            tokenHash: sessionId, // we'll use this random ID as the token hash
            ip,
            userAgent,
            expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
          }
        })

        return {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          sessionId, // pass sessionId to the JWT callback
        }
      },
    }),
  ],

  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.sessionId = (user as { sessionId?: string }).sessionId
      }

      // Verify that the session hasn't been revoked
      if (token.sessionId) {
        const session = await db.adminSession.findUnique({
           where: { tokenHash: token.sessionId as string }
        })
        if (!session || session.revokedAt) {
          // Token is revoked
          return { ...token, error: 'Revoked' }
        }
      }

      return token
    },

    async session({ session, token }) {
      const extToken = token as ExtendedToken
      if (extToken.error === 'Revoked') {
        return { ...session, user: {} } as typeof session
      }

      if (extToken && session.user) {
        session.user.id = extToken.id as string
        session.user.email = extToken.email as string
        session.user.name = extToken.name as string
      }
      return session
    },
  },

  trustHost: true,
})
