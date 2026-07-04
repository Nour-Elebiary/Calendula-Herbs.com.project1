import { Loader2 } from 'lucide-react'

export default function PublicLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-white">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-neutral-400 text-sm">Loading page...</p>
      </div>
    </div>
  )
}
