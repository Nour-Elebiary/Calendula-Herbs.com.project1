import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { db } from '@/lib/db'
import { Sprout, Factory, Globe, Award, ArrowRight } from 'lucide-react'
import { getContactTypeIcon } from '@/lib/icon-map'
import { generateTeamContactLink } from '@/lib/contact-links'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('about')
  return {
    title: t('heroMetadataTitle'),
    description: t('heroMetadataDesc'),
  }
}

export default async function AboutPage() {
  const t = await getTranslations('about')
  const teamMembers = await db.teamMember.findMany({
    where: { isActive: true },
    include: { photo: true, contacts: true },
    orderBy: { order: 'asc' }
  })

  const board = teamMembers.filter(m => m.memberType === 'BOARD')
  const team = teamMembers.filter(m => m.memberType === 'TEAM')

  return (
    <>
      {/* Hero */}
      <section className="hero-page">
        <div className="hero-page__bg hero-page__bg--about" />
        <div className="hero-page__overlay hero-page__overlay--about" />
        <div className="hero-page__content">
          <div className="hero-page__glass-card hero-page__glass-card--dark">
            <h1 className="hero-page__title">{t('heroTitle')}</h1>
            <p className="hero-page__desc">{t('heroDesc')}</p>
          </div>
        </div>
      </section>

      {/* Heritage Stats */}
      <section className="section">
          <div className="container">
            <div className="stat-row">
              <div className="stat-item">
                <span className="stat-item__number">45</span>
                <span className="stat-item__unit">{t('statUnit')}</span>
                <span className="stat-item__label">{t('statFarming')}</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-item__number">25</span>
                <span className="stat-item__unit">{t('statUnit')}</span>
                <span className="stat-item__label">{t('statManufacturing')}</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-item__number">11</span>
                <span className="stat-item__unit">{t('statUnit')}</span>
                <span className="stat-item__label">{t('statExporting')}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="section">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg bg-neutral-100">
                <div className="absolute inset-0 bg-neutral-100 animate-pulse" />
                <iframe
                  src="https://www.youtube.com/embed/rvwUCZmODrs"
                  title="Calendula Herbs — Our Heritage & Mission"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  loading="lazy"
                  className="absolute inset-0 w-full h-full"
                  style={{ border: 0 }}
                />
              </div>
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-display font-bold text-[var(--color-text-primary)]">{t('heritageTitle')}</h2>
                <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">{t('heritagePara1')}</p>
                <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">{t('heritagePara2')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="section timeline-watercolor">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-display font-bold text-[var(--color-text-primary)] mb-4">{t('journeyTitle')}</h2>
              <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">{t('journeySubtitle')}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="card-glass p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--color-green-100)] flex items-center justify-center mx-auto mb-5">
                  <Sprout className="w-8 h-8 text-[var(--color-green-600)]" />
                </div>
                <span className="text-3xl font-display font-bold text-[var(--color-calendula-500)]">{t('timeline1Year')}</span>
                <h3 className="text-xl font-display font-bold text-[var(--color-text-primary)] mt-3 mb-2">{t('timeline1Title')}</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">{t('timeline1Desc')}</p>
              </div>
              <div className="card-glass p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--color-green-100)] flex items-center justify-center mx-auto mb-5">
                  <Factory className="w-8 h-8 text-[var(--color-green-600)]" />
                </div>
                <span className="text-3xl font-display font-bold text-[var(--color-calendula-500)]">{t('timeline2Year')}</span>
                <h3 className="text-xl font-display font-bold text-[var(--color-text-primary)] mt-3 mb-2">{t('timeline2Title')}</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">{t('timeline2Desc')}</p>
              </div>
              <div className="card-glass p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--color-green-100)] flex items-center justify-center mx-auto mb-5">
                  <Globe className="w-8 h-8 text-[var(--color-green-600)]" />
                </div>
                <span className="text-3xl font-display font-bold text-[var(--color-calendula-500)]">{t('timeline3Year')}</span>
                <h3 className="text-xl font-display font-bold text-[var(--color-text-primary)] mt-3 mb-2">{t('timeline3Title')}</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">{t('timeline3Desc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Board & Team */}
        <section className="section">
          <div className="container">
            
            <div className="text-center mb-16">
              <h2 className="text-4xl font-display font-bold text-[var(--color-text-primary)] mb-4">{t('teamTitle')}</h2>
              <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">{t('teamSubtitle')}</p>
            </div>

            {board.length > 0 && (
              <div className="mb-20">
                <h3 className="text-2xl font-display font-bold text-[var(--color-text-primary)] mb-8 border-b border-[var(--color-border-subtle)] pb-4">{t('boardTitle')}</h3>
                <div className="flex flex-wrap justify-center gap-8">
                  {board.map(member => (
                    <div key={member.id} className="w-full max-w-[260px]">
                      <MemberCard member={member} small />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {team.length > 0 && (
              <div>
                <h3 className="text-2xl font-display font-bold text-[var(--color-text-primary)] mb-8 border-b border-[var(--color-border-subtle)] pb-4">{t('execTeamTitle')}</h3>
                <div className="flex flex-wrap justify-center gap-8">
                  {team.map(member => (
                    <div key={member.id} className="w-full max-w-[260px]">
                      <MemberCard member={member} small />
                    </div>
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
            <h2 className="text-4xl font-display font-bold text-[var(--color-text-primary)] mb-4">{t('ctaTitle')}</h2>
            <p className="text-lg text-[var(--color-text-secondary)] mb-8 leading-relaxed">{t('ctaDesc')}</p>
            <Link href="/contact" className="btn btn-primary btn-lg">{t('ctaButton')} <ArrowRight className="w-5 h-5" /></Link>
          </div>
        </section>

    </>
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
          <div className="flex flex-wrap gap-2 pt-4 border-t border-[var(--color-border-subtle)]">
            {member.contacts.map((c: { id: string; icon: string | null; type: string; value: string; label: string | null }) => {
              const Icon = getContactTypeIcon(c.icon || c.type)
              const { href, external } = generateTeamContactLink(c.type, c.value)
              return (
                <a
                  key={c.id}
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noreferrer' : undefined}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-bg-elevated)] hover:bg-[var(--color-green-50)] transition-colors"
                  title={c.label || c.type}
                >
                  <Icon className="w-5 h-5 text-[var(--color-green-600)]" />
                </a>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
