import React from 'react'
import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { MapPin, Phone, Mail, MessageSquare } from 'lucide-react'
import { ContactForm } from '@/components/public/ContactForm'
import { MapEmbedWrapper } from '@/components/public/MapEmbedWrapper'

export const metadata: Metadata = {
  title: 'Contact Us | Calendula Herbs For Import & Export',
  description: 'Get in touch with Calendula Herbs for bulk organic herb export inquiries. Request a quote, product specifications, or samples.',
}
import { generateContactLink, getDisplayValue, isClickableLink, CONTACT_METHOD_META, type ContactMethod } from '@/lib/contact-links'
import { getContactMethodIcon } from '@/lib/icon-map'

export default async function ContactPage() {
  const contact = await db.contactSetting.findUnique({ where: { id: 'main' } })

  let hours: Record<string, string> = {}
  try {
    if (contact?.businessHours) hours = JSON.parse(contact.businessHours)
  } catch {}

  const formEnabled = contact?.formEnabled ?? true

  const phones = contact?.phones?.length ? contact.phones : ['+20 112 023 8857', '+20 112 770 3323']
  const emails = contact?.publicEmails?.length ? contact.publicEmails : ['info@calendula-herbs.com']
  const address = contact?.mapAddress || 'New Seat St., Ibshway, Fayoum, Egypt — ZIP 63611'

  const contactMethods: ContactMethod[] = (contact?.contactMethods as ContactMethod[]) || []

  return (
    <div className="page-root">
      <div className="page-content">
        {/* Header */}
        <section className="section section--tint text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-[var(--color-text-primary)] mb-4">Contact Us</h1>
          <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto text-lg">
            We are here to assist with your bulk herbal export needs. Pricing is provided after we understand your specific requirements and volume.
          </p>
        </section>

        <div className="section">
          <div className="container">
            <div className="grid lg:grid-cols-5 gap-16">
              
              {/* Form — left (3 cols) */}
              <div className="lg:col-span-3">
                <div className="card-glass p-8 md:p-10">
                  <h2 className="text-3xl font-display font-bold text-[var(--color-text-primary)] mb-2">Send an Inquiry</h2>
                  <p className="text-[var(--color-text-tertiary)] mb-8">Tell us about your requirements and we will get back to you within 24 hours.</p>
                  
                  {formEnabled ? (
                    <ContactForm />
                  ) : (
                    <div className="card-glass p-12 text-center">
                      <MessageSquare className="w-12 h-12 text-[var(--color-text-tertiary)] mx-auto mb-4" />
                      <h3 className="text-xl font-medium text-[var(--color-text-primary)] mb-2">Contact Form is Currently Unavailable</h3>
                      <p className="text-[var(--color-text-secondary)]">Please reach out to us directly via email or phone using the details provided.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Direct Channels — right (2 cols) */}
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h3 className="text-2xl font-display font-bold text-[var(--color-text-primary)] mb-6">Direct Contact</h3>
                  <p className="text-[var(--color-text-secondary)] mb-8 leading-relaxed">
                    Prefer to reach us directly? Our team is available during business hours.
                  </p>
                  
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
                            <Icon className="w-3 h-3 inline mr-1" /> {meta.label}
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

                    {/* Phone (regular) */}
                    <div className="card-glass channel-card">
                      <span className="channel-card__label"><Phone className="w-3 h-3 inline mr-1" /> Phone</span>
                      {phones.map((phone, i) => (
                        <a key={i} href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="channel-card__value">{phone}</a>
                      ))}
                    </div>

                    {/* Email */}
                    <div className="card-glass channel-card">
                      <span className="channel-card__label"><Mail className="w-3 h-3 inline mr-1" /> Email Support</span>
                      {emails.map((email, i) => (
                        <a key={i} href={`mailto:${email}`} className="channel-card__value">{email}</a>
                      ))}
                    </div>

                    {/* Address */}
                    <div className="card-glass channel-card">
                      <span className="channel-card__label"><MapPin className="w-3 h-3 inline mr-1" /> Headquarters & Farm</span>
                      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{address}</p>
                    </div>

                    {/* Business Hours */}
                    {Object.keys(hours).length > 0 && (
                      <div className="card-glass channel-card">
                        <span className="channel-card__label">Business Hours</span>
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
              <h2 className="text-3xl font-display font-bold text-[var(--color-text-primary)]">Our Location</h2>
              <p className="text-[var(--color-text-tertiary)] mt-2">{address}</p>
            </div>
            <div className="card-glass overflow-hidden p-1">
              <MapEmbedWrapper address={address} />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
