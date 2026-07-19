'use client'

import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Send, AlertCircle, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface ValidationErrors {
  name?: string
  email?: string
  message?: string
}

export function ContactForm() {
  const t = useTranslations('contact')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [company, setCompany] = useState('')
  const [country, setCountry] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [success, setSuccess] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}
    
    if (!name.trim()) {
      newErrors.name = t('validationRequired', { field: t('nameLabel') })
    }
    
    if (!email.trim()) {
      newErrors.email = t('validationRequired', { field: t('emailLabel2') })
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t('validationEmail')
    }
    
    if (!message.trim()) {
      newErrors.message = t('validationRequired', { field: t('messageLabel') })
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (honeypot) return
    
    if (!validateForm()) {
      toast.error(t('validationFix'))
      return
    }

    setIsSubmitting(true)
    setSuccess(false)

    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, company, country, subject, message })
      })

      if (res.ok) {
        setSuccess(true)
        toast.success(t('successMessage'))
        setName(''); setEmail(''); setPhone(''); setCompany(''); setCountry(''); setSubject(''); setMessage('')
        setErrors({})
        setTimeout(() => setSuccess(false), 4000)
      } else {
        toast.error(t('errorMessage'))
      }
    } catch {
      toast.error(t('errorUnexpected'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="card-glass p-6 sm:p-8">
      {success && (
        <div className="mb-6 p-4 rounded-lg flex items-start gap-3 border border-[var(--color-green-200)]" style={{ background: 'var(--color-bg-hover)' }}>
          <CheckCircle className="w-5 h-5 text-[var(--color-success)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-[var(--color-green-700)]">{t('successTitle')}</p>
            <p className="text-sm text-[var(--color-green-600)]">{t('successMessage')}</p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" required>{t('nameLabel')}</Label>
            <Input 
              id="name" 
              required 
              value={name} 
              onChange={e => { setName(e.target.value); if (errors.name) setErrors(prev => ({ ...prev, name: undefined })) }} 
              placeholder={t('namePlaceholder')}
              error={!!errors.name}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && (
              <p id="name-error" className="flex items-center gap-1 text-xs text-[var(--color-error)]">
                <AlertCircle className="w-3 h-3" /> {errors.name}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" required>{t('emailLabel2')}</Label>
            <Input 
              id="email" 
              type="email" 
              required 
              value={email} 
              onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(prev => ({ ...prev, email: undefined })) }} 
              placeholder={t('emailPlaceholder')}
              error={!!errors.email}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="flex items-center gap-1 text-xs text-[var(--color-error)]">
                <AlertCircle className="w-3 h-3" /> {errors.email}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <Label htmlFor="phone">{t('phoneLabel2')}</Label>
            <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder={t('phonePlaceholder')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">{t('countryLabel')}</Label>
            <Input id="country" value={country} onChange={e => setCountry(e.target.value)} placeholder={t('countryPlaceholder')} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-2">
            <Label htmlFor="company">{t('companyLabel')}</Label>
            <Input id="company" value={company} onChange={e => setCompany(e.target.value)} placeholder={t('companyPlaceholder')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">{t('subjectLabel')}</Label>
            <Input id="subject" value={subject} onChange={e => setSubject(e.target.value)} placeholder={t('subjectPlaceholder')} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message" required>{t('messageLabel')}</Label>
          <Textarea
            id="message"
            required
            rows={6}
            value={message}
            onChange={e => { setMessage(e.target.value); if (errors.message) setErrors(prev => ({ ...prev, message: undefined })) }}
            placeholder={t('messagePlaceholder')}
            error={!!errors.message}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? 'message-error' : undefined}
          />
          {errors.message && (
            <p id="message-error" className="flex items-center gap-1 text-xs text-[var(--color-error)]">
              <AlertCircle className="w-3 h-3" /> {errors.message}
            </p>
          )}
        </div>

        <div aria-hidden="true" className="absolute -left-[9999px] opacity-0 pointer-events-none">
          <label htmlFor="hp-field">Leave this empty</label>
          <input id="hp-field" name="hp-field" tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} />
        </div>
        <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-lg w-full sm:w-auto flex items-center justify-center gap-2">
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          {isSubmitting ? t('sendingButton') : t('sendButton')}
        </button>
      </form>
    </div>
  )
}
