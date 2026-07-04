'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Phone, Mail, Clock, Globe } from 'lucide-react'
import { generateContactLink, isClickableLink, CONTACT_METHOD_META, type ContactMethod } from '@/lib/contact-links'
import { getContactMethodIcon } from '@/lib/icon-map'

type FooterProps = {
  settings: Record<string, string>
  contact: {
    mapAddress: string | null
    phones: string[]
    publicEmails: string[]
    businessHours: string | null
    contactMethods: ContactMethod[] | null
  } | null
}

export function Footer({ settings, contact }: FooterProps) {
  const currentYear = new Date().getFullYear()
  const siteName = settings.site_name || 'Calendula Herbs'

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
              {settings.site_tagline || 'Specialists in exporting premium Egyptian dried herbs, spices, herbal tea, and seeds.'}
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
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link href="/products" className="footer-link">Products Catalog</Link></li>
              <li><Link href="/about" className="footer-link">About Our Company</Link></li>
              <li><Link href="/galleries" className="footer-link">Farm & Processing</Link></li>
              <li><Link href="/certificates" className="footer-link">Quality Certificates</Link></li>
              <li><Link href="/contact" className="footer-link">Contact Us</Link></li>
              <li><Link href="/privacy" className="footer-link">Privacy Policy</Link></li>
              <li><Link href="/terms" className="footer-link">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="footer-heading">Contact Us</h4>
            {contact?.mapAddress && (
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="w-4 h-4 shrink-0 mt-1 text-[var(--color-calendula-500)]" />
                <span className="text-sm leading-snug text-[var(--color-text-secondary)]">{contact.mapAddress}</span>
              </div>
            )}
            {contact?.phones && contact.phones.length > 0 && (
              <div className="flex items-start gap-3 mb-4">
                <Phone className="w-4 h-4 shrink-0 mt-1 text-[var(--color-calendula-500)]" />
                <div className="text-sm">
                  {contact.phones.map((phone, i) => (
                    <div key={i} className="mb-1 last:mb-0">
                      <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="footer-link">{phone}</a>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
            <div className="flex flex-wrap gap-2">
              {['ISO 9001', 'EU Organic', 'HALAL', 'KOSHER', 'FDA'].map(cert => (
                <span key={cert} className="badge badge-green text-[10px] sm:text-xs">{cert}</span>
              ))}
            </div>
          </div>

          {/* Business Hours */}
          <div>
            <h4 className="footer-heading">Business Hours</h4>
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
                <span className="text-sm leading-snug text-[var(--color-text-secondary)]">Contact us anytime for inquiries.</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          <p className="footer-copyright text-xs sm:text-sm">
            © {currentYear} Calendula Herbs For Import & Export. Ibshaway, Fayoum, Egypt.
          </p>
        </div>
      </div>
    </footer>
  )
}
