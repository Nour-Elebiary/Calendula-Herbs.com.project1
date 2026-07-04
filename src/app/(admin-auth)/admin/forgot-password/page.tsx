'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Leaf, Loader2, ArrowRight, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  async function onSubmit(data: ForgotPasswordForm) {
    setError(null)
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: data.email, type: 'EMAIL_RESET' }),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error || 'Something went wrong. Please try again.')
        return
      }

      setIsSuccess(true)
    } catch {
      setError('An unexpected error occurred. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[var(--color-calendula-500)]/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-[var(--color-green-500)]/8 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--color-border-default)',
          }}
          className="rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-calendula-500)]/15 border border-[var(--color-calendula-500)]/30 flex items-center justify-center mb-4">
              <Leaf className="w-8 h-8 text-[var(--color-calendula-500)]" />
            </div>
            <h1
              className="text-2xl font-bold text-[var(--color-text-primary)] mb-1"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Reset Password
            </h1>
            <p className="text-[var(--color-text-tertiary)] text-sm text-center">
              Enter your email address and we&apos;ll send you a verification code to reset your password.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-400/30 text-red-700 text-sm">
              {error}
            </div>
          )}

          {isSuccess ? (
            <div className="space-y-6 text-center">
              <div className="p-4 rounded-xl bg-[var(--color-green-500)]/10 border border-[var(--color-green-500)]/30 text-[var(--color-green-800)] text-sm">
                A verification code has been sent to <strong>{getValues('email')}</strong>. Please check your inbox (and spam folder).
              </div>
              <button
                onClick={() => router.push(`/admin/otp?email=${encodeURIComponent(getValues('email'))}`)}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-white text-sm transition-all duration-200"
                style={{
                  background: 'linear-gradient(135deg, var(--color-green-500), var(--color-green-700))',
                  boxShadow: '0 4px 20px rgba(94,158,102,0.4)',
                }}
              >
                Enter Verification Code
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@example.com"
                  disabled={isSubmitting}
                  {...register('email')}
                  className="w-full px-4 py-3 rounded-xl text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)]/50 text-sm transition-all duration-200 focus:outline-none disabled:opacity-50 bg-[var(--color-bg-base)] border border-[var(--color-border-default)] focus:border-[var(--color-calendula-500)]/50 focus:shadow-[0_0_0_3px_rgba(220,126,24,0.10)]"
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-white text-sm transition-all duration-200 disabled:opacity-60"
                style={{
                  background: 'linear-gradient(135deg, var(--color-green-500), var(--color-green-700))',
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </button>
            </form>
          )}

          <div className="mt-6 flex justify-center">
            <Link
              href="/admin/login"
              className="flex items-center gap-2 text-sm text-[var(--color-calendula-600)] hover:text-[var(--color-calendula-500)] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
