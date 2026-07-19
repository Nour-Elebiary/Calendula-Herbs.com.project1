'use client';

import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [mounted, setMounted] = useState(false);
  const th = useTranslations('header')

  useEffect(() => { setMounted(true); }, []); // eslint-disable-line react-hooks/set-state-in-effect

  if (!mounted) {
    return (
      <div className="w-9 h-9" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-9 h-9 rounded-full
                 transition-all duration-300 focus:outline-none focus-visible:ring-2
                 focus-visible:ring-[var(--color-calendula-400)]"
      style={{
        background: 'var(--color-glass-fill)',
        border: '1px solid var(--color-glass-border)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--color-bg-hover)';
        e.currentTarget.style.borderColor = 'var(--color-calendula-300)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--color-glass-fill)';
        e.currentTarget.style.borderColor = 'var(--color-glass-border)';
      }}
      aria-label={isDark ? th('themeDark') : th('themeLight')}
      aria-checked={isDark}
      role="switch"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? 'moon' : 'sun'}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          {isDark ? (
            <Moon className="w-[18px] h-[18px]" style={{ color: 'var(--color-calendula-300)' }} />
          ) : (
            <Sun className="w-[18px] h-[18px]" style={{ color: 'var(--color-amber-500)' }} />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
