import React, { Suspense } from 'react'
import { Package, FileSearch } from 'lucide-react'
import { ProductRequestForm } from './ProductRequestForm'

export const metadata = {
  title: 'Request a Product | Calendula Herbs',
  description: "Can't find what you're looking for? Submit a product request and our team will source it for you.",
}

export default async function ProductRequestPage() {
  return (
    <div className="page-root">
      <div className="page-content">
        <section className="bg-[var(--color-bg-elevated)] pt-32 pb-20 text-center px-6">
          <h1 className="font-display text-4xl md:text-5xl font-medium mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Can&apos;t Find a Product?
          </h1>
          <p className="max-w-2xl mx-auto text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            We source a wide range of herbs, spices, seeds, and botanical products beyond what is listed on our site. Tell us what you need.
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
                    { icon: FileSearch, title: 'Tell Us What You Need', desc: "Describe the product you're looking for — name, specifications, quantity." },
                    { icon: Package, title: 'We Source & Quote', desc: 'Our procurement team searches global suppliers and prepares a competitive quote.' },
                    { icon: Package, title: 'We Deliver', desc: 'Once confirmed, we handle logistics and deliver to your destination.' },
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
                <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>What We Can Source</h3>
                <ul className="space-y-2" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                  <li className="flex items-start gap-2"><span className="text-green-600 shrink-0">•</span> Culinary & medicinal herbs</li>
                  <li className="flex items-start gap-2"><span className="text-green-600 shrink-0">•</span> Spices & seasonings</li>
                  <li className="flex items-start gap-2"><span className="text-green-600 shrink-0">•</span> Seeds & botanicals</li>
                  <li className="flex items-start gap-2"><span className="text-green-600 shrink-0">•</span> Essential oils & extracts</li>
                  <li className="flex items-start gap-2"><span className="text-green-600 shrink-0">•</span> Custom specifications & grades</li>
                  <li className="flex items-start gap-2"><span className="text-green-600 shrink-0">•</span> Organic & conventional options</li>
                </ul>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="card-glass p-8 md:p-10">
                <h2 className="font-display text-3xl font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Submit Your Request
                </h2>
                <p className="mb-8" style={{ color: 'var(--color-text-tertiary)' }}>
                  Fill out the form and our team will follow up within 24 hours with a tailored quote.
                </p>
                <Suspense fallback={<div className="text-center py-8" style={{ color: 'var(--color-text-tertiary)' }}>Loading form...</div>}>
                  <ProductRequestForm />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
