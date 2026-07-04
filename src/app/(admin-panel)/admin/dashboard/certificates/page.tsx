'use client'

import React, { useState, useEffect } from 'react'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove, SortableContext, verticalListSortingStrategy, useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Certificate, MediaFile } from '@prisma/client'
import {
  Plus, GripVertical, Trash2, Pencil, Eye, EyeOff, FileText, Image as ImageIcon,
  Loader2, X, Check
} from 'lucide-react'
import Image from 'next/image'
import { MediaPicker } from '@/components/admin/media/MediaPicker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

type CertWithFile = Certificate & { file?: { url: string; thumbnailUrl: string | null; type: string } | null }

function SortableCert({ cert, onEdit, onDelete, onToggle }: {
  cert: CertWithFile
  onEdit: (c: CertWithFile) => void
  onDelete: (id: string) => void
  onToggle: (c: CertWithFile) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cert.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
  const thumb = cert.file?.thumbnailUrl || cert.file?.url

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 bg-white border rounded-xl p-4 hover:shadow-sm transition-shadow">
      <button {...attributes} {...listeners} className="cursor-grab text-neutral-300 hover:text-neutral-500">
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Thumb */}
      <div className="w-12 h-12 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
        {thumb ? (
          <Image src={thumb} alt={cert.title} width={48} height={48} className="object-cover w-full h-full" />
        ) : cert.fileType === 'PDF' ? (
          <FileText className="h-6 w-6 text-red-400" />
        ) : (
          <ImageIcon className="h-6 w-6 text-neutral-400" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{cert.title}</p>
        {cert.issuer && <p className="text-sm text-neutral-500 truncate">{cert.issuer}</p>}
        <span className="text-xs px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500 font-medium">{cert.fileType}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onToggle(cert)}
          title={cert.isActive ? 'Hide' : 'Show'}
          className={`p-1.5 rounded-md transition-colors ${cert.isActive ? 'text-primary hover:bg-primary/10' : 'text-neutral-400 hover:bg-neutral-100'}`}
        >
          {cert.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
        <Button size="sm" variant="ghost" onClick={() => onEdit(cert)}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onDelete(cert.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

const EMPTY_FORM = { title: '', issuer: '', fileId: '', fileType: 'PDF' as 'PDF' | 'IMAGE' }

export default function CertificatesPage() {
  const [certs, setCerts] = useState<CertWithFile[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<CertWithFile | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<{ url: string; id: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const sensors = useSensors(useSensor(PointerSensor))

  const fetch_ = async () => {
    const res = await fetch('/api/admin/certificates')
    const data = await res.json()
    setCerts(data.certs || [])
    setLoading(false)
  }

  useEffect(() => { Promise.resolve().then(fetch_) }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setSelectedFile(null)
    setDialogOpen(true)
  }

  const openEdit = (cert: CertWithFile) => {
    setEditing(cert)
    setForm({ title: cert.title, issuer: cert.issuer || '', fileId: cert.fileId || '', fileType: cert.fileType })
     
    setSelectedFile(cert.file ? { url: cert.file.url, id: cert.fileId! } : null)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error('Title is required')
    setSaving(true)
    const body = { title: form.title, issuer: form.issuer || null, fileId: selectedFile?.id || null, fileType: form.fileType }
    const url = editing ? `/api/admin/certificates/${editing.id}` : '/api/admin/certificates'
    const method = editing ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) {
      toast.success(editing ? 'Updated' : 'Created')
      setDialogOpen(false)
      fetch_()
    } else {
      toast.error('Save failed')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this certificate?')) return
    await fetch(`/api/admin/certificates/${id}`, { method: 'DELETE' })
    toast.success('Deleted')
    fetch_()
  }

  const handleToggle = async (cert: CertWithFile) => {
    await fetch(`/api/admin/certificates/${cert.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !cert.isActive }),
    })
    fetch_()
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = certs.findIndex(c => c.id === active.id)
    const newIdx = certs.findIndex(c => c.id === over.id)
    const reordered = arrayMove(certs, oldIdx, newIdx)
    setCerts(reordered)
    await fetch('/api/admin/certificates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: reordered.map(c => c.id) }),
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Certificates</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage certifications displayed on the website</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Add Certificate
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
      ) : certs.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No certificates yet.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={certs.map(c => c.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {certs.map(c => (
                <SortableCert key={c.id} cert={c} onEdit={openEdit} onDelete={handleDelete} onToggle={handleToggle} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Certificate' : 'Add Certificate'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label htmlFor="cert-title">Title *</Label>
              <Input id="cert-title" className="mt-1" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. EU Organic Certificate" />
            </div>
            <div>
              <Label htmlFor="cert-issuer">Issuer</Label>
              <Input id="cert-issuer" className="mt-1" value={form.issuer} onChange={e => setForm(f => ({ ...f, issuer: e.target.value }))} placeholder="e.g. Control Union" />
            </div>
            <div>
              <Label>File Type</Label>
              <div className="flex gap-2 mt-1.5">
                {(['PDF', 'IMAGE'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setForm(f => ({ ...f, fileType: t }))}
                    className={`flex-1 py-2 rounded-md text-sm font-medium border ${form.fileType === t ? 'border-primary bg-primary/5 text-primary' : 'border-neutral-200 text-neutral-600'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>File</Label>
              <div className="mt-1.5 flex gap-2 items-center">
                {selectedFile && (
                  <div className="w-12 h-12 rounded border overflow-hidden flex-shrink-0">
                    <Image src={selectedFile.url} alt="" width={48} height={48} className="object-cover w-full h-full" />
                  </div>
                )}
                <Button variant="outline" className="flex-1" onClick={() => setPickerOpen(true)}>
                  {selectedFile ? 'Change File' : 'Choose from Media Library'}
                </Button>
                {selectedFile && (
                  <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <MediaPicker
              open={pickerOpen}
              onOpenChange={setPickerOpen}
              filterType={form.fileType === 'PDF' ? 'PDF' : 'IMAGE'}
              onSelect={(media) => setSelectedFile({ url: media.url, id: media.id })}
            />

            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editing ? 'Save Changes' : 'Add Certificate'}
              </Button>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
