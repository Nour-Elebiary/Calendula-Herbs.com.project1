export type ContactMethod = {
  type: ContactMethodType
  value: string
  linkMode: 'auto' | 'manual'
  manualLink?: string | null
  icon?: string | null
}

export type ContactMethodType =
  | 'whatsapp'
  | 'telegram'
  | 'viber'
  | 'skype'
  | 'wechat'
  | 'signal'
  | 'messenger'
  | 'line'
  | 'discord'
  | 'other'

export const CONTACT_METHOD_META: Record<ContactMethodType, { label: string; usesPhone: boolean; icon: string }> = {
  whatsapp:  { label: 'WhatsApp',  usesPhone: true,  icon: 'MessageCircle' },
  telegram:  { label: 'Telegram',  usesPhone: false, icon: 'Send' },
  viber:     { label: 'Viber',     usesPhone: true,  icon: 'Phone' },
  skype:     { label: 'Skype',     usesPhone: false, icon: 'Video' },
  wechat:    { label: 'WeChat',    usesPhone: false, icon: 'MessageSquare' },
  signal:    { label: 'Signal',    usesPhone: true,  icon: 'Phone' },
  messenger: { label: 'Messenger', usesPhone: false, icon: 'MessageCircle' },
  line:      { label: 'LINE',      usesPhone: false, icon: 'MessageSquare' },
  discord:   { label: 'Discord',   usesPhone: false, icon: 'Headphones' },
  other:     { label: 'Other',     usesPhone: false, icon: 'Link' },
}

export function generateContactLink(method: ContactMethod): string {
  if (method.linkMode === 'manual' && method.manualLink) {
    return method.manualLink
  }

  switch (method.type) {
    case 'whatsapp':
      return `https://wa.me/${method.value.replace(/[^\d]/g, '')}`
    case 'telegram': {
      const v = method.value.replace('@', '')
      return v.startsWith('+') ? `https://t.me/${encodeURIComponent(v)}` : `https://t.me/${v}`
    }
    case 'viber':
      return `viber://chat?number=${encodeURIComponent(method.value)}`
    case 'skype':
      return `skype:${encodeURIComponent(method.value)}?chat`
    case 'signal':
      return `https://signal.me/#p/${encodeURIComponent(method.value)}`
    case 'messenger':
      return `https://m.me/${method.value.replace('@', '')}`
    case 'line':
      return `https://line.me/R/ti/p/~${encodeURIComponent(method.value)}`
    case 'wechat':
    case 'discord':
    case 'other':
    default:
      return method.value
  }
}

export function generateTeamContactLink(type: string, value: string): { href: string; external: boolean } {
  switch (type) {
    case 'EMAIL':
      return { href: `mailto:${value}`, external: false }
    case 'PHONE':
      return { href: `tel:${value.replace(/[^\d+]/g, '')}`, external: false }
    case 'WHATSAPP':
      return { href: `https://wa.me/${value.replace(/[^\d]/g, '')}`, external: true }
    case 'TELEGRAM': {
      const v = value.replace('@', '')
      return { href: `https://t.me/${encodeURIComponent(v)}`, external: true }
    }
    case 'VIBER':
      return { href: `viber://chat?number=${encodeURIComponent(value)}`, external: true }
    case 'SIGNAL':
      return { href: `https://signal.me/#p/${encodeURIComponent(value)}`, external: true }
    case 'MESSENGER':
      return { href: `https://m.me/${value.replace('@', '')}`, external: true }
    case 'LINE':
      return { href: `https://line.me/R/ti/p/~${encodeURIComponent(value)}`, external: true }
    case 'WECHAT':
    case 'DISCORD':
      return { href: '#', external: false }
    case 'LINKEDIN':
    case 'TWITTER':
    case 'FACEBOOK':
    case 'INSTAGRAM':
    case 'YOUTUBE':
    case 'TIKTOK':
    case 'SNAPCHAT':
    case 'WEBSITE':
    case 'OTHER':
    default:
      return { href: value, external: true }
  }
}

export function getDisplayValue(method: ContactMethod): string {
  return method.value
}

export function isClickableLink(method: ContactMethod): boolean {
  if (method.linkMode === 'manual') return !!method.manualLink
  return method.type !== 'wechat' && method.type !== 'other'
}
