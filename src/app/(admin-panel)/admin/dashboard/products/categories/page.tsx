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
import { Category } from '@prisma/client'
import { ArrowLeft, Plus, GripVertical, Pencil, Trash2, Check, X, Loader2, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

type CategoryWithCount = Category & { _count?: { products: number } }

function SortableCategory({
  category, onEdit, onDelete
}: {
  category: CategoryWithCount
  onEdit: (c: CategoryWithCount) => void
  onDelete: (c: CategoryWithCount) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  const count = category._count?.products ?? 0

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 bg-white border rounded-lg p-3.5 hover:shadow-sm transition-shadow">
      <button {...attributes} {...listeners} className="cursor-grab text-neutral-300 hover:text-neutral-500">
        <GripVertical className="h-5 w-5" />
      </button>
      <div className="flex-1 min-w-0">
        <span className="font-medium text-neutral-900">{category.name}</span>
        <span className="text-xs text-neutral-400 ml-2">/{category.slug}</span>
      </div>
      <Badge variant="secondary" className="text-xs shrink-0">
        {count} product{count !== 1 ? 's' : ''}
      </Badge>
      <div className="flex items-center gap-1">
        <Button size="sm" variant="ghost" onClick={() => onEdit(category)}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(category)}
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
          disabled={count > 0}
          title={count > 0 ? `Used by ${count} product(s) — remove from products first` : 'Delete category'}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<CategoryWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingCat, setEditingCat] = useState<CategoryWithCount | null>(null)
  const [editName, setEditName] = useState('')

  const sensors = useSensors(useSensor(PointerSensor))

  const fetchCategories = async () => {
    const res = await fetch('/api/admin/categories?withCounts=true')
    const data = await res.json()
    setCategories(data.categories || [])
    setLoading(false)
  }

  useEffect(() => { Promise.resolve().then(fetchCategories) }, [])

  const handleCreate = async () => {
    if (!newName.trim()) return
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    })
    if (res.ok) {
      toast.success('Category created')
      setCreating(false)
      setNewName('')
      fetchCategories()
    } else {
      const data = await res.json()
      toast.error(data.error || 'Failed to create category')
    }
  }

  const handleEdit = async () => {
    if (!editingCat || !editName.trim()) return
    const res = await fetch(`/api/admin/categories/${editingCat.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim() }),
    })
    if (res.ok) {
      toast.success('Category renamed')
      setEditingCat(null)
      fetchCategories()
    } else {
      toast.error('Failed to rename')
    }
  }

  const handleDelete = async (cat: CategoryWithCount) => {
    const count = cat._count?.products ?? 0
    if (count > 0) {
      toast.error(`Cannot delete: used by ${count} product(s)`)
      return
    }
    if (!confirm(`Delete category "${cat.name}"?`)) return
    const res = await fetch(`/api/admin/categories/${cat.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Category deleted')
      fetchCategories()
    } else {
      const data = await res.json()
      toast.error(data.error || 'Failed to delete')
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = categories.findIndex(c => c.id === active.id)
    const newIndex = categories.findIndex(c => c.id === over.id)
    const reordered = arrayMove(categories, oldIndex, newIndex)
    setCategories(reordered)
    await fetch('/api/admin/categories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: reordered.map(c => c.id) }),
    })
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/admin/dashboard/products')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Products
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold font-heading">Categories</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Organize products by category</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Category
        </Button>
      </div>

      {/* Create form */}
      {creating && (
        <div className="bg-white border rounded-lg p-4 flex gap-2 items-center">
          <Input
            autoFocus
            placeholder="Category name..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleCreate()
              if (e.key === 'Escape') { setCreating(false); setNewName('') }
            }}
            className="flex-1"
          />
          <Button onClick={handleCreate} size="sm"><Check className="h-4 w-4" /></Button>
          <Button onClick={() => { setCreating(false); setNewName('') }} variant="ghost" size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <Tag className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No categories yet. Create your first one!</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {categories.map(cat => (
                editingCat?.id === cat.id ? (
                  <div key={cat.id} className="flex gap-2 bg-white border rounded-lg p-3.5 items-center">
                    <Input
                      autoFocus
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleEdit()
                        if (e.key === 'Escape') setEditingCat(null)
                      }}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={handleEdit}><Check className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingCat(null)}><X className="h-4 w-4" /></Button>
                  </div>
                ) : (
                  <SortableCategory
                    key={cat.id}
                    category={cat}
                    onEdit={c => { setEditingCat(c); setEditName(c.name) }}
                    onDelete={handleDelete}
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
