import React from 'react'

type BotanicalDividerProps = {
  className?: string
}

export function BotanicalDivider({ className = '' }: BotanicalDividerProps) {
  return (
    <div className={`flex items-center justify-center gap-3 py-6 ${className}`}>
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold/40" />
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gold/60">
        <path d="M12 2C12 2 8 6 8 10C8 13.3 10.7 16 12 16C13.3 16 16 13.3 16 10C16 6 12 2 12 2Z" fill="currentColor" opacity="0.6" />
        <path d="M12 14C12 14 9 17 9 20C9 22.2 10.8 24 12 24C13.2 24 15 22.2 15 20C15 17 12 14 12 14Z" fill="currentColor" opacity="0.4" />
      </svg>
      <span className="h-px w-12 bg-gradient-to-r from-gold/40 to-transparent" />
    </div>
  )
}
