'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Image as ImageIcon, 
  Settings, 
  Users, 
  ShoppingBag,
  Award,
  LogOut,
  Leaf,
  FolderOpen,
  Inbox
} from 'lucide-react'
import { signOut } from 'next-auth/react'

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/dashboard/products', icon: ShoppingBag },
  { name: 'Media Library', href: '/admin/dashboard/media', icon: ImageIcon },
  { name: 'Galleries', href: '/admin/dashboard/galleries', icon: FolderOpen },
  { name: 'Certificates', href: '/admin/dashboard/certificates', icon: Award },
  { name: 'Team & Board', href: '/admin/dashboard/team', icon: Users },
  { name: 'Inquiries', href: '/admin/dashboard/inquiries', icon: Inbox },
  { name: 'Site Settings', href: '/admin/dashboard/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-64 bg-[var(--color-bg-elevated)] border-r border-[var(--color-border-subtle)] h-screen sticky top-0 shrink-0">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3 border-b border-[var(--color-border-subtle)]">
        <div className="w-9 h-9 rounded-lg bg-[var(--color-calendula-500)]/15 border border-[var(--color-calendula-500)]/30 flex items-center justify-center">
          <Leaf className="w-5 h-5 text-[var(--color-calendula-500)]" />
        </div>
        <span className="text-lg font-bold text-[var(--color-text-primary)] tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
          Calendula
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all relative ${
                isActive
                  ? 'bg-[var(--color-calendula-500)]/10 text-[var(--color-calendula-600)] font-medium'
                  : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-black/[0.03]'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[var(--color-calendula-500)] rounded-full" />
              )}
              <item.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[var(--color-calendula-500)]' : 'text-[var(--color-text-tertiary)]'}`} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Sign Out */}
      <div className="p-3 border-t border-[var(--color-border-subtle)]">
        <button
          onClick={async () => { await signOut({ redirect: false }); window.location.href = '/admin/login' }}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[var(--color-text-tertiary)] hover:text-red-600 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  )
}
