'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Leaf, Loader2, KeyRound, Eye, EyeOff, AlertCircle } from 'lucide-react'
import Link from 'next/link'

const resetSchema = z.object({
  code: z.string().length(6, 'Code must be exactly 6 digits').regex(/^\d+$/, 'Code must contain only numbers'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type ResetForm = z.infer<typeof resetSchema>

function OtpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  })

  const passwordValue = watch('password', '')

  // Simple strength calc for UI
  const strength = [
    passwordValue.length >= 8,
    /[A-Z]/.test(passwordValue),
    /[a-z]/.test(passwordValue),
    /\d/.test(passwordValue),
    /[!@#$%^&*(),.?":{}|<>]/.test(passwordValue),
  ].filter(Boolean).length

  async function onSubmit(data: ResetForm) {
    if (!email) {
      setError('Missing email address. Please start the process again.')
      return
    }

    setError(null)
    try {
      const res = await fetch('/api/otp/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: email,
          code: data.code,
          newPassword: data.password,
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        setError(result.error || 'Something went wrong. Please try again.')
        return
      }

      setIsSuccess(true)
      setTimeout(() => {
        router.push('/admin/login')
      }, 3000)
    } catch {
      setError('An unexpected error occurred. Please try again.')
    }
  }

  if (!email) {
    return (
      <div className="text-center">
        <p className="text-red-600 text-sm mb-4">No email provided.</p>
        <Link href="/admin/forgot-password" className="text-[var(--color-calendula-600)] hover:underline">
          Go back to Forgot Password
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-calendula-500)]/15 border border-[var(--color-calendula-500)]/30 flex items-center justify-center mb-4">
          <KeyRound className="w-8 h-8 text-[var(--color-calendula-500)]" />
        </div>
        <h1
          className="text-2xl font-bold text-[var(--color-text-primary)] mb-1"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Enter Reset Code
        </h1>
        <p className="text-[var(--color-text-tertiary)] text-sm text-center">
          Code sent to <strong>{email}</strong>
        </p>
      </div>

      {error && (
        <div className="mb-6 flex gap-3 items-start p-4 rounded-xl bg-red-500/10 border border-red-400/30">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <p className="text-red-700 text-sm leading-relaxed">{error}</p>
        </div>
      )}

      {isSuccess ? (
        <div className="text-center p-6 rounded-xl bg-[var(--color-green-500)]/10 border border-[var(--color-green-500)]/30">
          <p className="text-[var(--color-green-800)] font-medium mb-2">Password reset successful!</p>
          <p className="text-[var(--color-green-600)] text-sm">Redirecting to login...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              6-Digit Code
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              disabled={isSubmitting}
              {...register('code')}
              className="w-full px-4 py-3 rounded-xl text-center text-2xl tracking-widest text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)]/30 transition-all duration-200 focus:outline-none disabled:opacity-50 bg-[var(--color-bg-base)] border border-[var(--color-border-default)] focus:border-[var(--color-calendula-500)]/50 focus:shadow-[0_0_0_3px_rgba(220,126,24,0.10)]"
            />
            {errors.code && (
              <p className="mt-1.5 text-xs text-center text-red-500">{errors.code.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                disabled={isSubmitting}
                {...register('password')}
                className="w-full px-4 py-3 pr-12 rounded-xl text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)]/50 text-sm transition-all duration-200 focus:outline-none disabled:opacity-50 bg-[var(--color-bg-base)] border border-[var(--color-border-default)] focus:border-[var(--color-calendula-500)]/50 focus:shadow-[0_0_0_3px_rgba(220,126,24,0.10)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>
            )}

            {/* Strength meter */}
            {passwordValue.length > 0 && (
              <div className="mt-3">
                <div className="flex gap-1 h-1.5 mb-1.5">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`flex-1 rounded-full transition-all duration-300 ${
                        strength >= level
                          ? strength < 3
                            ? 'bg-red-400'
                            : strength < 5
                              ? 'bg-yellow-400'
                              : 'bg-green-500'
                          : 'bg-black/[0.06]'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-[var(--color-text-tertiary)]">
                  Must contain 8+ chars, upper, lower, number, and special character.
                </p>
              </div>
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
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      )}

      <div className="mt-6 flex justify-center">
        <Link
          href="/admin/login"
          className="text-sm text-[var(--color-calendula-600)] hover:text-[var(--color-calendula-500)] transition-colors"
        >
          Cancel and return to login
        </Link>
      </div>
    </>
  )
}

export default function OtpPage() {
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
          <Suspense fallback={<div className="text-center text-[var(--color-text-tertiary)]">Loading...</div>}>
            <OtpForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
