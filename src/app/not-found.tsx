import React from 'react'
import Link from 'next/link'
import { Leaf } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center px-6 max-w-md">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
          <Leaf className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-7xl font-heading font-bold text-neutral-900 mb-4">404</h1>
        <p className="text-xl text-neutral-600 mb-8">The page you are looking for does not exist or has been moved.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
