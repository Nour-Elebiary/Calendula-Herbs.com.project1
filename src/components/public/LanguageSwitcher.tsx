'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Check, Globe } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useState } from 'react';

const FLAG_LABELS: Record<string, string> = {
  en: 'EN', ar: 'AR', es: 'ES', it: 'IT',
  ja: 'JA', ko: 'KO', hi: 'HI', ru: 'RU',
  uk: 'UA', 'pt-BR': 'BR', 'zh-CN': 'CN', fr: 'FR',
  nl: 'NL', de: 'DE', bg: 'BG', el: 'GR', tr: 'TR',
};

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English', ar: '\u0627\u0644\u0639\u0631\u0628\u064A\u0629', es: 'Espa\u00F1ol', it: 'Italiano',
  ja: '\u65E5\u672C\u8A9E', ko: '\uD55C\uAD6D\uC5B4', hi: '\u0939\u093F\u0928\u094D\u0926\u0940', ru: '\u0420\u0443\u0441\u0441\u043A\u0438\u0439',
  uk: '\u0423\u043A\u0440\u0430\u0457\u043D\u0441\u044C\u043A\u0430', 'pt-BR': 'Portugu\u00EAs', 'zh-CN': '\u7B80\u4F53\u4E2D\u6587',
  fr: 'Fran\u00E7ais', nl: 'Nederlands', de: 'Deutsch',
  bg: '\u0411\u044A\u043B\u0433\u0430\u0440\u0441\u043A\u0438', el: '\u0395\u03BB\u03BB\u03B7\u03BD\u03B9\u03BA\u03AC', tr: 'T\u00FCrk\u00E7e',
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const th = useTranslations('header');
  const [open, setOpen] = useState(false);

  const switchLocale = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`; // eslint-disable-line react-hooks/immutability
    window.location.reload();
    setOpen(false);
  };

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <button
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
                     transition-all duration-200 text-sm"
          style={{
            background: 'var(--color-glass-fill)',
            border: '1px solid var(--color-glass-border)',
            color: 'var(--color-text-secondary)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-bg-hover)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-glass-fill)'; }}
          aria-label={th('languageLabel')}
        >
          <Globe className="w-4 h-4" />
          <span className="inline-flex items-center justify-center w-6 h-5 rounded text-[10px] font-bold leading-none tracking-wider"
            style={{
              background: 'var(--color-bg-surface)',
              color: 'var(--color-text-secondary)',
            }}
          >
            {FLAG_LABELS[locale] || locale.toUpperCase()}
          </span>
          <span>{LANGUAGE_NAMES[locale]}</span>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[200px] max-h-[300px] overflow-y-auto
                     rounded-xl p-1.5"
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-glass-border)',
            boxShadow: 'var(--shadow-lg)',
            backdropFilter: 'blur(12px)',
          }}
          sideOffset={8}
          align="end"
        >
          {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
            <DropdownMenu.Item
              key={code}
              onSelect={() => switchLocale(code)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg
                         cursor-pointer text-sm transition-colors duration-150
                         focus:outline-none"
              style={{
                color: 'var(--color-text-primary)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-bg-hover)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <span className="inline-flex items-center justify-center w-6 h-5 rounded text-[10px] font-bold leading-none tracking-wider shrink-0"
                style={{
                  background: 'var(--color-bg-surface)',
                  color: 'var(--color-text-tertiary)',
                }}
              >
                {FLAG_LABELS[code] || code.split('-')[0].toUpperCase()}
              </span>
              <span className="flex-1">{name}</span>
              {code === locale && (
                <Check className="w-4 h-4" style={{ color: 'var(--color-calendula-500)' }} />
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
