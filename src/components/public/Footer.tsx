'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Phone, Mail, Clock, Globe } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { cleanImageUrl } from '@/lib/image-url'
import { generateContactLink, isClickableLink, CONTACT_METHOD_META, type ContactMethod } from '@/lib/contact-links'
import { getContactMethodIcon } from '@/lib/icon-map'

type FooterProps = {
  settings: Record<string, string>
  contact: {
    mapAddress: string | null
    phones: { number: string; ownerName?: string }[]
    publicEmails: string[]
    businessHours: string | null
    contactMethods: ContactMethod[] | null
    teamMembers?: any[]
  } | null
}

type CertData = {
  id: string
  title: string
  logo?: { url: string; thumbnailUrl: string | null } | null
}

export function Footer({ settings, contact }: FooterProps) {
  const t = useTranslations('footer')
  const locale = useLocale()
  const [certs, setCerts] = useState<CertData[]>([])
  const currentYear = new Date().getFullYear()
  const siteName = settings.site_name || 'Calendula Herbs'

  useEffect(() => {
    fetch('/api/public/certificates')
      .then(r => r.json())
      .then(data => {
        if (data.certs?.length) {
          setCerts(data.certs.filter((c: CertData) => c.logo?.url))
        }
      })
      .catch(() => {})
  }, [])

  let hours: Record<string, string> = {}
  try {
    if (contact?.businessHours) hours = JSON.parse(contact.businessHours)
  } catch {}

  const socialLinks = [
    { key: 'social_linkedin', icon: Globe, label: 'LinkedIn' },
    { key: 'social_facebook', icon: Globe, label: 'Facebook' },
    { key: 'social_instagram', icon: Globe, label: 'Instagram' },
    { key: 'social_twitter', icon: Globe, label: 'Twitter / X' },
  ]

  const contactMethods: ContactMethod[] = contact?.contactMethods || []

  return (
    <footer className="footer-primary">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="footer-grid">
          {/* Brand */}
          <div>
            <div className="footer-brand">
              <Link href="/" className="no-underline hover:opacity-80 transition-opacity inline-block">
                <Image
                  src="https://res.cloudinary.com/dcukpuftg/image/upload/v1782266932/calendula-herbs/brand/logo.png"
                  alt="Calendula Herbs"
                  width={148}
                  height={80}
                  className="object-contain"
                />
              </Link>
            </div>
            <p className="footer-tagline leading-relaxed">
              {settings.site_tagline || t('brandDescription')}
            </p>
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map(({ key, icon: Icon, label }) =>
                settings[key] ? (
                  <a
                    key={key}
                    href={settings[key]}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-icon"
                    title={label}
                    aria-label={label}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ) : null
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer-heading">{t('quickLinks')}</h4>
            <ul className="footer-links">
              <li><Link href="/products" className="footer-link">{t('productsCatalog')}</Link></li>
              <li><Link href="/about" className="footer-link">{t('aboutCompany')}</Link></li>
              <li><Link href="/galleries" className="footer-link">{t('farmProcessing')}</Link></li>
              <li><Link href="/certificates" className="footer-link">{t('qualityCertificates')}</Link></li>
              <li><Link href="/contact" className="footer-link">{t('contactUs')}</Link></li>
              <li><Link href="/privacy" className="footer-link">{t('privacyPolicy')}</Link></li>
              <li><Link href="/terms" className="footer-link">{t('termsOfService')}</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="footer-heading">{t('contactInfo')}</h4>
            {contact?.mapAddress && (
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="w-4 h-4 shrink-0 mt-1 text-[var(--color-calendula-500)]" />
                <span className="text-sm leading-snug text-[var(--color-text-secondary)]">{contact.mapAddress}</span>
              </div>
            )}
            {/* Team Members Direct Contacts */}
            {(contact?.teamMembers || []).map((member) => {
              const contacts = (member.contacts as any[]) || []
              const phoneContacts = contacts.filter(c => ['WHATSAPP', 'PHONE', 'VIBER', 'SIGNAL'].includes(c.type?.toUpperCase()))
              
              if (phoneContacts.length === 0) return null
              
              return (
                <div key={member.id} className="mb-4">
                  <span className="text-[var(--color-text-primary)] font-medium mb-1.5 block text-sm">{member.name}</span>
                  <div className="flex flex-col gap-1.5 ml-1">
                    {phoneContacts.map((c, i) => {
                      const Icon = getContactMethodIcon(c.icon || c.type)
                      const displayValue = c.label || c.value
                      const cleanPhone = c.value.replace(/[^\d+]/g, '')
                      const isWhatsApp = c.type?.toUpperCase() === 'WHATSAPP'
                      const href = isWhatsApp ? `https://wa.me/${cleanPhone.replace('+', '')}` : `tel:${cleanPhone}`
                      
                      return (
                        <a key={i} href={href} target={isWhatsApp ? '_blank' : undefined} rel={isWhatsApp ? 'noopener noreferrer' : undefined} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary-500)] transition-colors">
                          <Icon className="w-3.5 h-3.5 shrink-0 text-[var(--color-calendula-500)]" />
                          <span>{displayValue}</span>
                        </a>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* General Phones */}
            {contact?.phones && contact.phones.length > 0 && (
              <div className="flex items-start gap-3 mb-4">
                <Phone className="w-4 h-4 shrink-0 mt-1 text-[var(--color-calendula-500)]" />
                <div className="text-sm">
                  {contact.phones.map((entry: any, i: number) => {
                    const number = typeof entry === 'string' ? entry : entry.number
                    const ownerName = typeof entry === 'string' ? undefined : entry.ownerName
                    const normalized = number.replace(/[^\d+]/g, '')
                    return (
                      <div key={i} className="mb-1 last:mb-0">
                        <a href={`tel:${normalized}`} className="footer-link">{ownerName ? `${ownerName}: ` : ''}{number}</a>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            {/* General Emails */}
            {contact?.publicEmails && contact.publicEmails.length > 0 && (
              <div className="flex items-start gap-3 mb-4">
                <Mail className="w-4 h-4 shrink-0 mt-1 text-[var(--color-calendula-500)]" />
                <div className="text-sm">
                  {contact.publicEmails.map((email, i) => (
                    <div key={i} className="mb-1 last:mb-0">
                      <a href={`mailto:${email}`} className="footer-link">{email}</a>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {contactMethods.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {contactMethods.map((method, i) => {
                  const meta = CONTACT_METHOD_META[method.type] || CONTACT_METHOD_META.other
                  const Icon = getContactMethodIcon(method.icon || method.type)
                  const link = generateContactLink(method)
                  const clickable = isClickableLink(method)
                  return clickable ? (
                    <a
                      key={i}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-icon"
                      title={meta.label}
                      aria-label={meta.label}
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  ) : null
                })}
              </div>
            )}
          </div>

          {/* Business Hours */}
          <div>
            <h4 className="footer-heading">{t('businessHours')}</h4>
            {Object.keys(hours).length > 0 ? (
              <ul className="list-none p-0 m-0">
                {Object.entries(hours).map(([days, time]) => (
                  <li key={days} className="flex items-center justify-between py-2 text-sm border-b border-[var(--color-border-subtle)]">
                    <span className="text-[var(--color-text-tertiary)]">{days}</span>
                    <span className="text-[var(--color-text-primary)] font-medium">{time}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 shrink-0 mt-1 text-[var(--color-calendula-500)]" />
                <span className="text-sm leading-snug text-[var(--color-text-secondary)]">{t('fallbackHours')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Certificates — full width row */}
        {certs.length > 0 && (
          <div
            className="border-t pt-8 mt-8"
            style={{ borderColor: 'var(--color-border-subtle)' }}
          >
            <h4 className="footer-heading text-center mb-6">{t('ourCertifications')}</h4>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              {certs.map(cert => {
                const rawLogoUrl = cert.logo?.thumbnailUrl || cert.logo?.url
                const logoUrl = cleanImageUrl(rawLogoUrl)
                const isSvg = rawLogoUrl ? /\.svg($|\?)/i.test(rawLogoUrl) : false
                if (!logoUrl) return null
                return (
                  <div
                    key={cert.id}
                    className="w-[110px] h-[55px] relative flex items-center justify-center"
                  >
                    {isSvg ? (
                      <img
                        src={logoUrl}
                        alt={`${cert.title} certificate logo`}
                        className="w-full h-full object-contain opacity-70 hover:opacity-100 transition-opacity"
                      />
                    ) : (
                      <Image
                        src={logoUrl}
                        alt={`${cert.title} certificate logo`}
                        fill
                        sizes="110px"
                        className="object-contain opacity-70 hover:opacity-100 transition-opacity"
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Bottom */}
        <div className="footer-bottom">
          <p className="footer-copyright text-xs sm:text-sm">
            {t('copyright', { year: currentYear })}
          </p>
        </div>
      </div>
    </footer>
  )
}
