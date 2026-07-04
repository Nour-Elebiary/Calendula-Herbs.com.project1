'use client'

import React, { useState } from 'react'
import { useCart } from './CartProvider'
import { X, Trash2, Plus, Minus, Loader2, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import Link from 'next/link'

export function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, clearCart } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)

  React.useEffect(() => {
    if (!isCartOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsCartOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isCartOpen, setIsCartOpen])

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [country, setCountry] = useState('')
  const [notes, setNotes] = useState('')

  if (!isCartOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/public/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, phone, company, country, notes, items
        })
      })

      if (res.ok) {
        toast.success('Inquiry submitted successfully! We will contact you soon.')
        clearCart()
        setIsCartOpen(false)
        setStep(1)
        setName(''); setEmail(''); setPhone(''); setCompany(''); setCountry(''); setNotes('')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to submit inquiry')
      }
    } catch (err) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => setIsCartOpen(false)}
        aria-hidden="true"
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-[var(--color-bg-void)] shadow-2xl flex flex-col transform transition-transform duration-300 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-5 border-b border-[var(--color-border-default)] flex-shrink-0">
          <h2 className="font-display text-lg sm:text-xl font-bold text-[var(--color-text-primary)]">Quote Request</h2>
          <button
            onClick={() => setIsCartOpen(false)}
            className="btn-icon"
            aria-label="Close cart"
            title="Close cart"
            autoFocus
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 text-center">
            <div className="w-16 h-16 bg-[var(--color-bg-base)] rounded-full flex items-center justify-center mb-4" aria-hidden="true">
              <span className="text-3xl">📋</span>
            </div>
            <h3 className="font-display text-base sm:text-lg text-[var(--color-text-primary)] mb-2">Your quote cart is empty</h3>
            <p className="text-sm text-[var(--color-text-tertiary)] mb-6 leading-relaxed">Browse our catalog and add products you&apos;d like a bulk quote for.</p>
            <Link href="/products" onClick={() => setIsCartOpen(false)} className="btn btn-primary btn-sm">
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              {step === 1 ? (
                <div className="p-4 sm:p-6 space-y-3">
                  {items.map((item) => (
                    <div key={item.productId} className="card-glass flex flex-col gap-3 p-4 sm:p-5">
                      <div className="flex-1">
                        <h4 className="font-display text-sm sm:text-base text-[var(--color-text-primary)] line-clamp-2">{item.productName}</h4>
                        <p className="text-xs sm:text-sm text-[var(--color-text-tertiary)] mt-1">Minimum Order: 500kg</p>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <div className="flex items-center border-2 border-[var(--color-border-default)] rounded-lg overflow-hidden">
                          <button
                            className="p-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-base)] transition-colors"
                            onClick={() => updateQuantity(item.productId, item.quantity - 100)}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-4 text-center text-xs sm:text-sm font-medium text-[var(--color-text-primary)] min-w-max">{item.quantity}kg</span>
                          <button
                            className="p-2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-base)] transition-colors"
                            onClick={() => updateQuantity(item.productId, item.quantity + 100)}
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.productId)}
                          className="btn-icon text-red-500 hover:text-red-600 ml-auto flex-shrink-0"
                          aria-label="Remove item"
                          title="Remove from cart"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 sm:p-6">
                  <div className="card-glass p-4 sm:p-6">
                    <form id="inquiry-form" onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name *</Label>
                          <Input id="name" required value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company">Company</Label>
                          <Input id="company" value={company} onChange={e => setCompany(e.target.value)} placeholder="Herbs LLC" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@example.com" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 234..." />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Input id="country" value={country} onChange={e => setCountry(e.target.value)} placeholder="United States" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes (Optional)</Label>
                        <Textarea
                          id="notes"
                          rows={4}
                          value={notes}
                          onChange={e => setNotes(e.target.value)}
                          placeholder="Destination port, special requirements, forms..."
                        />
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-[var(--color-border-default)] bg-[var(--color-bg-base)] flex-shrink-0 space-y-3">
              {step === 1 ? (
                <button className="btn btn-primary w-full flex items-center justify-center gap-2" onClick={() => setStep(2)}>
                  Proceed to Details
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex gap-2 sm:gap-3">
                  <button type="button" className="btn btn-secondary flex-1" onClick={() => setStep(1)}>
                    Back
                  </button>
                  <button type="submit" form="inquiry-form" disabled={isSubmitting} className="btn btn-primary flex-1 flex items-center justify-center gap-2">
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}
