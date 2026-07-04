import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { Shield, User, MonitorSmartphone, Globe, Clock, AlertTriangle, Pencil } from 'lucide-react'
import { revokeSession, revokeAllOtherSessions } from './actions'
import { ProfileSecurity } from './ProfileSecurity'
import { ChangeEmailButton } from './ChangeEmailButton'

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/admin/login')

  const admin = await db.admin.findUnique({
    where: { id: session.user.id },
  })

  if (!admin) redirect('/admin/login')

  const currentTokenHash = (session.user as { sessionId?: string }).sessionId

  const activeSessions = await db.adminSession.findMany({
    where: { adminId: admin.id, revokedAt: null },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          Profile & Security
        </h1>
        <p className="text-[var(--color-text-tertiary)]">Manage your administrator account settings and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Info */}
        <div className="bg-white border border-[var(--color-border-subtle)] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[var(--color-green-500)]/15 flex items-center justify-center">
              <User className="w-5 h-5 text-[var(--color-green-600)]" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Personal Info</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-tertiary)] mb-1">Full Name</label>
              <div className="text-sm text-[var(--color-text-primary)]">{admin.name}</div>
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-tertiary)] mb-1">Email Address</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--color-text-primary)]">{admin.email}</span>
                <ChangeEmailButton currentEmail={admin.email} />
              </div>
            </div>
          </div>
        </div>

        {/* ProfileSecurity — password change + recovery emails */}
        <ProfileSecurity initialRecoveryEmails={admin.recoveryEmails} />
      </div>

      {/* Active Sessions */}
      <div className="bg-white border border-[var(--color-border-subtle)] rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--color-green-500)]/15 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[var(--color-green-600)]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Active Sessions</h2>
              <p className="text-xs text-[var(--color-text-tertiary)]">Devices currently logged into your account.</p>
            </div>
          </div>
          
          {activeSessions.length > 1 && (
            <form action={async () => {
              'use server'
              await revokeAllOtherSessions(currentTokenHash)
            }}>
              <button 
                type="submit"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-sm font-medium text-red-600 transition-colors"
              >
                <AlertTriangle className="w-4 h-4" />
                That wasn&apos;t me! (Revoke Others)
              </button>
            </form>
          )}
        </div>

        <div className="space-y-3">
          {activeSessions.map(sess => {
            const isCurrent = sess.tokenHash === currentTokenHash
            return (
              <div key={sess.id} className={`flex items-center justify-between p-4 rounded-lg border ${isCurrent ? 'bg-[var(--color-green-500)]/5 border-[var(--color-green-500)]/20' : 'bg-black/[0.02] border-[var(--color-border-subtle)]'}`}>
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <MonitorSmartphone className={`w-5 h-5 ${isCurrent ? 'text-[var(--color-green-600)]' : 'text-[var(--color-text-tertiary)]'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--color-text-primary)]">{sess.ip}</span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[var(--color-green-500)]/20 text-[var(--color-green-700)]">CURRENT</span>
                      )}
                    </div>
                    <div className="text-xs text-[var(--color-text-tertiary)] mt-1 flex flex-wrap gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> Unknown Location</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Logged in: {new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'short' }).format(sess.createdAt)}</span>
                    </div>
                    <div className="text-[10px] text-[var(--color-text-tertiary)]/60 mt-1 font-mono truncate max-w-sm" title={sess.userAgent || undefined}>
                      {sess.userAgent}
                    </div>
                  </div>
                </div>

                {!isCurrent && (
                  <form action={async () => {
                    'use server'
                    await revokeSession(sess.id)
                  }}>
                    <button type="submit" className="text-xs text-red-600 hover:text-red-500 font-medium px-3 py-1.5 rounded bg-red-500/10 hover:bg-red-500/20 transition-colors">
                      Revoke
                    </button>
                  </form>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
