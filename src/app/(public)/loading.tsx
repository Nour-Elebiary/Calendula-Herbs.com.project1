import React from 'react'

export default function PublicLoading() {
  return (
    <div className="page-root">
      <div className="page-content">
        <div className="animate-pulse flex flex-col gap-8">
          <div className="w-full h-[50vh] bg-[var(--color-bg-elevated)]" />
          <div className="container max-w-7xl space-y-4 pb-12">
            <div className="h-8 bg-[var(--color-bg-elevated)] rounded w-1/3" />
            <div className="h-4 bg-[var(--color-bg-elevated)] rounded w-2/3" />
            <div className="h-4 bg-[var(--color-bg-elevated)] rounded w-1/2" />
          </div>
        </div>
      </div>
    </div>
  )
}
