'use client'

import React, { useState, useEffect } from 'react'
import { MediaType, MediaFile } from '@prisma/client'
import { Search, Image as ImageIcon, Film, Music, FileText, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import Image from 'next/image'

interface MediaPickerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (media: MediaFile) => void
  filterType?: MediaType
}

export function MediaPicker({ open, onOpenChange, onSelect, filterType }: MediaPickerProps) {
  const [media, setMedia] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (!open) return

    Promise.resolve().then(() => setLoading(true))
    const url = new URL('/api/admin/media', window.location.origin)
    url.searchParams.set('page', page.toString())
    if (search) url.searchParams.set('search', search)
    if (filterType) url.searchParams.set('type', filterType)
    fetch(url.toString())
      .then(r => r.json())
      .then(data => {
        if (data.items) {
          setMedia(data.items)
          setTotalPages(data.totalPages)
        } else {
          toast.error('Failed to load media')
        }
      })
      .catch(() => toast.error('Network error loading media'))
      .finally(() => setLoading(false))
  }, [open, page, search, filterType])

  const handleSelect = (item: MediaFile) => {
    onSelect(item)
    onOpenChange(false)
  }

  const renderIcon = (type: MediaType) => {
    switch (type) {
      case 'VIDEO': return <Film className="h-8 w-8 text-neutral-400" />
      case 'AUDIO': return <Music className="h-8 w-8 text-neutral-400" />
      case 'PDF': return <FileText className="h-8 w-8 text-neutral-400" />
      default: return <ImageIcon className="h-8 w-8 text-neutral-400" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Media</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4 mt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input 
              placeholder="Search media files..." 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : media.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-neutral-500">
              <ImageIcon className="h-12 w-12 mb-4 opacity-50" />
              <p>No media files found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 p-1">
              {media.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="group relative border rounded-md overflow-hidden cursor-pointer hover:border-primary transition-colors bg-neutral-50 aspect-square flex flex-col"
                >
                  <div className="flex-1 flex items-center justify-center relative bg-white">
                    {item.type === 'IMAGE' ? (
                      <Image 
                        src={item.url} 
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 33vw, 20vw"
                      />
                    ) : (
                      renderIcon(item.type)
                    )}
                  </div>
                  <div className="p-2 text-xs truncate border-t bg-white">
                    {item.name}
                  </div>
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Button size="sm" variant="secondary" className="shadow-sm">Select</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center pt-4 border-t mt-4">
            <Button 
              variant="outline" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-neutral-500">
              Page {page} of {totalPages}
            </span>
            <Button 
              variant="outline" 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
