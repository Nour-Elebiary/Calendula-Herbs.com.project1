'use client'

import React from 'react'
import { Leaf } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center px-6 max-w-md">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
          <Leaf className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-4xl font-heading font-bold text-neutral-900 mb-4">Something went wrong</h1>
        <p className="text-neutral-600 mb-8">An unexpected error occurred. Please try again or contact us if the problem persists.</p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
