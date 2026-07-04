'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove, SortableContext, verticalListSortingStrategy, useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Gallery } from '@prisma/client'
import {
  Plus, GripVertical, Pencil, Trash2, Images, Check, X, Loader2, Eye, EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

type GalleryWithCount = Gallery & { _count: { items: number } }

function SortableGallery({ gallery, onEdit, onDelete, onNavigate }: {
  gallery: GalleryWithCount
  onEdit: (g: GalleryWithCount) => void
  onDelete: (id: string) => void
  onNavigate: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: gallery.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow">
      <button {...attributes} {...listeners} className="cursor-grab text-neutral-300 hover:text-neutral-500">
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{gallery.name}</span>
          {!gallery.isActive && <EyeOff className="h-3.5 w-3.5 text-neutral-400" />}
        </div>
        <p className="text-xs text-neutral-500">{gallery._count.items} items · /{gallery.slug}</p>
      </div>

      <div className="flex items-center gap-1.5">
        <Button size="sm" variant="outline" onClick={() => onNavigate(gallery.id)} className="gap-1">
          <Images className="h-3.5 w-3.5" />
          Manage Items
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onEdit(gallery)}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onDelete(gallery.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

export default function GalleriesPage() {
  const router = useRouter()
  const [galleries, setGalleries] = useState<GalleryWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingGallery, setEditingGallery] = useState<GalleryWithCount | null>(null)
  const [editName, setEditName] = useState('')

  const sensors = useSensors(useSensor(PointerSensor))

  const fetch_ = async () => {
    const res = await fetch('/api/admin/gallery')
    const data = await res.json()
    setGalleries(data.galleries || [])
    setLoading(false)
  }

  useEffect(() => { Promise.resolve().then(fetch_) }, [])

  const handleCreate = async () => {
    if (!newName.trim()) return
    const res = await fetch('/api/admin/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    })
    if (res.ok) {
      toast.success('Gallery created')
      setCreating(false)
      setNewName('')
      fetch_()
    } else {
      toast.error('Failed to create gallery')
    }
  }

  const handleEdit = async () => {
    if (!editingGallery) return
    const res = await fetch(`/api/admin/gallery/${editingGallery.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim() }),
    })
    if (res.ok) {
      toast.success('Saved')
      setEditingGallery(null)
      fetch_()
    } else {
      toast.error('Save failed')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this gallery and all its items?')) return
    await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' })
    toast.success('Gallery deleted')
    fetch_()
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = galleries.findIndex((g) => g.id === active.id)
    const newIndex = galleries.findIndex((g) => g.id === over.id)
    const reordered = arrayMove(galleries, oldIndex, newIndex)
    setGalleries(reordered)
    await fetch('/api/admin/gallery', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: reordered.map((g) => g.id) }),
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Galleries</h1>
          <p className="text-sm text-neutral-500 mt-1">Create and manage photo/video galleries</p>
        </div>
        <Button onClick={() => setCreating(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Gallery
        </Button>
      </div>

      {creating && (
        <div className="bg-white border rounded-lg p-4 flex gap-2 items-center">
          <Input
            autoFocus
            placeholder="Gallery name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false) }}
            className="flex-1"
          />
          <Button onClick={handleCreate} size="sm"><Check className="h-4 w-4" /></Button>
          <Button onClick={() => { setCreating(false); setNewName('') }} variant="ghost" size="sm"><X className="h-4 w-4" /></Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : galleries.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <Images className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No galleries yet. Create your first one!</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={galleries.map(g => g.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {galleries.map((g) => (
                editingGallery?.id === g.id ? (
                  <div key={g.id} className="flex gap-2 bg-white border rounded-lg p-4 items-center">
                    <Input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleEdit(); if (e.key === 'Escape') setEditingGallery(null) }}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={handleEdit}><Check className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingGallery(null)}><X className="h-4 w-4" /></Button>
                  </div>
                ) : (
                  <SortableGallery
                    key={g.id}
                    gallery={g}
                    onEdit={(g) => { setEditingGallery(g); setEditName(g.name) }}
                    onDelete={handleDelete}
                    onNavigate={(id) => router.push(`/admin/dashboard/galleries/${id}`)}
                  />
                )
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
