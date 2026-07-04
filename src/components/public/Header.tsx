'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Menu, X, ShoppingCart } from 'lucide-react'
import { useCart } from './CartProvider'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'About Us', href: '/about' },
  { label: 'Certificates', href: '/certificates' },
  { label: 'Contact', href: '/contact' },
]

export function Header({ siteName = 'Calendula Herbs' }: { siteName?: string }) {
  const pathname = usePathname()
  const { items, setIsCartOpen } = useCart()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const prevPathname = useRef(pathname)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      setIsMobileMenuOpen(false)
      prevPathname.current = pathname
    }
  }, [pathname])

  const cartItemCount = items.length

  return (
    <header
      className={`nav-primary ${isScrolled ? 'is-scrolled' : ''}`}
    >
      <div className="container mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 z-50 nav-logo flex-shrink-0">
          <Image
            src="https://res.cloudinary.com/dcukpuftg/image/upload/v1782266932/calendula-herbs/brand/logo.png"
            alt="Calendula Herbs"
            width={111}
            height={60}
            className="object-contain"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 nav-links">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link text-sm font-normal tracking-wide no-underline relative py-2 transition-colors duration-[120ms] ${
                  isActive ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-green-600)] rounded-[1px]" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4">
          <button
            onClick={() => setIsCartOpen(true)}
            className="btn-icon relative"
            aria-label="Quote cart"
            title="Open quote cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartItemCount > 0 && (
              <span className="cart-badge">
                {cartItemCount}
              </span>
            )}
          </button>
          <Link
            href="/contact"
            className="btn btn-primary text-sm"
          >
            Get a Quote
          </Link>
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-2 md:hidden z-50">
          <button
            onClick={() => setIsCartOpen(true)}
            className="btn-icon relative"
            aria-label="Quote cart"
            title="Open quote cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartItemCount > 0 && (
              <span className="cart-badge">
                {cartItemCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="btn-icon"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            title={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-[var(--color-text-primary)]" /> : <Menu className="w-5 h-5 text-[var(--color-text-primary)]" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            id="mobile-menu"
            className="fixed inset-0 z-40 md:hidden"
            style={{
              background: 'var(--color-bg-void)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)'
            }}
          >
            <div className="flex flex-col h-full pt-20 pb-8 px-6 mt-16">
              <nav className="flex flex-col gap-6 mb-auto">
                {NAV_LINKS.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
                  >
                    <Link
                      href={link.href}
                      className={`font-display text-[clamp(1.25rem,5vw,1.875rem)] font-medium tracking-tight no-underline transition-colors duration-[120ms] ${
                        pathname === link.href ? 'text-[var(--color-green-600)]' : 'text-[var(--color-text-secondary)]'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="pt-8 border-t border-[var(--color-border-subtle)]"
              >
                <Link
                  href="/contact"
                  className="btn btn-primary btn-lg w-full justify-center text-base"
                >
                  Get a Quote
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
