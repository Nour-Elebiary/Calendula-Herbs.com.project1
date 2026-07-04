'use client'

type Props = {
  address: string
}

export function MapEmbed({ address }: Props) {
  const query = encodeURIComponent(address)
  const src = `https://www.google.com/maps?q=${query}&output=embed`

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden" style={{ border: '1px solid var(--color-border-subtle)' }}>
      <iframe
        src={src}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Calendula Herbs location on Google Maps"
      />
    </div>
  )
}
