'use client'

import React, { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowLeft, Save, Loader2, Star, Trash2, Plus, GripVertical,
  Leaf, Tag, ShoppingBag, Check
} from 'lucide-react'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove, SortableContext, horizontalListSortingStrategy, useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { MediaPicker } from '@/components/admin/media/MediaPicker'
import { toast } from 'sonner'
import { Category, MediaFile } from '@prisma/client'

type ProductImage = {
  id: string
  isPrimary: boolean
  order: number
  mediaFile: { id: string; url: string; thumbnailUrl: string | null; name: string; width: number | null; height: number | null }
}

type ProductDetail = {
  id: string
  name: string
  scientificName: string | null
  slug: string
  description: string | null
  shortDescription: string | null
  isOrganic: boolean
  organicType: string | null
  conventionalType: string | null
  minOrderKg: number
  isActive: boolean
  isFeatured: boolean
  categories: { category: Category }[]
  images: ProductImage[]
}

function SortableImage({
  img, onSetPrimary, onDelete
}: {
  img: ProductImage
  onSetPrimary: (id: string) => void
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: img.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }

  return (
    <div ref={setNodeRef} style={style} className="relative group w-28 h-28 shrink-0">
      <div className={`w-full h-full rounded-lg overflow-hidden border-2 transition-colors ${img.isPrimary ? 'border-green-500' : 'border-transparent'}`}>
        <Image src={img.mediaFile.url} alt={img.mediaFile.name} fill className="object-cover" sizes="112px" />
      </div>
      {img.isPrimary && (
        <div className="absolute top-1 left-1 bg-green-500 rounded-full p-0.5">
          <Star className="h-3 w-3 text-white fill-white" />
        </div>
      )}
      {/* Drag handle */}
      <button
        {...attributes} {...listeners}
        className="absolute bottom-1 left-1 bg-black/50 rounded p-0.5 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="h-3 w-3 text-white" />
      </button>
      {/* Actions overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-lg flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
        {!img.isPrimary && (
          <button
            onClick={() => onSetPrimary(img.id)}
            className="bg-green-500 text-white rounded-full p-1 hover:bg-green-600 transition-colors"
            title="Set as primary"
          >
            <Star className="h-3 w-3" />
          </button>
        )}
        <button
          onClick={() => onDelete(img.id)}
          className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          title="Remove image"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}

export default function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const isNew = id === 'new'
  const [product, setProduct] = useState<ProductDetail | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [mediaPicker, setMediaPicker] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [scientificName, setScientificName] = useState('')
  const [slug, setSlug] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [description, setDescription] = useState('')
  const [organicType, setOrganicType] = useState('')
  const [conventionalType, setConventionalType] = useState('')
  const [minOrderKg, setMinOrderKg] = useState(500)
  const [isActive, setIsActive] = useState(true)
  const [isFeatured, setIsFeatured] = useState(false)
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const [images, setImages] = useState<ProductImage[]>([])

  const sensors = useSensors(useSensor(PointerSensor))

  useEffect(() => {
    if (isNew) {
      fetch('/api/admin/categories')
        .then(r => r.json())
        .then(d => setCategories(d.categories || []))
        .finally(() => setLoading(false))
      return
    }
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch(`/api/admin/products/${id}`),
        fetch('/api/admin/categories'),
      ])
      if (!prodRes.ok) {
        const errData = await prodRes.json().catch(() => ({}))
        setProduct(null)
        return
      }
      const { product: p } = await prodRes.json()
      if (!p || !p.name) {
        setProduct(null)
        return
      }
      const { categories: cats } = await catRes.json()
      setProduct(p)
      setCategories(cats || [])
      // Populate form
      setName(p.name)
      setScientificName(p.scientificName || '')
      setSlug(p.slug)
      setShortDescription(p.shortDescription || '')
      setDescription(p.description || '')
      setOrganicType(p.organicType || '')
      setConventionalType(p.conventionalType || '')
      setMinOrderKg(p.minOrderKg)
      setIsActive(p.isActive)
      setIsFeatured(p.isFeatured)
      setSelectedCategoryIds(p.categories.map((pc: { category: Category }) => pc.category.id))
      setImages(p.images)
    } catch (err) {
      console.error('Failed to fetch product', err)
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { Promise.resolve().then(fetchProduct) }, [id])

  const handleSave = async () => {
    setSaving(true)
    try {
      const method = isNew ? 'POST' : 'PATCH'
      const url = isNew ? '/api/admin/products' : `/api/admin/products/${id}`
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          scientificName: scientificName.trim() || null,
          slug: slug.trim() || null,
          shortDescription: shortDescription.trim() || null,
          description: description.trim() || null,
          isOrganic: !!organicType.trim(),
          organicType: organicType.trim() || null,
          conventionalType: conventionalType.trim() || null,
          minOrderKg: Number(minOrderKg),
          isActive,
          isFeatured,
          categoryIds: selectedCategoryIds,
        }),
      })
      if (res.ok) {
        toast.success(isNew ? 'Product created' : 'Product saved')
        if (isNew) {
          const { product } = await res.json()
          router.push(`/admin/dashboard/products/${product.id}`)
        } else {
          fetchProduct()
        }
      } else {
        const data = await res.json()
        toast.error(data.error || 'Save failed')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleAddImage = async (media: MediaFile) => {
    const res = await fetch(`/api/admin/products/${id}/images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mediaFileId: media.id, isPrimary: images.length === 0 }),
    })
    if (res.ok) {
      toast.success('Image added')
      fetchProduct()
    } else {
      toast.error('Failed to add image')
    }
  }

  const handleSetPrimary = async (imageId: string) => {
    await fetch(`/api/admin/products/${id}/images/${imageId}`, { method: 'PATCH' })
    toast.success('Primary image updated')
    fetchProduct()
  }

  const handleDeleteImage = async (imageId: string) => {
    await fetch(`/api/admin/products/${id}/images/${imageId}`, { method: 'DELETE' })
    toast.success('Image removed')
    fetchProduct()
  }

  const handleImageDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = images.findIndex(i => i.id === active.id)
    const newIndex = images.findIndex(i => i.id === over.id)
    const reordered = arrayMove(images, oldIndex, newIndex)
    setImages(reordered)
    await fetch(`/api/admin/products/${id}/images`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: reordered.map(i => i.id) }),
    })
  }

  const toggleCategory = (catId: string) => {
    setSelectedCategoryIds(prev =>
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (isNew) {
    // Render empty create form below
  } else if (!product) {
    return (
      <div className="p-6 text-center text-neutral-500">
        <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-30" />
        <p>Product not found.</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/admin/dashboard/products')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Products
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold font-heading truncate">{isNew ? 'New Product' : product!.name}</h1>
          {!isNew && <p className="text-xs text-neutral-400 mt-0.5">/{product!.slug}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isActive ? 'default' : 'secondary'}>{isActive ? 'Active' : 'Draft'}</Badge>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — main fields */}
        <div className="lg:col-span-2 space-y-5">
          {/* Basic Info */}
          <div className="bg-white border rounded-xl p-5 space-y-4">
            <h2 className="font-semibold text-neutral-800">Basic Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="prod-name">Product Name *</Label>
                <Input id="prod-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Dried Calendula Flowers" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prod-sci">Scientific Name</Label>
                <Input id="prod-sci" value={scientificName} onChange={e => setScientificName(e.target.value)} placeholder="e.g. Calendula officinalis" className="italic" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prod-slug">URL Slug</Label>
                <Input id="prod-slug" value={slug} onChange={e => setSlug(e.target.value)} placeholder="auto-generated" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="prod-short">Short Description</Label>
                <Textarea
                  id="prod-short"
                  value={shortDescription}
                  onChange={e => setShortDescription(e.target.value)}
                  placeholder="Premium quality organic dried Calendula flowers (Calendula officinalis), carefully harvested and sun-dried in Morocco. Rich in flavonoids and carotenoids. Ideal for herbal tea blends, cosmetic formulations, and pharmaceutical applications."
                  rows={2}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="prod-desc">Full Description</Label>
                <Textarea
                  id="prod-desc"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="<h3>Product Origin</h3>\n<p>Sourced from organic farms in the Atlas Mountains of Morocco, our Calendula flowers are hand-picked at peak bloom and naturally dried under controlled conditions.</p>\n\n<h3>Quality Specifications</h3>\n<ul>\n  <li>Moisture: &lt; 12%</li>\n  <li>Ash content: &lt; 10%</li>\n  <li>No artificial additives or preservatives</li>\n  <li>EU Organic Certified (ECO-XXX-XX)</li>\n</ul>\n\n<h3>Packaging</h3>\n<p>Available in 10kg, 25kg, and 50kg bags. Custom packaging available upon request.</p>"
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white border rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-neutral-800">Product Images</h2>
              {!isNew && (
                <Button size="sm" variant="outline" onClick={() => setMediaPicker(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Image
                </Button>
              )}
            </div>
            {isNew ? (
              <div className="border-2 border-dashed border-neutral-200 rounded-lg p-8 text-center text-neutral-400">
                <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Save the product first, then add images</p>
              </div>
            ) : images.length === 0 ? (
              <div
                className="border-2 border-dashed border-neutral-200 rounded-lg p-8 text-center text-neutral-400 cursor-pointer hover:border-primary/40 hover:text-primary/60 transition-colors"
                onClick={() => setMediaPicker(true)}
              >
                <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Click to add product images</p>
                <p className="text-xs mt-1">First image becomes the primary image</p>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleImageDragEnd}>
                <SortableContext items={images.map(i => i.id)} strategy={horizontalListSortingStrategy}>
                  <div className="flex gap-3 flex-wrap">
                    {images.map(img => (
                      <SortableImage
                        key={img.id}
                        img={img}
                        onSetPrimary={handleSetPrimary}
                        onDelete={handleDeleteImage}
                      />
                    ))}
                    <button
                      onClick={() => setMediaPicker(true)}
                      className="w-28 h-28 border-2 border-dashed border-neutral-200 rounded-lg flex flex-col items-center justify-center text-neutral-400 hover:border-primary/40 hover:text-primary/60 transition-colors shrink-0"
                    >
                      <Plus className="h-5 w-5" />
                      <span className="text-xs mt-1">Add</span>
                    </button>
                  </div>
                </SortableContext>
              </DndContext>
            )}
            {!isNew && <p className="text-xs text-neutral-400">Drag to reorder · ★ star to set primary · hover to delete</p>}
          </div>

          {/* Trade Details */}
          <div className="bg-white border rounded-xl p-5 space-y-4">
            <h2 className="font-semibold text-neutral-800">Trade Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="prod-moq">Minimum Order (kg)</Label>
                <Input
                  id="prod-moq"
                  type="number"
                  min={1}
                  value={minOrderKg}
                  onChange={e => setMinOrderKg(parseInt(e.target.value) || 500)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:col-span-2">
                <div className="space-y-1.5">
                  <Label htmlFor="prod-orgtype" className="flex items-center gap-1.5">
                    <Leaf className="h-4 w-4 text-green-600" />
                    Organic Certification
                  </Label>
                  <Input
                    id="prod-orgtype"
                    value={organicType}
                    onChange={e => setOrganicType(e.target.value)}
                    placeholder="e.g. EU, NOP, COR, BIO_SUISSE... (leave empty if not organic)"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prod-convtype" className="flex items-center gap-1.5">
                    <Leaf className="h-4 w-4 text-amber-600" />
                    Conventional Type
                  </Label>
                  <Input
                    id="prod-convtype"
                    value={conventionalType}
                    onChange={e => setConventionalType(e.target.value)}
                    placeholder="e.g. NORMAL, EU_LIMITS... (leave empty if not conventional)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right — sidebar */}
        <div className="space-y-5">
          {/* Visibility */}
          <div className="bg-white border rounded-xl p-5 space-y-4">
            <h2 className="font-semibold text-neutral-800">Visibility</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="prod-active" className="cursor-pointer">
                  <span className="font-medium">Active</span>
                  <p className="text-xs text-neutral-400 mt-0.5">Visible on website</p>
                </Label>
                <Switch id="prod-active" checked={isActive} onCheckedChange={setIsActive} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="prod-featured" className="cursor-pointer">
                  <span className="font-medium">Featured</span>
                  <p className="text-xs text-neutral-400 mt-0.5">Shown on homepage</p>
                </Label>
                <Switch id="prod-featured" checked={isFeatured} onCheckedChange={setIsFeatured} />
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white border rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-neutral-800">Categories</h2>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => router.push('/admin/dashboard/products/categories')}
              >
                <Tag className="h-3.5 w-3.5" />
              </Button>
            </div>
            {categories.length === 0 ? (
              <p className="text-sm text-neutral-400">No categories yet.</p>
            ) : (
              <div className="space-y-2">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`cat-${cat.id}`}
                      checked={selectedCategoryIds.includes(cat.id)}
                      onCheckedChange={() => toggleCategory(cat.id)}
                    />
                    <Label htmlFor={`cat-${cat.id}`} className="cursor-pointer font-normal">
                      {cat.name}
                    </Label>
                    {selectedCategoryIds.includes(cat.id) && (
                      <Check className="h-3.5 w-3.5 text-green-500 ml-auto" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick save */}
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>

      <MediaPicker
        open={mediaPicker}
        onOpenChange={setMediaPicker}
        onSelect={handleAddImage}
        filterType="IMAGE"
      />
    </div>
  )
}
