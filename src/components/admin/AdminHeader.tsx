'use client'

import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Bell, User, ChevronRight, MessageSquare, ShoppingCart, Leaf, FileSearch } from 'lucide-react'
import { useState, useEffect } from 'react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

const breadcrumbLabels: Record<string, string> = {
  'dashboard': 'Dashboard',
  'products': 'Products',
  'media': 'Media Library',
  'galleries': 'Galleries',
  'certificates': 'Certificates',
  'team': 'Team & Board',
  'inquiries': 'Inquiries',
  'settings': 'Site Settings',
  'profile': 'Profile',
}

type UnreadCounts = {
  contact: number
  cart: number
  samples: number
  productRequests: number
  total: number
}

export function AdminHeader() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts | null>(null)

  useEffect(() => {
    fetch('/api/admin/inquiries/unread-count')
      .then(r => r.json())
      .then(setUnreadCounts)
      .catch(() => {})
  }, [])

  const totalUnread = unreadCounts?.total ?? 0

  const segments = pathname
    .replace('/admin/dashboard', '')
    .split('/')
    .filter(Boolean)

  return (
    <header className="h-16 bg-[var(--color-bg-base)]/90 backdrop-blur-md border-b border-[var(--color-border-subtle)] sticky top-0 z-20 px-8 flex items-center justify-between">
      {/* Breadcrumbs */}
      <div className="flex-1 max-w-md">
        <nav className="flex items-center gap-1.5 text-xs">
          <Link href="/admin/dashboard" className="text-[var(--color-text-tertiary)] hover:text-[var(--color-calendula-500)] transition-colors">
            Admin
          </Link>
          {segments.map((seg, i) => {
            const label = breadcrumbLabels[seg] || seg.charAt(0).toUpperCase() + seg.slice(1)
            const href = segments.length > 1
              ? `/admin/dashboard/${segments.slice(0, i + 1).join('/')}`
              : undefined
            const isLast = i === segments.length - 1
            return (
              <span key={seg} className="flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-[var(--color-text-tertiary)]" />
                {href && !isLast ? (
                  <Link href={href} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-calendula-500)] transition-colors">
                    {label}
                  </Link>
                ) : (
                  <span className={`${isLast ? 'text-[var(--color-text-primary)] font-medium' : 'text-[var(--color-text-tertiary)]'}`}>
                    {label}
                  </span>
                )}
              </span>
            )
          })}
        </nav>
      </div>

      <div className="flex items-center gap-6 ml-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative text-[var(--color-text-tertiary)] hover:text-[var(--color-calendula-500)] transition-colors">
              <Bell className="w-5 h-5" />
              {totalUnread > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-[var(--color-calendula-500)] text-white text-[10px] font-bold flex items-center justify-center px-1">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 border-[var(--color-border-default)] bg-[var(--color-bg-base)]">
            <DropdownMenuLabel className="text-[var(--color-text-primary)]">Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[var(--color-border-subtle)]" />
            {totalUnread === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-[var(--color-text-tertiary)]">
                No unread inquiries
              </div>
            ) : (
              <>
                <DropdownMenuItem asChild className="focus:bg-[var(--color-bg-void)]">
                  <Link href="/admin/dashboard/inquiries" className="flex items-center gap-3 cursor-pointer text-[var(--color-text-primary)]">
                    <MessageSquare className="w-4 h-4 text-[var(--color-calendula-500)] shrink-0" />
                    <span className="flex-1">Contact Messages</span>
                    <Badge className="bg-[var(--color-calendula-500)]/15 text-[var(--color-calendula-500)] hover:bg-[var(--color-calendula-500)]/20 border-0">
                      {unreadCounts?.contact ?? 0}
                    </Badge>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-[var(--color-bg-void)]">
                  <Link href="/admin/dashboard/inquiries" className="flex items-center gap-3 cursor-pointer text-[var(--color-text-primary)]">
                    <ShoppingCart className="w-4 h-4 text-[var(--color-calendula-500)] shrink-0" />
                    <span className="flex-1">Cart Inquiries</span>
                    <Badge className="bg-[var(--color-calendula-500)]/15 text-[var(--color-calendula-500)] hover:bg-[var(--color-calendula-500)]/20 border-0">
                      {unreadCounts?.cart ?? 0}
                    </Badge>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-[var(--color-bg-void)]">
                  <Link href="/admin/dashboard/inquiries" className="flex items-center gap-3 cursor-pointer text-[var(--color-text-primary)]">
                    <Leaf className="w-4 h-4 text-[var(--color-calendula-500)] shrink-0" />
                    <span className="flex-1">Sample Requests</span>
                    <Badge className="bg-[var(--color-calendula-500)]/15 text-[var(--color-calendula-500)] hover:bg-[var(--color-calendula-500)]/20 border-0">
                      {unreadCounts?.samples ?? 0}
                    </Badge>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-[var(--color-bg-void)]">
                  <Link href="/admin/dashboard/inquiries" className="flex items-center gap-3 cursor-pointer text-[var(--color-text-primary)]">
                    <FileSearch className="w-4 h-4 text-[var(--color-calendula-500)] shrink-0" />
                    <span className="flex-1">Product Requests</span>
                    <Badge className="bg-[var(--color-calendula-500)]/15 text-[var(--color-calendula-500)] hover:bg-[var(--color-calendula-500)]/20 border-0">
                      {unreadCounts?.productRequests ?? 0}
                    </Badge>
                  </Link>
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator className="bg-[var(--color-border-subtle)]" />
            <DropdownMenuItem asChild className="focus:bg-[var(--color-bg-void)]">
              <Link href="/admin/dashboard/inquiries" className="flex items-center justify-center gap-2 cursor-pointer text-sm font-medium text-[var(--color-calendula-500)]">
                View all inquiries
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Link
          href="/admin/dashboard/profile"
          className="flex items-center gap-3 pl-6 border-l border-[var(--color-border-subtle)] hover:opacity-80 transition-opacity"
        >
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-[var(--color-text-primary)] leading-none mb-1">
              {session?.user?.name || 'Admin'}
            </p>
            <p className="text-xs text-[var(--color-text-tertiary)] leading-none">
              {session?.user?.email}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-calendula-500)]/60 to-[var(--color-calendula-500)]/20 flex items-center justify-center text-white border border-[var(--color-calendula-500)]/30">
            <User className="w-4 h-4" />
          </div>
        </Link>
      </div>
    </header>
  )
}
