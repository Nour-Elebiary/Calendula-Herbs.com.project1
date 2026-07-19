'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useCart } from './CartProvider'
import { ShoppingCart, Package } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type Props = {
  productId: string
  productName: string
  minOrderKg: number
}

export function ProductActions({ productId, productName, minOrderKg }: Props) {
  const t = useTranslations('productActions')
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(minOrderKg)
  const [sampleOpen, setSampleOpen] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sName, setSName] = useState('')
  const [sEmail, setSEmail] = useState('')
  const [sCompany, setSCompany] = useState('')
  const [sAddress, setSAddress] = useState('')
  const [sShipping] = useState<'buyer' | 'calendula'>('buyer')
  const [sNotes, setSNotes] = useState('')

  const handleAddToCart = () => {
    addItem({ productId, productName, quantity, minOrderKg })
    toast.success(t('cartSuccess', { name: productName }))
  }

  const submitSample = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/public/sample', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          quantity: 'Standard Sample',
          name: sName,
          email: sEmail,
          company: sCompany,
          address: sAddress,
          shippingBy: sShipping,
          notes: sNotes
        })
      })
      if (res.ok) {
        toast.success(t('sampleSuccess'))
        setSampleOpen(false)
      } else {
        toast.error(t('submitError'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="card-glass p-6 space-y-6">
        <div>
          <Label className="text-[var(--color-text-tertiary)] mb-2 block">{t('bulkInquiryLabel')}</Label>
          <div className="flex items-center">
            <Input
              type="number"
              min={minOrderKg}
              step={100}
              value={quantity}
              onChange={e => setQuantity(Math.max(minOrderKg, parseInt(e.target.value) || minOrderKg))}
              className="input text-lg h-12 w-32 rounded-r-none border-r-0 focus-visible:ring-0"
            />
            <div className="input h-12 px-4 flex items-center text-[var(--color-text-tertiary)] rounded-l-none border-l-0 w-auto shrink-0">
              {t('kgSuffix')}
            </div>
          </div>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-2">{t('moq', { weight: minOrderKg })}</p>
        </div>

        <div className="flex flex-col gap-3">
          <button onClick={handleAddToCart} className="btn btn-primary btn-lg w-full">
            <ShoppingCart className="w-5 h-5 mr-2" /> {t('addToCart')}
          </button>
          <button onClick={() => setSampleOpen(true)} className="btn btn-secondary btn-lg w-full">
            <Package className="w-5 h-5 mr-2" /> {t('requestSample')}
          </button>
        </div>
      </div>

      <Dialog open={sampleOpen} onOpenChange={setSampleOpen}>
        <DialogContent className="sm:max-w-[500px] card-glass">
          <DialogHeader>
            <DialogTitle className="font-display text-[var(--color-text-primary)]">{t('dialogTitle', { name: productName })}</DialogTitle>
            <DialogDescription className="text-[var(--color-text-secondary)]">{t('dialogDesc')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitSample} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sample-name" className="text-[var(--color-text-tertiary)]">{t('contactName')}</Label>
                <Input id="sample-name" required value={sName} onChange={e => setSName(e.target.value)} className="input" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sample-email" className="text-[var(--color-text-tertiary)]">{t('email')}</Label>
                <Input id="sample-email" type="email" required value={sEmail} onChange={e => setSEmail(e.target.value)} className="input" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sample-company" className="text-[var(--color-text-tertiary)]">{t('company')}</Label>
              <Input id="sample-company" value={sCompany} onChange={e => setSCompany(e.target.value)} className="input" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sample-address" className="text-[var(--color-text-tertiary)]">{t('shippingAddress')}</Label>
              <Textarea id="sample-address" required value={sAddress} onChange={e => setSAddress(e.target.value)} rows={3} className="input resize-none" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sample-notes" className="text-[var(--color-text-tertiary)]">{t('shippingAccount')}</Label>
              <Textarea id="sample-notes" value={sNotes} onChange={e => setSNotes(e.target.value)} placeholder={t('shippingPlaceholder')} rows={2} className="input resize-none" />
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setSampleOpen(false)} className="btn btn-secondary">{t('cancel')}</button>
              <button type="submit" disabled={isSubmitting} className="btn btn-primary disabled:opacity-50 disabled:pointer-events-none">
                {isSubmitting ? t('submitting') : t('requestSampleButton')}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
