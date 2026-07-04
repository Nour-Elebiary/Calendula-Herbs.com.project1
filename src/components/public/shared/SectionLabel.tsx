import React from 'react'

type SectionLabelProps = {
  children: React.ReactNode
  className?: string
}

export function SectionLabel({ children, className = '' }: SectionLabelProps) {
  return (
    <span className={`inline-block text-gold text-xs font-bold uppercase tracking-[0.2em] mb-4 ${className}`}>
      ✦ {children} ✦
    </span>
  )
}
