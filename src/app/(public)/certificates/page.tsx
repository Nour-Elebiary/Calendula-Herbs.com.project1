import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/lib/db'
import { cleanImageUrl } from '@/lib/image-url'
import { ExternalLink, FileImage } from 'lucide-react'
import { getTranslations, getLocale } from 'next-intl/server'
import { CertPreviewImage } from '@/components/public/CertPreviewImage'

function pdfPreviewUrl(url: string | undefined | null): string | null {
  if (!url) return null

  const base = url.split('?')[0]

  if (base.includes('res.cloudinary.com')) {
    if (!base.endsWith('.pdf')) return url

    const uploadIdx = url.indexOf('/upload/')
    if (uploadIdx === -1) return url

    const prefix = url.slice(0, uploadIdx + 8)
    let rest = url.slice(uploadIdx + 8)

    if (rest.startsWith('v')) {
      return `${prefix}f_png/${rest}`
    }

    const sepIdx = rest.indexOf('/')
    if (sepIdx === -1) return url

    const transforms = rest.slice(0, sepIdx)
    const afterTransforms = rest.slice(sepIdx)

    const parts = transforms.split(',')
    const fIdx = parts.findIndex(p => p.startsWith('f_'))
    if (fIdx !== -1) {
      parts[fIdx] = 'f_png'
    } else {
      parts.push('f_png')
    }

    return `${prefix}${parts.join(',')}${afterTransforms}`
  }

  if (base.match(/\.pdf$/i)) {
    return url.replace(/\.pdf$/i, '.png')
  }
  return null
}

export async function generateMetadata() {
  const t = await getTranslations('certificates')
  return {
    title: t('heroMetadataTitle'),
    description: t('heroMetadataDesc'),
  }
}

export default async function CertificatesPage() {
  const t = await getTranslations('certificates')
  const locale = await getLocale()
  const certs = await db.certificate.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    include: {
      file: { select: { url: true, thumbnailUrl: true, type: true } },
      logo: { select: { url: true, thumbnailUrl: true } },
      translations: { where: { locale } },
    },
  })

  return (
    <div className="page-root">
      <div className="page-content">
        <section className="hero-page">
          <div className="hero-page__bg hero-page__bg--certificates" />
          <div className="hero-page__overlay hero-page__overlay--certificates" />
          <div className="hero-page__content">
            <div className="hero-page__glass-card hero-page__glass-card--dark">
              <h1 className="hero-page__title">{t('heroTitle')}</h1>
              <p className="hero-page__desc">{t('heroDesc')}</p>
            </div>
          </div>
        </section>

        <div className="section">
          {certs.length === 0 ? (
            <p className="text-center text-neutral-500 py-12">{t('empty')}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {certs.map((cert) => {
                const ct = cert.translations?.[0]
                const fileUrl = cert.file?.url
                const isPdf = cert.file?.type === 'PDF' || cert.fileType === 'PDF'
                const pdfPreview = pdfPreviewUrl(fileUrl)
                const previewUrl = pdfPreview || cert.file?.thumbnailUrl || fileUrl
                const pdfPreviewWasApplied = pdfPreview && pdfPreview !== fileUrl
                const canRenderImage = previewUrl && (!previewUrl.toLowerCase().split('?')[0].endsWith('.pdf') || !!pdfPreviewWasApplied)

                const title = ct?.title ?? cert.title
                const issuer = ct?.issuer ?? cert.issuer
                const description = ct?.description ?? cert.description

                const card = (
                  <div key={cert.id} className="card-glass cert-card">
                    {fileUrl && canRenderImage ? (
                      <CertPreviewImage src={previewUrl!} alt={title} />
                    ) : (
                      <div className="w-full aspect-[4/3] relative mb-3 rounded-lg overflow-hidden bg-neutral-50 flex items-center justify-center">
                        <FileImage className="w-10 h-10 text-neutral-300" />
                      </div>
                    )}
                    {cert.logo?.url && (
                      <div className="flex items-center gap-3 mb-2">
                        {/\.svg($|\?)/i.test(cert.logo.url) ? (
                          <img
                            src={cleanImageUrl(cert.logo.thumbnailUrl || cert.logo.url) ?? ''}
                            alt={`${title} logo`}
                            width={40}
                            height={40}
                            className="object-contain rounded"
                          />
                        ) : (
                          <Image
                            src={cleanImageUrl(cert.logo.thumbnailUrl || cert.logo.url) ?? ''}
                            alt={`${title} logo`}
                            width={40}
                            height={40}
                            className="object-contain rounded"
                          />
                        )}
                        <div>
                          <h3 className="cert-card__name">{title}</h3>
                          {issuer && (
                            <p className="text-xs text-neutral-400 font-medium">{issuer}</p>
                          )}
                        </div>
                      </div>
                    )}
                    {!cert.logo?.url && (
                      <>
                        <h3 className="cert-card__name">{title}</h3>
                        {issuer && (
                          <p className="text-xs text-neutral-400 font-medium">{issuer}</p>
                        )}
                      </>
                    )}
                    {description && (
                      <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                        {description}
                      </p>
                    )}
                    <span className="badge badge-green mt-1">{t('certified')}</span>
                    {fileUrl && (
                      <Link
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary text-sm gap-1.5 mt-2"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {isPdf ? t('viewPdf') : t('viewFile')}
                      </Link>
                    )}
                  </div>
                )

                return card
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
