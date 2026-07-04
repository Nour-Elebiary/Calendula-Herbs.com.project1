'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { MediaFile, MediaType } from '@prisma/client'
import {
  Upload, Trash2, Link2, Pencil, Grid2X2, Search,
  Image as ImageIcon, Film, Music, FileText, HardDrive,
  X, Check, Loader2
} from 'lucide-react'
import Image from 'next/image'
import { MediaUploader } from '@/components/admin/media/MediaUploader'
import { ImageCropper } from '@/components/admin/media/ImageCropper'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

const TYPE_TABS: { label: string; value: MediaType | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Images', value: 'IMAGE' },
  { label: 'Videos', value: 'VIDEO' },
  { label: 'Audio', value: 'AUDIO' },
  { label: 'PDFs', value: 'PDF' },
]

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function MediaPage() {
  const [media, setMedia] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploaderOpen, setUploaderOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<MediaType | 'ALL'>('ALL')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalStorageBytes, setTotalStorageBytes] = useState(0)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  const fetchMedia = useCallback(async () => {
    try {
      const url = new URL('/api/admin/media', window.location.origin)
      url.searchParams.set('page', page.toString())
      url.searchParams.set('limit', '50')
      if (search) url.searchParams.set('search', search)
      if (typeFilter !== 'ALL') url.searchParams.set('type', typeFilter)

      const res = await fetch(url.toString())
      const data = await res.json()
      if (res.ok) {
        setMedia(data.items)
        setTotal(data.total)
        setTotalPages(data.totalPages)
        // sum storage for current filter
        const totalBytes = data.items.reduce((sum: number, m: MediaFile) => sum + m.sizeBytes, 0)
        setTotalStorageBytes(totalBytes)
      }
    } finally {
      setLoading(false)
    }
  }, [page, search, typeFilter])

  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this file? This cannot be undone.')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/media/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        toast.success('File deleted')
        fetchMedia()
      } else {
        toast.error(data.error || 'Delete failed')
      }
    } finally {
      setDeleting(null)
    }
  }

  const handleRename = async (id: string) => {
    if (!renameValue.trim()) return
    const res = await fetch(`/api/admin/media/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: renameValue.trim() }),
    })
    if (res.ok) {
      toast.success('Renamed')
      setRenamingId(null)
      fetchMedia()
    } else {
      toast.error('Rename failed')
    }
  }

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('URL copied to clipboard')
  }

  const MediaIcon = (type: MediaType) => {
    switch (type) {
      case 'VIDEO': return <Film className="h-10 w-10 text-neutral-300" />
      case 'AUDIO': return <Music className="h-10 w-10 text-neutral-300" />
      case 'PDF': return <FileText className="h-10 w-10 text-neutral-300" />
      default: return <ImageIcon className="h-10 w-10 text-neutral-300" />
    }
  }

  const MAX_STORAGE_BYTES = 25 * 1024 * 1024 * 1024 // 25 GB
  const storagePercent = Math.min((totalStorageBytes / MAX_STORAGE_BYTES) * 100, 100)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Media Library</h1>
          <p className="text-sm text-neutral-500 mt-1">{total} files</p>
        </div>
        <Button onClick={() => setUploaderOpen(!uploaderOpen)} className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Files
        </Button>
      </div>

      {/* Storage Bar */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <HardDrive className="h-4 w-4" />
            Storage Used
          </div>
          <span className="text-sm text-neutral-500">
            {formatBytes(totalStorageBytes)} / 25 GB
          </span>
        </div>
        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${storagePercent}%` }}
          />
        </div>
        {storagePercent > 80 && (
          <p className="text-xs text-amber-600 mt-1.5">⚠ Storage over 80% — consider removing unused files.</p>
        )}
      </div>

      {/* Uploader */}
      {uploaderOpen && (
        <div className="bg-white border rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Upload New Files</h3>
            <Button variant="ghost" size="sm" onClick={() => setUploaderOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <MediaUploader onUploadSuccess={() => { setUploaderOpen(false); fetchMedia() }} />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Search files..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => { setTypeFilter(tab.value); setPage(1) }}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                typeFilter === tab.value
                  ? 'bg-primary text-white'
                  : 'bg-white border text-neutral-600 hover:border-primary/60 hover:text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : media.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-neutral-400">
          <Grid2X2 className="h-12 w-12 mb-4 opacity-30" />
          <p className="text-lg">No files found</p>
          <p className="text-sm mt-1">Upload files to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {media.map((item) => (
            <div key={item.id} className="group relative bg-white border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              {/* Thumbnail */}
              <div className="aspect-square relative flex items-center justify-center bg-neutral-50">
                {item.type === 'IMAGE' ? (
                  <Image
                    src={item.url}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 20vw"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    {MediaIcon(item.type)}
                    <span className="text-xs font-medium text-neutral-400 uppercase">{item.type}</span>
                  </div>
                )}
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    title="Copy URL"
                    onClick={() => copyUrl(item.url)}
                    className="p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors"
                  >
                    <Link2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    title="Rename"
                    onClick={() => { setRenamingId(item.id); setRenameValue(item.name) }}
                    className="p-1.5 bg-white/90 rounded-full hover:bg-white transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    title="Delete"
                    onClick={() => handleDelete(item.id)}
                    disabled={deleting === item.id}
                    className="p-1.5 bg-red-500/90 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    {deleting === item.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Name / Rename */}
              <div className="p-2 border-t bg-white">
                {renamingId === item.id ? (
                  <div className="flex gap-1">
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(item.id)
                        if (e.key === 'Escape') setRenamingId(null)
                      }}
                      className="flex-1 text-xs border rounded px-1 py-0.5 outline-primary"
                    />
                    <button onClick={() => handleRename(item.id)} className="text-green-600">
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setRenamingId(null)} className="text-neutral-400">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-medium truncate" title={item.name}>{item.name}</p>
                    <p className="text-xs text-neutral-400">{formatBytes(item.sizeBytes)}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          <span className="text-sm text-neutral-500">Page {page} of {totalPages}</span>
          <Button variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
