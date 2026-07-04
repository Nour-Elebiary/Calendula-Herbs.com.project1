import React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Calendula Herbs terms and conditions — governing the use of our website and services.',
}

export default function TermsPage() {
  return (
    <div className="page-root">
      <div className="page-content">
        <section className="bg-[var(--color-bg-elevated)] pt-32 pb-20 text-center px-6">
          <h1 className="font-display text-4xl md:text-5xl font-medium mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Terms &amp; Conditions
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            Last updated: June 2026
          </p>
        </section>

        <div className="section" style={{ maxWidth: 'var(--container-tight)', margin: '0 auto' }}>
          <div className="card-glass p-8 md:p-10 space-y-6" style={{ color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-loose)' }}>
            <h2 className="font-display text-2xl font-medium" style={{ color: 'var(--color-text-primary)' }}>1. Acceptance of Terms</h2>
            <p>By accessing and using the Calendula Herbs website, you agree to be bound by these terms and conditions. If you do not agree, please do not use our site.</p>

            <h2 className="font-display text-2xl font-medium" style={{ color: 'var(--color-text-primary)' }}>2. Products and Services</h2>
            <p>All products listed on our website are subject to availability. We reserve the right to modify or discontinue products without prior notice. Product descriptions, images, and specifications are provided for informational purposes and may not be 100% accurate in color or appearance.</p>

            <h2 className="font-display text-2xl font-medium" style={{ color: 'var(--color-text-primary)' }}>3. Orders and Quotes</h2>
            <p>Submitting a quote request or inquiry does not constitute a binding contract. Quotes are provided based on current market rates and are valid for the period specified in the quotation. All orders are subject to our written confirmation and agreed terms.</p>

            <h2 className="font-display text-2xl font-medium" style={{ color: 'var(--color-text-primary)' }}>4. Pricing</h2>
            <p>All prices listed are indicative and subject to change based on market conditions, crop yields, and order volume. Final pricing will be provided in the official quotation.</p>

            <h2 className="font-display text-2xl font-medium" style={{ color: 'var(--color-text-primary)' }}>5. Minimum Order Quantities</h2>
            <p>Minimum order quantities (MOQ) are listed per product. These may vary based on product availability and seasonal factors.</p>

            <h2 className="font-display text-2xl font-medium" style={{ color: 'var(--color-text-primary)' }}>6. Shipping and Delivery</h2>
            <p>Shipping terms are negotiated per order and will be specified in the sales contract. We work with reputable logistics partners to ensure timely delivery. Calendula Herbs is not liable for delays caused by customs, weather, or other force majeure events.</p>

            <h2 className="font-display text-2xl font-medium" style={{ color: 'var(--color-text-primary)' }}>7. Samples</h2>
            <p>Sample requests are subject to availability. The requester typically bears shipping costs unless otherwise agreed. Samples are provided for quality evaluation purposes only.</p>

            <h2 className="font-display text-2xl font-medium" style={{ color: 'var(--color-text-primary)' }}>8. Limitation of Liability</h2>
            <p>Calendula Herbs shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products. Our total liability shall not exceed the value of the specific order in question.</p>

            <h2 className="font-display text-2xl font-medium" style={{ color: 'var(--color-text-primary)' }}>9. Intellectual Property</h2>
            <p>All content on this website — including text, images, logos, and designs — is the property of Calendula Herbs For Import &amp; Export and is protected by applicable intellectual property laws.</p>

            <h2 className="font-display text-2xl font-medium" style={{ color: 'var(--color-text-primary)' }}>10. Governing Law</h2>
            <p>These terms are governed by the laws of the Arab Republic of Egypt. Any disputes shall be resolved in the courts of Fayoum Governorate, Egypt.</p>

            <h2 className="font-display text-2xl font-medium" style={{ color: 'var(--color-text-primary)' }}>11. Contact</h2>
            <p>
              Calendula Herbs For Import &amp; Export<br />
              Ibshaway, Fayoum Governorate, Egypt<br />
              Email: <a href="mailto:info@calendulaherbs.com" style={{ color: 'var(--color-green-600)' }}>info@calendulaherbs.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
