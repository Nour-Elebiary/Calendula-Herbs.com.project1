import React from 'react'
import { LazyMotion, domAnimation } from 'framer-motion'
import { db } from '@/lib/db'
import { Header } from '@/components/public/Header'
import { Footer } from '@/components/public/Footer'
import { CartProvider } from '@/components/public/CartProvider'
import { CartDrawer } from '@/components/public/CartDrawer'
import { CookieConsent } from '@/components/public/CookieConsent'
import DOMPurify from 'isomorphic-dompurify'
import type { ContactMethod } from '@/lib/contact-links'
import type { ContactSetting } from '@prisma/client'

export const dynamic = 'force-dynamic'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  let siteSettings: { key: string; value: string }[] = []
  let contactSetting: ContactSetting | null = null
  let activePlugins: { id: string; code: string; position: string; order: number }[] = []

  try {
    const [ss, cs, ap] = await Promise.all([
      db.siteSetting.findMany(),
      db.contactSetting.findUnique({ where: { id: 'main' } }),
      db.plugin.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } })
    ])
    siteSettings = ss
    contactSetting = cs
    activePlugins = ap
  } catch (err) {
    console.error('PublicLayout: DB fetch failed, rendering with defaults:', err)
  }

  const settings: Record<string, string> = {}
  siteSettings.forEach(s => { settings[s.key] = s.value })

  const plugins = {
    head: activePlugins.filter(p => p.position === 'HEAD'),
    bodyEnd: activePlugins.filter(p => p.position === 'BODY_END'),
    footerFixed: activePlugins.filter(p => p.position === 'FOOTER_FIXED'),
    chatWidget: activePlugins.filter(p => p.position === 'CHAT_WIDGET'),
  }

  return (
    <>
      {plugins.head.map(p => (
        <div key={p.id} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(p.code) }} />
      ))}
      <CartProvider>
        <LazyMotion features={domAnimation}>
          <div className="page-root">
            <Header siteName={settings.site_name} />
            
            <main className="page-content">
              {children}
            </main>

            <Footer
              settings={settings}
              contact={contactSetting ? {
                ...contactSetting,
                contactMethods: contactSetting.contactMethods as ContactMethod[] | null,
              } : null}
            />
            
            <CartDrawer />
            
            <CookieConsent />
            
            {plugins.footerFixed.map(p => (
              <div key={p.id} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(p.code) }} />
            ))}
            {plugins.chatWidget.map(p => (
              <div key={p.id} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(p.code) }} />
            ))}
          </div>
        </LazyMotion>
      </CartProvider>
      {plugins.bodyEnd.map(p => (
        <div key={p.id} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(p.code) }} />
      ))}
    </>
  )
}
