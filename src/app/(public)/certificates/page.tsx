import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/lib/db'
import { FileText, ExternalLink, FileImage } from 'lucide-react'

export const metadata = {
  title: 'Certificates | Calendula Herbs',
  description: 'Our organic and quality assurance certificates — ISO, EU Organic, HALAL, KOSHER, USDA NOP, and more.',
}

export default async function CertificatesPage() {
  const certs = await db.certificate.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    include: { file: { select: { url: true, thumbnailUrl: true, type: true } } },
  })

  return (
    <div className="page-root">
      <div className="page-content">
        <section className="bg-[var(--color-bg-elevated)] pt-32 pb-20 text-center px-6">
          <h1 className="font-display text-4xl md:text-5xl font-medium mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Quality & Certifications
          </h1>
          <p className="max-w-2xl mx-auto text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            We adhere to the highest international standards for organic farming, processing, and export.
          </p>
        </section>

        <div className="section">
          {certs.length === 0 ? (
            <p className="text-center text-neutral-500 py-12">No certifications listed yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {certs.map((cert) => {
                const fileUrl = cert.file?.url
                const isPdf = cert.file?.type === 'PDF' || cert.fileType === 'PDF'
                const thumbUrl = cert.file?.thumbnailUrl || fileUrl

                const card = (
                  <div className="card-glass cert-card">
                    {fileUrl && thumbUrl ? (
                      <div className="w-full aspect-[4/3] relative mb-3 rounded-lg overflow-hidden bg-neutral-50">
                        {isPdf ? (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                            <FileText className="w-10 h-10 text-red-400" />
                            <span className="text-xs text-neutral-400 font-medium">PDF Document</span>
                          </div>
                        ) : (
                          <Image
                            src={thumbUrl}
                            alt={cert.title}
                            fill
                            className="object-contain p-2"
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                          />
                        )}
                      </div>
                    ) : (
                      <div className="w-full aspect-[4/3] relative mb-3 rounded-lg overflow-hidden bg-neutral-50 flex items-center justify-center">
                        <FileImage className="w-10 h-10 text-neutral-300" />
                      </div>
                    )}
                    <h3 className="cert-card__name">{cert.title}</h3>
                    {cert.issuer && (
                      <p className="text-xs text-neutral-400 font-medium">{cert.issuer}</p>
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
