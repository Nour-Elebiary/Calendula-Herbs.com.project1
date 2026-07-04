import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { db } from '@/lib/db'
import { Leaf, Sprout, Factory, Globe, Award, ArrowRight } from 'lucide-react'
import { getContactTypeIcon } from '@/lib/icon-map'
import { generateTeamContactLink } from '@/lib/contact-links'
import { AboutHero } from '@/components/public/about/AboutHero'

export const metadata = {
  title: 'About Us | Calendula Herbs For Import & Export',
  description: 'Discover our heritage: 45 years of farming, 25 years of manufacturing, and 11 years of exporting premium organic herbs from Egypt.',
}

export default async function AboutPage() {
  const teamMembers = await db.teamMember.findMany({
    where: { isActive: true },
    include: { photo: true, contacts: true },
    orderBy: { order: 'asc' }
  })

  const board = teamMembers.filter(m => m.memberType === 'BOARD')
  const team = teamMembers.filter(m => m.memberType === 'TEAM')

  return (
    <div className="page-root">
      <div className="page-content">
        
        {/* Hero */}
        <AboutHero />

        {/* Heritage Stats */}
        <section className="section">
          <div className="container">
            <div className="stat-row">
              <div className="stat-item">
                <span className="stat-item__number">45</span>
                <span className="stat-item__unit">Years</span>
                <span className="stat-item__label">Farming Heritage</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-item__number">25</span>
                <span className="stat-item__unit">Years</span>
                <span className="stat-item__label">Manufacturing</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-item__number">11</span>
                <span className="stat-item__unit">Years</span>
                <span className="stat-item__label">Exporting Excellence</span>
              </div>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="section">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="aspect-[4/3] relative rounded-2xl overflow-hidden bg-[var(--color-bg-elevated)] flex items-center justify-center">
                 <Leaf className="w-32 h-32 text-[var(--color-text-tertiary)] opacity-30" />
                 <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-calendula-500)]/20 to-transparent" />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-[var(--color-text-primary)]">Our Heritage & Mission</h2>
                <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">
                  Founded with a vision to connect local farmers with global markets, Calendula Herbs has grown into a leading exporter of organic botanicals. Our farms are located in the most pristine agricultural regions of Egypt, ensuring that every crop is grown in optimal conditions.
                </p>
                <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">
                  We believe in sustainable agriculture, ethical trading, and uncompromising quality. From seed selection to final packaging, our rigorous quality control processes guarantee that our clients receive products that exceed international standards.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="section section--tint">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-display font-bold text-[var(--color-text-primary)] mb-4">Our Journey</h2>
              <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
                From family farm to global exporter — three generations of agricultural excellence.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card-glass p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--color-green-100)] flex items-center justify-center mx-auto mb-5">
                  <Sprout className="w-8 h-8 text-[var(--color-green-600)]" />
                </div>
                <span className="text-3xl font-display font-bold text-[var(--color-calendula-500)]">1980</span>
                <h3 className="text-xl font-display font-bold text-[var(--color-text-primary)] mt-3 mb-2">Farming Roots</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">Our family began cultivating medicinal herbs and aromatic plants in the fertile Fayoum region of Egypt.</p>
              </div>
              <div className="card-glass p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--color-green-100)] flex items-center justify-center mx-auto mb-5">
                  <Factory className="w-8 h-8 text-[var(--color-green-600)]" />
                </div>
                <span className="text-3xl font-display font-bold text-[var(--color-calendula-500)]">2000</span>
                <h3 className="text-xl font-display font-bold text-[var(--color-text-primary)] mt-3 mb-2">Manufacturing</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">Expanded into modern processing facilities for cleaning, cutting, drying, and packaging herbs at scale.</p>
              </div>
              <div className="card-glass p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--color-green-100)] flex items-center justify-center mx-auto mb-5">
                  <Globe className="w-8 h-8 text-[var(--color-green-600)]" />
                </div>
                <span className="text-3xl font-display font-bold text-[var(--color-calendula-500)]">2014</span>
                <h3 className="text-xl font-display font-bold text-[var(--color-text-primary)] mt-3 mb-2">Global Export</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">Founded Calendula Herbs for Export to bring Egyptian botanicals to the world market with full traceability.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Board & Team */}
        <section className="section">
          <div className="container">
            
            <div className="text-center mb-16">
              <h2 className="text-4xl font-display font-bold text-[var(--color-text-primary)] mb-4">Leadership & Team</h2>
              <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
                Meet the dedicated professionals driving our vision forward.
              </p>
            </div>

            {board.length > 0 && (
              <div className="mb-20">
                <h3 className="text-2xl font-display font-bold text-[var(--color-text-primary)] mb-8 border-b border-[var(--color-border-subtle)] pb-4">Board of Directors</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {board.map(member => (
                    <MemberCard key={member.id} member={member} />
                  ))}
                </div>
              </div>
            )}

            {team.length > 0 && (
              <div>
                <h3 className="text-2xl font-display font-bold text-[var(--color-text-primary)] mb-8 border-b border-[var(--color-border-subtle)] pb-4">Executive Team</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {team.map(member => (
                    <MemberCard key={member.id} member={member} small />
                  ))}
                </div>
              </div>
            )}

          </div>
        </section>

        {/* CTA */}
        <section className="section section--tint text-center">
          <div className="container" style={{ maxWidth: 'var(--container-tight)' }}>
            <Award className="w-12 h-12 text-[var(--color-calendula-500)] mx-auto mb-6" />
            <h2 className="text-4xl font-display font-bold text-[var(--color-text-primary)] mb-4">
              Ready to Work With Us?
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] mb-8 leading-relaxed">
              Whether you are an importer, distributor, or manufacturer, we would love to discuss how our premium herbs can meet your needs.
            </p>
            <Link href="/contact" className="btn btn-primary btn-lg">
              Contact Us <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}

function MemberCard({ member, small = false }: { member: { name: string; title: string; bio: string | null; photo: { url: string } | null; contacts: { id: string; icon: string | null; type: string; value: string; label: string | null }[] }, small?: boolean }) {
  const photoUrl = member.photo?.url

  return (
    <div className="card-glass p-0">
      <div className={`${small ? 'aspect-square' : 'aspect-[3/4]'} relative bg-[var(--color-bg-elevated)] overflow-hidden`}>
        {photoUrl ? (
          <Image src={photoUrl} alt={member.name} fill className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-bg-elevated)]">
            <span className="text-4xl font-display font-bold text-[var(--color-text-tertiary)] opacity-50">{member.name.charAt(0)}</span>
          </div>
        )}
      </div>
      <div className="p-6">
        <h4 className="text-xl font-display font-bold text-[var(--color-text-primary)] mb-1">{member.name}</h4>
        <p className="text-sm font-medium text-[var(--color-calendula-500)] mb-4 uppercase tracking-wider">{member.title}</p>
        
        {member.bio && (
          <p className="text-sm text-[var(--color-text-secondary)] mb-6 line-clamp-3">{member.bio}</p>
        )}

        {member.contacts.length > 0 && (
          <div className="flex flex-wrap gap-3 pt-4 border-t border-[var(--color-border-subtle)]">
            {member.contacts.map((c: { id: string; icon: string | null; type: string; value: string; label: string | null }) => {
              const Icon = getContactTypeIcon(c.icon || c.type)
              const { href, external } = generateTeamContactLink(c.type, c.value)
              return (
                <a
                  key={c.id}
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noreferrer' : undefined}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)] hover:text-[var(--color-green-600)] hover:bg-[var(--color-green-50)] transition-all"
                  title={c.label || c.type}
                >
                  <Icon className="w-4 h-4" />
                </a>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
