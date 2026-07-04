'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Send, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

const schema = z.object({
  productName: z.string().min(2, 'Product name is required').max(300),
  productDescription: z.string().max(2000).optional(),
  quantity: z.string().max(100).optional(),
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Invalid email').max(200),
  phone: z.string().max(50).optional(),
  company: z.string().max(200).optional(),
  country: z.string().max(100).optional(),
  usage: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
})

type FormData = z.infer<typeof schema>

export function ProductRequestForm() {
  const [submitted, setSubmitted] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const [honeypot, setHoneypot] = useState('')

  const onSubmit = async (data: FormData) => {
    if (honeypot) return
    try {
      const res = await fetch('/api/public/product-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setSubmitted(true)
        toast.success('Product request submitted!')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to submit')
      }
    } catch {
      toast.error('Network error. Please try again.')
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-green-600)' }} />
        <h3 className="font-display text-2xl font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
          Request Submitted!
        </h3>
        <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
          Thank you! Our team will review your product request and get back to you within 24 hours.
        </p>
        <Button variant="outline" onClick={() => { reset(); setSubmitted(false) }}>
          Submit Another Request
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="absolute opacity-0 pointer-events-none" aria-hidden="true">
        <input tabIndex={-1} autoComplete="off" name="website" value={honeypot} onChange={e => setHoneypot(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pr-product-name">Product Name *</Label>
        <Input id="pr-product-name" placeholder="e.g. Organic Chamomile Flowers" {...register('productName')} />
        {errors.productName && <p className="text-sm" style={{ color: 'var(--color-error)' }}>{errors.productName.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pr-description">Product Description</Label>
        <Textarea id="pr-description" rows={3} placeholder="Describe the product you're looking for — specifications, grade, origin preferences, etc." {...register('productDescription')} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="pr-qty">Desired Quantity</Label>
          <Input id="pr-qty" placeholder="e.g. 1000 kg" {...register('quantity')} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pr-usage">Intended Use</Label>
          <Input id="pr-usage" placeholder="e.g. tea blending, extraction" {...register('usage')} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="pr-name">Your Name *</Label>
          <Input id="pr-name" {...register('name')} />
          {errors.name && <p className="text-sm" style={{ color: 'var(--color-error)' }}>{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pr-email">Email *</Label>
          <Input id="pr-email" type="email" {...register('email')} />
          {errors.email && <p className="text-sm" style={{ color: 'var(--color-error)' }}>{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="pr-phone">Phone</Label>
          <Input id="pr-phone" type="tel" {...register('phone')} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pr-company">Company</Label>
          <Input id="pr-company" {...register('company')} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pr-country">Country</Label>
        <Input id="pr-country" placeholder="Country of import" {...register('country')} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pr-notes">Additional Notes</Label>
        <Textarea id="pr-notes" rows={3} placeholder="Any other requirements, certifications needed, or timeline preferences..." {...register('notes')} />
      </div>

      <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-lg w-full">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Submit Product Request
      </button>
    </form>
  )
}
