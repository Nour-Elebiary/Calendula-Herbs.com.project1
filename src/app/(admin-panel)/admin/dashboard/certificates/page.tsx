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
  Loader2, X, Check, Globe
} from 'lucide-react'
import Image from 'next/image'
import { MediaPicker } from '@/components/admin/media/MediaPicker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

const LOCALE_TABS = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'ar', label: 'AR', name: 'العربية' },
  { code: 'es', label: 'ES', name: 'Español' },
  { code: 'it', label: 'IT', name: 'Italiano' },
  { code: 'ja', label: 'JA', name: '日本語' },
  { code: 'ko', label: 'KO', name: '한국어' },
  { code: 'hi', label: 'HI', name: 'हिन्दी' },
  { code: 'ru', label: 'RU', name: 'Русский' },
  { code: 'uk', label: 'UA', name: 'Українська' },
  { code: 'pt-BR', label: 'BR', name: 'Português' },
  { code: 'zh-CN', label: 'CN', name: '简体中文' },
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'nl', label: 'NL', name: 'Nederlands' },
  { code: 'de', label: 'DE', name: 'Deutsch' },
  { code: 'bg', label: 'BG', name: 'Български' },
  { code: 'el', label: 'EL', name: 'Ελληνικά' },
  { code: 'tr', label: 'TR', name: 'Türkçe' },
]

type CertWithTrans = Certificate & {
  file?: { url: string; thumbnailUrl: string | null; type: string } | null
  logo?: { url: string; thumbnailUrl: string | null } | null
  translations?: { locale: string; title: string | null; issuer: string | null; description: string | null }[]
}

function SortableCert({ cert, onEdit, onDelete, onToggle }: {
  cert: CertWithTrans
  onEdit: (c: CertWithTrans) => void
  onDelete: (id: string) => void
  onToggle: (c: CertWithTrans) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cert.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }
  const thumb = cert.file?.thumbnailUrl || cert.file?.url
  const logoSrc = cert.logo?.thumbnailUrl || cert.logo?.url
  const isLogoSvg = logoSrc ? /\.svg($|\?)/i.test(logoSrc) : false

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 bg-card border rounded-xl p-4 hover:shadow-sm transition-shadow">
      <button {...attributes} {...listeners} className="cursor-grab text-neutral-300 hover:text-neutral-500">
        <GripVertical className="h-5 w-5" />
      </button>

      {logoSrc && (
        <div className="w-10 h-10 bg-neutral-50 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
          {isLogoSvg ? (
            <img src={logoSrc} alt={cert.title} width={40} height={40} className="object-contain w-full h-full" />
          ) : (
            <Image src={logoSrc} alt={cert.title} width={40} height={40} className="object-contain w-full h-full" />
          )}
        </div>
      )}

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

type FormData = {
  title: string; issuer: string; fileId: string; fileType: 'PDF' | 'IMAGE'
  translations: Record<string, { title: string; issuer: string; description: string }>
}

const EMPTY_FORM: FormData = {
  title: '', issuer: '', fileId: '', fileType: 'PDF',
  translations: Object.fromEntries(LOCALE_TABS.map(t => [t.code, { title: '', issuer: '', description: '' }])),
}

export default function CertificatesPage() {
  const [certs, setCerts] = useState<CertWithTrans[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<CertWithTrans | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [activeLocale, setActiveLocale] = useState('en')
  const [pickerOpen, setPickerOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<{ url: string; id: string } | null>(null)
  const [logoPickerOpen, setLogoPickerOpen] = useState(false)
  const [selectedLogo, setSelectedLogo] = useState<{ url: string; id: string } | null>(null)
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
    setActiveLocale('en')
    setSelectedFile(null)
    setSelectedLogo(null)
    setDialogOpen(true)
  }

  const openEdit = (cert: CertWithTrans) => {
    setEditing(cert)
    const tls: Record<string, { title: string; issuer: string; description: string }> = {}
    for (const tab of LOCALE_TABS) {
      const tr = cert.translations?.find(t => t.locale === tab.code)
      tls[tab.code] = {
        title: tr?.title ?? cert.title ?? '',
        issuer: tr?.issuer ?? cert.issuer ?? '',
        description: tr?.description ?? cert.description ?? '',
      }
    }
    setForm({
      title: cert.title, issuer: cert.issuer || '', fileId: cert.fileId || '', fileType: cert.fileType,
      translations: tls,
    })
    setActiveLocale('en')
    setSelectedFile(cert.file ? { url: cert.file.url, id: cert.fileId! } : null)
    setSelectedLogo(cert.logo ? { url: cert.logo.url, id: cert.logoFileId! } : null)
    setDialogOpen(true)
  }

  const updateTrans = (locale: string, field: 'title' | 'issuer' | 'description', value: string) => {
    setForm(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [locale]: { ...prev.translations[locale], [field]: value },
      },
    }))
  }

  const handleSave = async () => {
    if (!form.translations['en']?.title?.trim()) return toast.error('English title is required')
    setSaving(true)

    const translations: Record<string, { title: string | null; issuer: string | null; description: string | null }> = {}
    for (const tab of LOCALE_TABS) {
      const tr = form.translations[tab.code]
      if (tr?.title?.trim() || tr?.issuer?.trim() || tr?.description?.trim()) {
        translations[tab.code] = {
          title: tr.title?.trim() || null,
          issuer: tr.issuer?.trim() || null,
          description: tr.description?.trim() || null,
        }
      }
    }

    const en = form.translations['en']
    const body: Record<string, unknown> = {
      title: en.title?.trim() || '',
      issuer: en.issuer?.trim() || null,
      fileId: selectedFile?.id || null,
      logoFileId: selectedLogo?.id || null,
      fileType: form.fileType,
      translations,
    }

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
      const err = await res.json().catch(() => ({}))
      toast.error(err.error || 'Save failed')
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this certificate?')) return
    await fetch(`/api/admin/certificates/${id}`, { method: 'DELETE' })
    toast.success('Deleted')
    fetch_()
  }

  const handleToggle = async (cert: CertWithTrans) => {
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

  const currentTab = LOCALE_TABS.find(t => t.code === activeLocale) || LOCALE_TABS[0]

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
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Certificate' : 'Add Certificate'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {/* Locale Tabs */}
            <div className="flex overflow-x-auto border-b border-neutral-200 gap-0.5 pb-0">
              {LOCALE_TABS.map(tab => (
                <button
                  key={tab.code}
                  onClick={() => setActiveLocale(tab.code)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors shrink-0 ${
                    activeLocale === tab.code
                      ? 'border-green-600 text-green-700'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <Globe className="h-3 w-3" />
                  <span>{tab.label}</span>
                  {form.translations[tab.code]?.title?.trim() && (
                    <Check className="h-3 w-3 text-green-500" />
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Globe className="h-4 w-4" />
              <span>Editing: <strong>{currentTab.name}</strong> ({currentTab.label})</span>
            </div>

            <div>
              <Label htmlFor="cert-title">Title * ({currentTab.label})</Label>
              <Input id="cert-title" className="mt-1" value={form.translations[activeLocale]?.title ?? ''} onChange={e => updateTrans(activeLocale, 'title', e.target.value)} placeholder="e.g. EU Organic Certificate" />
            </div>
            <div>
              <Label htmlFor="cert-issuer">Issuer ({currentTab.label})</Label>
              <Input id="cert-issuer" className="mt-1" value={form.translations[activeLocale]?.issuer ?? ''} onChange={e => updateTrans(activeLocale, 'issuer', e.target.value)} placeholder="e.g. Control Union" />
            </div>
            <div>
              <Label htmlFor="cert-desc">Description ({currentTab.label})</Label>
              <Textarea id="cert-desc" className="mt-1" value={form.translations[activeLocale]?.description ?? ''} onChange={e => updateTrans(activeLocale, 'description', e.target.value)} rows={3} placeholder="Optional description of the certification..." />
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

            <div>
              <Label>Logo</Label>
              <div className="mt-1.5 flex gap-2 items-center">
                {selectedLogo && (
                  <div className="w-12 h-12 rounded border overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                    {/\.svg($|\?)/i.test(selectedLogo.url) ? (
                      <img src={selectedLogo.url} alt="" width={48} height={48} className="object-contain w-full h-full" />
                    ) : (
                      <Image src={selectedLogo.url} alt="" width={48} height={48} className="object-contain w-full h-full" />
                    )}
                  </div>
                )}
                <Button variant="outline" className="flex-1" onClick={() => setLogoPickerOpen(true)}>
                  {selectedLogo ? 'Change Logo' : 'Choose Logo from Media Library'}
                </Button>
                {selectedLogo && (
                  <Button variant="ghost" size="sm" onClick={() => setSelectedLogo(null)}>
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

            <MediaPicker
              open={logoPickerOpen}
              onOpenChange={setLogoPickerOpen}
              filterType="IMAGE"
              onSelect={(media) => setSelectedLogo({ url: media.url, id: media.id })}
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