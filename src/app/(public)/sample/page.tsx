import React, { Suspense } from 'react'
import { db } from '@/lib/db'
import { FlaskConical, Package } from 'lucide-react'
import { SampleRequestForm } from './SampleRequestForm'

export const metadata = {
  title: 'Request a Sample | Calendula Herbs',
  description: 'Request free samples of our organic herbs, spices, and botanical products for quality evaluation.',
}

export default async function SamplePage() {
  const products = await db.product.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="page-root">
      <div className="page-content">
        <section className="bg-[var(--color-bg-elevated)] pt-32 pb-20 text-center px-6">
          <h1 className="font-display text-4xl md:text-5xl font-medium mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Request a Sample
          </h1>
          <p className="max-w-2xl mx-auto text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            Evaluate our quality firsthand. Request free samples of our organic products.
          </p>
        </section>

        <div className="section" style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
          <div className="grid lg:grid-cols-5 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="font-display text-2xl font-medium mb-4" style={{ color: 'var(--color-text-primary)' }}>
                  How It Works
                </h2>
                <ul className="space-y-4">
                  {[
                    { icon: Package, title: 'Select Products', desc: 'Choose the products you\'re interested in testing.' },
                    { icon: FlaskConical, title: 'We Prepare & Ship', desc: 'Our team prepares samples (50–200g) from current batch.' },
                    { icon: Package, title: 'Evaluate Quality', desc: 'Test for purity, potency, and consistency in your lab.' },
                  ].map((step, i) => (
                    <li key={i} className="flex gap-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(94,158,102,0.10)' }}
                      >
                        <step.icon className="w-5 h-5" style={{ color: 'var(--color-green-600)' }} />
                      </div>
                      <div>
                        <h4 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{step.title}</h4>
                        <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>{step.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card-glass p-6 space-y-3">
                <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Important Notes</h3>
                <ul className="space-y-2" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                  <li className="flex items-start gap-2 before:content-['•'] before:mr-1" style={{ color: 'var(--color-calendula-500)' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Samples are free for qualified buyers.</span>
                  </li>
                  <li className="flex items-start gap-2 before:content-['•'] before:mr-1" style={{ color: 'var(--color-calendula-500)' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Shipping costs may apply depending on location and order value.</span>
                  </li>
                  <li className="flex items-start gap-2 before:content-['•'] before:mr-1" style={{ color: 'var(--color-calendula-500)' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Sample quantities typically range from 50g to 200g.</span>
                  </li>
                  <li className="flex items-start gap-2 before:content-['•'] before:mr-1" style={{ color: 'var(--color-calendula-500)' }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Allow 5–10 business days for sample preparation and dispatch.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="card-glass p-8 md:p-10">
                <h2 className="font-display text-3xl font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Submit Your Request
                </h2>
                <p className="mb-8" style={{ color: 'var(--color-text-tertiary)' }}>
                  Fill out the form and our team will follow up within 24 hours.
                </p>
                <Suspense fallback={<div className="text-center py-8" style={{ color: 'var(--color-text-tertiary)' }}>Loading form...</div>}>
                  <SampleRequestForm products={products} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
