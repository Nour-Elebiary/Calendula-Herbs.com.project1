'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { cleanImageUrl } from '@/lib/image-url'
import { fadeInUp, staggerContainer } from '@/lib/animations'

type CertData = {
  id: string
  title: string
  file?: { url: string; type: string } | null
  logo?: { url: string; thumbnailUrl: string | null } | null
}

export function CertsBanner() {
  const [certs, setCerts] = useState<CertData[]>([])

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

  if (certs.length === 0) return null

  return (
    <section className="section-herbal-frame py-24">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          className="text-center space-y-4 mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl md:text-4xl font-display font-[400] leading-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Certifications &amp; Quality Standards
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="font-light max-w-xl mx-auto"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Our certifications reflect our unwavering commitment to quality, safety, and sustainability.
          </motion.p>
        </motion.div>

        <motion.div
          className="cert-strip justify-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          {certs.map((cert) => {
            const rawLogoUrl = cert.logo?.thumbnailUrl || cert.logo?.url
            const logoUrl = cleanImageUrl(rawLogoUrl)
            const isSvg = rawLogoUrl ? /\.svg($|\?)/i.test(rawLogoUrl) : false
            if (!logoUrl) return null

            const fileUrl = cert.file?.url
            const isPdf = cert.file?.type === 'PDF'
            const downloadHref = fileUrl || (isPdf && cert.id ? `/api/public/certificates/pdf/${cert.id}` : undefined)
            const Wrapper = fileUrl ? 'a' : 'div'
            const wrapperProps = fileUrl
              ? { href: downloadHref, target: '_blank', rel: 'noopener noreferrer' }
              : {}

            return (
              <motion.div key={cert.title} variants={fadeInUp}>
                <Wrapper
                  {...wrapperProps}
                  className="cert-logo-link"
                  title={`${cert.title}${fileUrl ? ' — Click to view certificate' : ''}`}
                >
                  {isSvg ? (
                    <img
                      src={logoUrl}
                      alt={`${cert.title} certificate logo`}
                      width={120}
                      height={60}
                      className="cert-logo-img"
                      style={{ objectFit: 'contain' }}
                    />
                  ) : (
                    <Image
                      src={logoUrl}
                      alt={`${cert.title} certificate logo`}
                      width={120}
                      height={60}
                      className="cert-logo-img"
                      style={{ objectFit: 'contain' }}
                    />
                  )}
                </Wrapper>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
