import { SessionProvider } from 'next-auth/react'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <div className="admin-panel flex h-screen overflow-hidden bg-[var(--color-bg-void)] text-[var(--color-text-primary)]">
        <AdminSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto p-8 relative">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-500/[0.025] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
              <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-gold/[0.015] rounded-full blur-3xl translate-y-1/2 pointer-events-none" />
            </div>
            <div className="max-w-6xl mx-auto relative z-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SessionProvider>
  )
}
