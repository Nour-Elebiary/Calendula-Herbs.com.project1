import React from 'react'
import { db } from '@/lib/db'
import { MapPin, Phone, Mail, MessageSquare } from 'lucide-react'
import { ContactForm } from '@/components/public/ContactForm'
import { MapEmbedWrapper } from '@/components/public/MapEmbedWrapper'
import { getTranslations, getLocale } from 'next-intl/server'
import { generateContactLink, getDisplayValue, isClickableLink, CONTACT_METHOD_META, type ContactMethod } from '@/lib/contact-links'
import { getContactMethodIcon } from '@/lib/icon-map'

export async function generateMetadata() {
  const t = await getTranslations('contact')
  return {
    title: t('heroMetadataTitle'),
    description: t('heroMetadataDesc'),
  }
}

export default async function ContactPage() {
  const t = await getTranslations('contact')
  const locale = await getLocale()
  const contact = await db.contactSetting.findUnique({ where: { id: 'main' } })
  const teamMembers = await db.teamMember.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  })

  let hours: Record<string, string> = {}
  try {
    if (contact?.businessHours) hours = JSON.parse(contact.businessHours)
  } catch {}

  const formEnabled = contact?.formEnabled ?? true

  const contactPhones = (contact?.phones as Array<{ number: string; ownerName?: string }> | undefined) || []
  const rawPhones = contactPhones.length > 0 ? contactPhones : [{ number: '+20 112 023 8857' }, { number: '+20 112 770 3323' }]
  const phones = Array.isArray(rawPhones) ? rawPhones : []
  const emails = contact?.publicEmails?.length ? contact.publicEmails : ['info@calendula-herbs.com']
  const address = contact?.mapAddress || 'New Seat St., Ibshway, Fayoum, Egypt — ZIP 63611'

  const contactMethods: ContactMethod[] = (contact?.contactMethods as ContactMethod[]) || []

  return (
    <div className="page-root">
      <div className="page-content">
        {/* Header */}
        <section className="hero-page">
          <div className="hero-page__bg hero-page__bg--contact" />
          <div className="hero-page__overlay hero-page__overlay--contact" />
          <div className="hero-page__content">
            <div className="hero-page__glass-card">
              <h1 className="hero-page__title">{t('heroTitle')}</h1>
              <p className="hero-page__desc">{t('heroDesc')}</p>
            </div>
          </div>
        </section>

        <div className="section">
          <div className="container">
            <div className="grid lg:grid-cols-5 gap-16">
              
              {/* Form — left (3 cols) */}
              <div className="lg:col-span-3">
                <div className="card-glass p-8 md:p-10">
                  <h2 className="text-3xl font-display font-bold text-[var(--color-text-primary)] mb-2">{t('formTitle')}</h2>
                  <p className="text-[var(--color-text-tertiary)] mb-8">{t('formDesc')}</p>
                  
                  {formEnabled ? (
                    <ContactForm />
                  ) : (
                    <div className="card-glass p-12 text-center">
                      <MessageSquare className="w-12 h-12 text-[var(--color-text-tertiary)] mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-[var(--color-text-primary)] mb-2">{t('unavailableTitle')}</h3>
                      <p className="text-[var(--color-text-secondary)]">{t('unavailableDesc')}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Direct Channels — right (2 cols) */}
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h3 className="text-2xl font-display font-bold text-[var(--color-text-primary)] mb-6">{t('directTitle')}</h3>
                  <p className="text-[var(--color-text-secondary)] mb-8 leading-relaxed">{t('directDesc')}</p>
                  
                  <div className="space-y-4">
                    {/* Messaging contact methods */}
                    {contactMethods.map((method, i) => {
                      const meta = CONTACT_METHOD_META[method.type] || CONTACT_METHOD_META.other
                      const Icon = getContactMethodIcon(method.icon || method.type)
                      const link = generateContactLink(method)
                      const clickable = isClickableLink(method)
                      return (
                        <div key={i} className="card-glass channel-card">
                          <span className="channel-card__label">
                            <Icon className="w-3 h-3 inline mr-1" /> {method.label || meta.label}
                          </span>
                          <span className="channel-card__value">{getDisplayValue(method)}</span>
                          {clickable && (
                            <div className="flex gap-2 mt-3">
                              <a href={link} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                                {meta.label}
                              </a>
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {/* Team Members Direct Contacts */}
                    {teamMembers.map((member) => {
                      const contacts = ((member as any).contacts as any[]) || []
                      const phoneContacts = contacts.filter(c => ['WHATSAPP', 'PHONE', 'VIBER', 'SIGNAL'].includes(c.type?.toUpperCase()))
                      
                      if (phoneContacts.length === 0) return null
                      
                      return (
                        <div key={member.id} className="card-glass channel-card">
                          <span className="channel-card__label">
                            <Phone className="w-3 h-3 inline mr-1" /> {member.name}
                          </span>
                          {phoneContacts.map((c, i) => {
                            const Icon = getContactMethodIcon(c.icon || c.type)
                            const displayValue = c.label || c.value
                            const cleanPhone = c.value.replace(/[^\d+]/g, '')
                            // Create a whatsapp link if it's whatsapp
                            const isWhatsApp = c.type?.toUpperCase() === 'WHATSAPP'
                            const href = isWhatsApp ? `https://wa.me/${cleanPhone.replace('+', '')}` : `tel:${cleanPhone}`
                            
                            return (
                              <a key={i} href={href} target={isWhatsApp ? '_blank' : undefined} rel={isWhatsApp ? 'noopener noreferrer' : undefined} className="channel-card__value flex items-center gap-2 hover:text-[var(--color-green-500)] transition-colors">
                                <Icon className="w-4 h-4 text-[var(--color-text-tertiary)]" />
                                {displayValue}
                              </a>
                            )
                          })}
                        </div>
                      )
                    })}

                    {/* Generic Phone (fallback if no team members or general lines) */}
                    {phones.length > 0 && (
                      <div className="card-glass channel-card">
                        <span className="channel-card__label"><Phone className="w-3 h-3 inline mr-1" /> {t('phoneLabel')}</span>
                        {phones.map((entry: any, i: number) => {
                          const number = typeof entry === 'string' ? entry : entry.number
                          const ownerName = typeof entry === 'string' ? undefined : entry.ownerName
                          const normalized = number.replace(/[^\d+]/g, '')
                          return (
                            <a key={i} href={`tel:${normalized}`} className="channel-card__value">{ownerName ? `${ownerName}: ` : ''}{number}</a>
                          )
                        })}
                      </div>
                    )}

                    {/* Email */}
                    <div className="card-glass channel-card">
                      <span className="channel-card__label"><Mail className="w-3 h-3 inline mr-1" /> {t('emailLabel')}</span>
                      {emails.map((email, i) => (
                        <a key={i} href={`mailto:${email}`} className="channel-card__value">{email}</a>
                      ))}
                    </div>

                    {/* Address */}
                    <div className="card-glass channel-card">
                      <span className="channel-card__label"><MapPin className="w-3 h-3 inline mr-1" /> {t('addressLabel')}</span>
                      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{address}</p>
                    </div>

                    {/* Business Hours */}
                    {Object.keys(hours).length > 0 && (
                      <div className="card-glass channel-card">
                        <span className="channel-card__label">{t('hoursLabel')}</span>
                        <div className="space-y-2 text-sm">
                          {Object.entries(hours).map(([days, time]) => (
                            <div key={days} className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-2">
                              <span className="text-[var(--color-text-tertiary)]">{days}</span>
                              <span className="text-[var(--color-text-primary)] font-medium">{time}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Map */}
        <div className="section pt-0">
          <div className="container">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-display font-bold text-[var(--color-text-primary)]">{t('locationTitle')}</h2>
              <p className="text-[var(--color-text-tertiary)] mt-2">{address}</p>
            </div>
            <div className="card-glass overflow-hidden p-1">
              <MapEmbedWrapper
                address={address}
                mapLat={contact?.mapLat}
                mapLng={contact?.mapLng}
                customSrc="https://www.google.com/maps/d/embed?mid=1MnppadxTyBKV4xc3v-Qgqqqk1LijRTQ&ehbc=2E312F"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
