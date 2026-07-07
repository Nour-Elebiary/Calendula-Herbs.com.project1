import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/lib/db'
import { cleanImageUrl } from '@/lib/image-url'
import { ExternalLink, FileImage } from 'lucide-react'

function pdfPreviewUrl(url: string | undefined | null): string | null {
  if (!url) return null
  if (url.includes('res.cloudinary.com') && url.endsWith('.pdf')) {
    return url.replace('/upload/', '/upload/f_png/')
  }
  return url.replace(/\.pdf$/, '.png')
}

export const metadata = {
  title: 'Certificates | Calendula Herbs',
  description: 'Our organic and quality assurance certificates — ISO, EU Organic, HALAL, KOSHER, USDA NOP, and more.',
}

export default async function CertificatesPage() {
  const certs = await db.certificate.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    include: {
      file: { select: { url: true, thumbnailUrl: true, type: true } },
      logo: { select: { url: true } },
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
              <h1 className="hero-page__title">
                Quality & Certifications
              </h1>
              <p className="hero-page__desc">
                We adhere to the highest international standards for organic farming, processing, and export.
              </p>
            </div>
          </div>
        </section>

        <div className="section">
          {certs.length === 0 ? (
            <p className="text-center text-neutral-500 py-12">No certifications listed yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {certs.map((cert) => {
                const fileUrl = cert.file?.url
                const isPdf = cert.file?.type === 'PDF' || cert.fileType === 'PDF'
                const previewUrl = pdfPreviewUrl(fileUrl) || cert.file?.thumbnailUrl || fileUrl

                const card = (
                  <div key={cert.id} className="card-glass cert-card">
                    {fileUrl && previewUrl ? (
                      <div className="w-full aspect-[4/3] relative mb-3 rounded-lg overflow-hidden bg-neutral-50">
                        <Image
                          src={previewUrl}
                          alt={cert.title}
                          fill
                          className="object-contain p-2"
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                        />
                      </div>
                    ) : (
                      <div className="w-full aspect-[4/3] relative mb-3 rounded-lg overflow-hidden bg-neutral-50 flex items-center justify-center">
                        <FileImage className="w-10 h-10 text-neutral-300" />
                      </div>
                    )}
                    {cert.logo?.url && (
                      <div className="flex items-center gap-3 mb-2">
                        {/\.svg($|\?)/i.test(cert.logo.url) ? (
                          <img
                            src={cleanImageUrl(cert.logo.url) ?? ''}
                            alt={`${cert.title} logo`}
                            width={40}
                            height={40}
                            className="object-contain rounded"
                          />
                        ) : (
                          <Image
                            src={cleanImageUrl(cert.logo.url) ?? ''}
                            alt={`${cert.title} logo`}
                            width={40}
                            height={40}
                            className="object-contain rounded"
                          />
                        )}
                        <div>
                          <h3 className="cert-card__name">{cert.title}</h3>
                          {cert.issuer && (
                            <p className="text-xs text-neutral-400 font-medium">{cert.issuer}</p>
                          )}
                        </div>
                      </div>
                    )}
                    {!cert.logo?.url && (
                      <>
                        <h3 className="cert-card__name">{cert.title}</h3>
                        {cert.issuer && (
                          <p className="text-xs text-neutral-400 font-medium">{cert.issuer}</p>
                        )}
                      </>
                    )}
                    <span className="badge badge-green mt-1">
                      Certified
                    </span>
                    {fileUrl && (
                      <Link
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary text-sm gap-1.5 mt-2"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {isPdf ? 'View PDF' : 'View File'}
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
