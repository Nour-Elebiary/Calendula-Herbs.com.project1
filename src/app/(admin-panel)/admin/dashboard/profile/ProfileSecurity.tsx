'use client'

import React, { useState } from 'react'
import { KeyRound, Mail, Plus, X, Loader2, Eye, EyeOff, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

type Props = {
  initialRecoveryEmails: string[]
}

export function ProfileSecurity({ initialRecoveryEmails }: Props) {
  const [recoveryEmails, setRecoveryEmails] = useState<string[]>(initialRecoveryEmails)
  const [newRecoveryEmail, setNewRecoveryEmail] = useState('')
  const [recoverySaving, setRecoverySaving] = useState(false)

  const [showPwForm, setShowPwForm] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState<string | null>(null)

  const addRecoveryEmail = () => {
    if (!newRecoveryEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newRecoveryEmail.trim())) {
      toast.error('Please enter a valid email address')
      return
    }
    if (recoveryEmails.includes(newRecoveryEmail.trim())) {
      toast.error('This email is already in your recovery list')
      return
    }
    setRecoveryEmails(prev => [...prev, newRecoveryEmail.trim()])
    setNewRecoveryEmail('')
  }

  const removeRecoveryEmail = (email: string) => {
    setRecoveryEmails(prev => prev.filter(e => e !== email))
  }

  const saveRecoveryEmails = async () => {
    if (recoveryEmails.length === 0) {
      toast.error('At least one recovery email is required')
      return
    }
    setRecoverySaving(true)
    try {
      const res = await fetch('/api/admin/profile/recovery-emails', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recoveryEmails }),
      })
      if (res.ok) {
        toast.success('Recovery emails updated')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update')
      }
    } finally {
      setRecoverySaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError(null)
    if (newPassword.length < 8) {
      setPwError('Password must be at least 8 characters')
      return
    }
    setPwSaving(true)
    try {
      const res = await fetch('/api/admin/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      if (res.ok) {
        toast.success('Password changed successfully')
        setShowPwForm(false)
        setCurrentPassword('')
        setNewPassword('')
      } else {
        const data = await res.json()
        setPwError(data.error || 'Failed to change password')
      }
    } finally {
      setPwSaving(false)
    }
  }

  const strength = [
    newPassword.length >= 8,
    /[A-Z]/.test(newPassword),
    /[a-z]/.test(newPassword),
    /\d/.test(newPassword),
    /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
  ].filter(Boolean).length

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Security / Change Password */}
      <div className="bg-white border border-[var(--color-border-subtle)] rounded-xl p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[var(--color-green-500)]/15 flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-[var(--color-green-600)]" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Security</h2>
        </div>

        {!showPwForm ? (
          <>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">
              Your account is protected by strict rate limiting, lockout policies, and session validation.
            </p>
            <div className="mt-auto">
              <button
                onClick={() => setShowPwForm(true)}
                className="px-4 py-2 rounded-lg bg-[var(--color-bg-base)] hover:bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] text-sm font-medium text-[var(--color-text-primary)] transition-colors"
              >
                Change Password
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4">
            {pwError && (
              <div className="flex gap-2 items-start p-3 rounded-lg bg-red-500/10 border border-red-400/30 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{pwError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="current-pw">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-pw"
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-pw">New Password</Label>
              <div className="relative">
                <Input
                  id="new-pw"
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="pr-10"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {newPassword.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 h-1.5 mb-1">
                    {[1, 2, 3, 4, 5].map(level => (
                      <div
                        key={level}
                        className={`flex-1 rounded-full transition-all ${
                          strength >= level
                            ? strength < 3 ? 'bg-red-400' : strength < 5 ? 'bg-yellow-400' : 'bg-green-500'
                            : 'bg-black/[0.06]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={pwSaving}>
                {pwSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                Change Password
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowPwForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Recovery Emails */}
      <div className="bg-white border border-[var(--color-border-subtle)] rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[var(--color-green-500)]/15 flex items-center justify-center">
            <Mail className="w-5 h-5 text-[var(--color-green-600)]" />
          </div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Recovery Emails</h2>
        </div>

        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          These email addresses can be used to reset your password via the forgot-password flow.
        </p>

        <div className="space-y-3 mb-4">
          {recoveryEmails.map((email, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-black/[0.02] border border-[var(--color-border-subtle)]">
              <span className="text-sm text-[var(--color-text-primary)]">{email}</span>
              <button
                onClick={() => removeRecoveryEmail(email)}
                className="text-red-500 hover:text-red-600 p-1"
                title="Remove recovery email"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Add recovery email..."
            value={newRecoveryEmail}
            onChange={e => setNewRecoveryEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addRecoveryEmail()}
          />
          <Button size="sm" variant="outline" onClick={addRecoveryEmail}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <Button onClick={saveRecoveryEmails} disabled={recoverySaving} className="w-full">
          {recoverySaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
          Save Recovery Emails
        </Button>
      </div>
    </div>
  )
}
