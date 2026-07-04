'use client'

import React, { useState } from 'react'
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
    addItem({ productId, productName, quantity })
    toast.success(`${productName} added to quote cart`)
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
        toast.success('Sample request submitted')
        setSampleOpen(false)
      } else {
        toast.error('Failed to submit request')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="card-glass p-6 space-y-6">
        <div>
          <Label className="text-[var(--color-text-tertiary)] mb-2 block">Bulk Inquiry Quantity (kg)</Label>
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
              kg
            </div>
          </div>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-2">Minimum order quantity: {minOrderKg} kg</p>
        </div>

        <div className="flex flex-col gap-3">
          <button onClick={handleAddToCart} className="btn btn-primary btn-lg w-full">
            <ShoppingCart className="w-5 h-5 mr-2" /> Add to Quote Cart
          </button>
          <button onClick={() => setSampleOpen(true)} className="btn btn-secondary btn-lg w-full">
            <Package className="w-5 h-5 mr-2" /> Request a Sample
          </button>
        </div>
      </div>

      <Dialog open={sampleOpen} onOpenChange={setSampleOpen}>
        <DialogContent className="sm:max-w-[500px] card-glass">
          <DialogHeader>
            <DialogTitle className="font-display text-[var(--color-text-primary)]">Request Sample: {productName}</DialogTitle>
            <DialogDescription className="text-[var(--color-text-secondary)]">
              We provide product samples for quality evaluation. Please note that shipping costs are typically covered by the buyer.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitSample} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="sample-name" className="text-[var(--color-text-tertiary)]">Contact Name *</Label>
                <Input id="sample-name" required value={sName} onChange={e => setSName(e.target.value)} className="input" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sample-email" className="text-[var(--color-text-tertiary)]">Email *</Label>
                <Input id="sample-email" type="email" required value={sEmail} onChange={e => setSEmail(e.target.value)} className="input" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sample-company" className="text-[var(--color-text-tertiary)]">Company</Label>
              <Input id="sample-company" value={sCompany} onChange={e => setSCompany(e.target.value)} className="input" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sample-address" className="text-[var(--color-text-tertiary)]">Shipping Address *</Label>
              <Textarea id="sample-address" required value={sAddress} onChange={e => setSAddress(e.target.value)} rows={3} className="input resize-none" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sample-notes" className="text-[var(--color-text-tertiary)]">Shipping Account (DHL/FedEx) or Notes</Label>
              <Textarea id="sample-notes" value={sNotes} onChange={e => setSNotes(e.target.value)} placeholder="Provide your courier account number if you want to cover shipping..." rows={2} className="input resize-none" />
            </div>
            <div className="pt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setSampleOpen(false)} className="btn btn-secondary">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="btn btn-primary disabled:opacity-50 disabled:pointer-events-none">
                {isSubmitting ? 'Submitting...' : 'Request Sample'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
