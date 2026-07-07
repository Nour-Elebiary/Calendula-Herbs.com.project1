'use client'

type Props = {
  address: string
  mapLat?: number | null
  mapLng?: number | null
}

export function MapEmbed({ address, mapLat, mapLng }: Props) {
  const src = mapLat && mapLng
    ? `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4000!2d${mapLng}!3d${mapLat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z!5e0!3m2!1sen!2seg!4v1`
    : `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`

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
