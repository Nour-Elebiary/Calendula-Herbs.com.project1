'use client'

import React, { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove, SortableContext, rectSortingStrategy, useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GalleryItem, GalleryItemType, GallerySection, MediaFile } from '@prisma/client'
import {
  Plus, GripVertical, Trash2, PlayCircle, Link, ArrowLeft, Loader2, Image as ImageIcon, Film
} from 'lucide-react'
import Image from 'next/image'
import { MediaPicker } from '@/components/admin/media/MediaPicker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

const SECTION_LABELS: Record<GallerySection, string> = {
  EVENTS: 'Events',
  INTERVIEWS_TV: 'Interviews & TV Shows',
  FACTORY: 'Factory Pics',
  FARMS: 'Farms Pics',
  SHIPMENTS: 'Shipments Pics',
}

const SECTION_COLORS: Record<GallerySection, string> = {
  EVENTS: 'bg-blue-100 text-blue-700',
  INTERVIEWS_TV: 'bg-purple-100 text-purple-700',
  FACTORY: 'bg-amber-100 text-amber-700',
  FARMS: 'bg-green-100 text-green-700',
  SHIPMENTS: 'bg-cyan-100 text-cyan-700',
}

type FullItem = GalleryItem & { mediaFile?: MediaFile | null }

function SortableItem({ item, onDelete }: { item: FullItem; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  const thumb = item.mediaFile?.url ?? item.thumbnailUrl

  return (
    <div ref={setNodeRef} style={style} className="relative group bg-white border rounded-xl overflow-hidden aspect-square">
      {thumb ? (
        <Image src={thumb} alt={item.title || 'Gallery item'} fill className="object-cover" sizes="200px" />
      ) : (
        <div className="flex items-center justify-center h-full bg-neutral-100">
          {item.type === 'YOUTUBE' ? <PlayCircle className="h-8 w-8 text-red-400" /> : <Film className="h-8 w-8 text-neutral-300" />}
        </div>
      )}

      {/* Type badge */}
      <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/60 text-white text-[10px] rounded font-medium uppercase">
        {item.type === 'UPLOADED_IMAGE' ? 'IMG' : item.type === 'UPLOADED_VIDEO' ? 'VID' : item.type === 'YOUTUBE' ? 'YT' : item.type}
      </div>

      {/* Section badge */}
      {item.section && (
        <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 text-[10px] rounded font-medium uppercase bg-white/90 shadow-sm">
          {SECTION_LABELS[item.section as GallerySection] || item.section}
        </div>
      )}

      {/* Actions */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-end justify-between p-2">
        <button {...attributes} {...listeners} className="p-1 bg-white/80 rounded cursor-grab">
          <GripVertical className="h-4 w-4" />
        </button>
        <button onClick={() => onDelete(item.id)} className="p-1 bg-red-500 text-white rounded hover:bg-red-600">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default function GalleryItemsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [gallery, setGallery] = useState<{ name: string; slug: string } | null>(null)
  const [items, setItems] = useState<FullItem[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [addType, setAddType] = useState<GalleryItemType>('UPLOADED_IMAGE')
  const [addSection, setAddSection] = useState<GallerySection | ''>('')
  const [externalUrl, setExternalUrl] = useState('')
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor))

  const fetchGallery = async () => {
    const res = await fetch(`/api/admin/gallery/${id}`)
    const data = await res.json()
    if (res.ok) {
      setGallery({ name: data.gallery.name, slug: data.gallery.slug })
      setItems(data.gallery.items)
    }
    setLoading(false)
  }

  useEffect(() => { if (id) Promise.resolve().then(fetchGallery) }, [id])

  const addMedia = async (mediaFileId: string) => {
    const type = addType === 'UPLOADED_IMAGE' ? 'UPLOADED_IMAGE' : 'UPLOADED_VIDEO'
    const res = await fetch(`/api/admin/gallery/${id}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, section: addSection || null, mediaFileId, title }),
    })
    if (res.ok) { toast.success('Item added'); setAddOpen(false); setTitle(''); setAddSection(''); fetchGallery() }
    else toast.error('Failed to add item')
  }

  const addExternal = async () => {
    if (!externalUrl) return
    setSaving(true)
    const type = externalUrl.includes('youtube.com') || externalUrl.includes('youtu.be')
      ? 'YOUTUBE'
      : externalUrl.includes('drive.google.com')
        ? 'GOOGLE_DRIVE'
        : 'FACEBOOK'

    const res = await fetch(`/api/admin/gallery/${id}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, section: addSection || null, externalUrl, title }),
    })
    if (res.ok) { toast.success('Item added'); setAddOpen(false); setExternalUrl(''); setTitle(''); setAddSection(''); fetchGallery() }
    else toast.error('Failed to add item')
    setSaving(false)
  }

  const handleDelete = async (itemId: string) => {
    await fetch(`/api/admin/gallery/${id}/items/${itemId}`, { method: 'DELETE' })
    toast.success('Item removed')
    fetchGallery()
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = items.findIndex(i => i.id === active.id)
    const newIdx = items.findIndex(i => i.id === over.id)
    const reordered = arrayMove(items, oldIdx, newIdx)
    setItems(reordered)
    await fetch(`/api/admin/gallery/${id}/items`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: reordered.map(i => i.id) }),
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h1 className="text-2xl font-bold font-heading">{gallery?.name || 'Gallery'}</h1>
          <p className="text-sm text-neutral-500">{items.length} items</p>
        </div>
        <Button className="ml-auto gap-2" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4" /> Add Item
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No items in this gallery yet.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {items.map(item => (
                <SortableItem key={item.id} item={item} onDelete={handleDelete} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add Item Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Gallery Item</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Type</Label>
              <div className="flex gap-2 mt-1.5">
                {(['UPLOADED_IMAGE', 'UPLOADED_VIDEO', 'YOUTUBE', 'GOOGLE_DRIVE'] as GalleryItemType[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setAddType(t)}
                    className={`flex-1 py-2 rounded-md text-xs font-medium border transition-colors ${
                      addType === t ? 'border-primary bg-primary/5 text-primary' : 'border-neutral-200 text-neutral-600 hover:border-primary/40'
                    }`}
                  >
                    {t === 'UPLOADED_IMAGE' ? 'Image' : t === 'UPLOADED_VIDEO' ? 'Video' : t === 'YOUTUBE' ? 'YouTube' : 'Drive'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Section Tag</Label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                <button
                  onClick={() => setAddSection('')}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                    addSection === '' ? 'border-primary bg-primary/5 text-primary' : 'border-neutral-200 text-neutral-500 hover:border-primary/40'
                  }`}
                >
                  None
                </button>
                {Object.entries(SECTION_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setAddSection(key as GallerySection)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                      addSection === key ? 'border-primary bg-primary/5 text-primary' : 'border-neutral-200 text-neutral-600 hover:border-primary/40'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="gallery-item-title">Title (optional)</Label>
              <Input id="gallery-item-title" className="mt-1" placeholder="Item title..." value={title} onChange={e => setTitle(e.target.value)} />
            </div>

            {(addType === 'UPLOADED_IMAGE' || addType === 'UPLOADED_VIDEO') ? (
              <>
                <Button className="w-full gap-2" onClick={() => setPickerOpen(true)}>
                  <ImageIcon className="h-4 w-4" /> Choose from Media Library
                </Button>
                <MediaPicker
                  open={pickerOpen}
                  onOpenChange={setPickerOpen}
                  filterType={addType === 'UPLOADED_IMAGE' ? 'IMAGE' : 'VIDEO'}
                  onSelect={(media) => { addMedia(media.id) }}
                />
              </>
            ) : (
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  placeholder={addType === 'YOUTUBE' ? 'https://youtube.com/watch?v=...' : 'https://drive.google.com/...'}
                  value={externalUrl}
                  onChange={e => setExternalUrl(e.target.value)}
                />
                <Button className="w-full" onClick={addExternal} disabled={!externalUrl || saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Link className="h-4 w-4 mr-2" />}
                  Add Link
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
