import { Loader2 } from 'lucide-react'

export default function RootLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
        <p className="text-neutral-500 text-sm">Loading...</p>
      </div>
    </div>
  )
}
