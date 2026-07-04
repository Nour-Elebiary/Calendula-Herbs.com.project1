import React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Calendula Herbs privacy policy — how we collect, use, and protect your personal data.',
}

export default function PrivacyPage() {
  return (
    <div className="page-root">
      <div className="page-content">
        <section className="bg-[var(--color-bg-elevated)] pt-32 pb-20 text-center px-6">
          <h1 className="font-display text-4xl md:text-5xl font-medium mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Privacy Policy
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
            Last updated: June 2026
          </p>
        </section>

        <div className="section" style={{ maxWidth: 'var(--container-tight)', margin: '0 auto' }}>
          <div className="card-glass p-8 md:p-10 space-y-6" style={{ color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-loose)' }}>
            <h2 className="font-display text-2xl font-medium" style={{ color: 'var(--color-text-primary)' }}>1. Introduction</h2>
            <p>Calendula Herbs For Import & Export (&ldquo;we,&rdquo; &ldquo;our,&rdquo; &ldquo;us&rdquo;) is committed to protecting your privacy. This policy explains how we collect, use, and safeguard your personal information when you visit our website or use our services.</p>

            <h2 className="font-display text-2xl font-medium" style={{ color: 'var(--color-text-primary)' }}>2. Information We Collect</h2>
            <p><strong>Information you provide:</strong> Name, email address, phone number, company name, country, and any details you submit through our contact forms, quote requests, or sample requests.</p>
            <p><strong>Information collected automatically:</strong> IP address, browser type, device information, pages visited, and time spent on our site (via cookies and analytics).</p>

            <h2 className="font-display text-2xl font-medium" style={{ color: 'var(--color-text-primary)' }}>3. How We Use Your Information</h2>
            <ul style={{ paddingLeft: '1.5rem', listStyle: 'disc' }}>
              <li>To respond to your inquiries and provide quotes</li>
              <li>To process product and sample requests</li>
              <li>To improve our website and customer experience</li>
              <li>To comply with legal obligations</li>
            </ul>

            <h2 className="font-display text-2xl font-medium" style={{ color: 'var(--color-text-primary)' }}>4. Data Protection</h2>
            <p>We implement appropriate security measures including encryption, access controls, and secure servers to protect your personal data against unauthorized access, alteration, or disclosure.</p>

            <h2 className="font-display text-2xl font-medium" style={{ color: 'var(--color-text-primary)' }}>5. Data Retention</h2>
            <p>We retain your personal data only as long as necessary for the purposes described in this policy or as required by law. Inquiries and contact submissions are retained for a maximum of 3 years.</p>

            <h2 className="font-display text-2xl font-medium" style={{ color: 'var(--color-text-primary)' }}>6. Your Rights</h2>
            <p>Under applicable data protection laws, you have the right to:</p>
            <ul style={{ paddingLeft: '1.5rem', listStyle: 'disc' }}>
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Request data portability</li>
            </ul>
            <p>To exercise these rights, contact us at <a href="mailto:info@calendulaherbs.com" style={{ color: 'var(--color-green-600)' }}>info@calendulaherbs.com</a>.</p>

            <h2 className="font-display text-2xl font-medium" style={{ color: 'var(--color-text-primary)' }}>7. Third-Party Services</h2>
            <p>We use the following third-party services that may process your data:</p>
            <ul style={{ paddingLeft: '1.5rem', listStyle: 'disc' }}>
              <li><strong>Cloudinary</strong> — image and media hosting</li>
              <li><strong>Resend</strong> — transactional email delivery</li>
              <li><strong>Supabase</strong> — database hosting</li>
              <li><strong>Railway</strong> — website hosting</li>
            </ul>

            <h2 className="font-display text-2xl font-medium" style={{ color: 'var(--color-text-primary)' }}>8. Cookies</h2>
            <p>Our website may use cookies for analytics and functionality. You can control cookie preferences through your browser settings.</p>

            <h2 className="font-display text-2xl font-medium" style={{ color: 'var(--color-text-primary)' }}>9. Contact</h2>
            <p>For questions about this privacy policy, contact us at:</p>
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
