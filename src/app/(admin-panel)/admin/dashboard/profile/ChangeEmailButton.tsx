'use client'

import React, { useState } from 'react'
import { Pencil } from 'lucide-react'
import { ChangeEmailModal } from '@/components/admin/ChangeEmailModal'

type Props = {
  currentEmail: string
}

export function ChangeEmailButton({ currentEmail }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-[var(--color-green-600)] hover:bg-[var(--color-green-500)]/10 border border-[var(--color-green-500)]/30 transition-colors"
      >
        <Pencil className="w-3 h-3" />
        Change
      </button>
      <ChangeEmailModal
        currentEmail={currentEmail}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}
