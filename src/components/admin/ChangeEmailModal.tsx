'use client'

import React, { useState } from 'react'
import { Mail, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

type Props = {
  currentEmail: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChangeEmailModal({ currentEmail, open, onOpenChange }: Props) {
  const [newEmail, setNewEmail] = useState(currentEmail)
  const [currentPassword, setCurrentPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!newEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim())) {
      setError('Please enter a valid email address')
      return
    }
    if (!currentPassword) {
      setError('Please enter your current password')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/profile/change-email', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail: newEmail.trim(), currentPassword }),
      })

      if (res.ok) {
        window.location.href = '/admin/email-changed'
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to change email')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Login Email</DialogTitle>
          <DialogDescription>
            This will update your primary sign-in email. All active sessions will be revoked and you&apos;ll need to sign in again.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex gap-2 items-start p-3 rounded-lg bg-red-500/10 border border-red-400/30 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="new-email">New Email Address</Label>
            <Input
              id="new-email"
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm-pw">Current Password</Label>
            <div className="relative">
              <Input
                id="confirm-pw"
                type={showPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Confirm your current password"
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
              Change Email
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
