'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Send, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

const schema = z.object({
  productName: z.string().min(1, 'Please select a product').max(200),
  quantity: z.string().max(100).optional(),
  name: z.string().min(2, 'Name is required').max(100),
  email: z.string().email('Invalid email').max(200),
  company: z.string().max(200).optional(),
  address: z.string().max(500).optional(),
  shippingBy: z.enum(['buyer', 'calendula']),
  notes: z.string().max(1000).optional(),
})

type FormData = z.infer<typeof schema>

type Props = {
  products: { id: string; name: string }[]
}

export function SampleRequestForm({ products }: Props) {
  const [submitted, setSubmitted] = useState(false)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { shippingBy: 'buyer' },
  })

  const shippingBy = watch('shippingBy')

  const [honeypot, setHoneypot] = useState('')

  const onSubmit = async (data: FormData) => {
    if (honeypot) return // honeypot filled = bot
    try {
      const res = await fetch('/api/public/sample', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setSubmitted(true)
        toast.success('Sample request submitted!')
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
          We&apos;ll review your request and get back to you within 24 hours.
        </p>
        <Button variant="outline" onClick={() => { reset(); setSubmitted(false) }}>
          Submit Another Request
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Honeypot */}
      <div className="absolute opacity-0 pointer-events-none" aria-hidden="true">
        <input tabIndex={-1} autoComplete="off" name="website" value={honeypot} onChange={e => setHoneypot(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sample-product">Product *</Label>
        <Select aria-label="Product" onValueChange={v => setValue('productName', v)}>
          <SelectTrigger id="sample-product"><SelectValue placeholder="Select a product..." /></SelectTrigger>
          <SelectContent>
            {products.map(p => (
              <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.productName && <p className="text-sm" style={{ color: 'var(--color-error)' }}>{errors.productName.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sample-qty">Desired Quantity</Label>
        <Input id="sample-qty" placeholder="e.g. 100g" {...register('quantity')} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="sample-name">Your Name *</Label>
          <Input id="sample-name" {...register('name')} />
          {errors.name && <p className="text-sm" style={{ color: 'var(--color-error)' }}>{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sample-email">Email *</Label>
          <Input id="sample-email" type="email" {...register('email')} />
          {errors.email && <p className="text-sm" style={{ color: 'var(--color-error)' }}>{errors.email.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sample-company">Company</Label>
        <Input id="sample-company" {...register('company')} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sample-address">Shipping Address</Label>
        <Textarea id="sample-address" rows={2} {...register('address')} />
      </div>

      <div className="space-y-1.5">
        <Label>Shipping Cost *</Label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" {...register('shippingBy')} value="buyer" checked={shippingBy === 'buyer'} onChange={() => setValue('shippingBy', 'buyer')} style={{ accentColor: 'var(--color-green-600)' }} />
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>I will cover shipping</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" {...register('shippingBy')} value="calendula" checked={shippingBy === 'calendula'} onChange={() => setValue('shippingBy', 'calendula')} style={{ accentColor: 'var(--color-green-600)' }} />
            <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Calendula covers (qualified buyers)</span>
          </label>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sample-notes">Additional Notes</Label>
        <Textarea id="sample-notes" rows={3} {...register('notes')} />
      </div>

      <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-lg w-full">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Submit Sample Request
      </button>
    </form>
  )
}
