'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Plus, Search, Filter, Pencil, Trash2, Loader2, ShoppingBag,
  Eye, EyeOff, Star, StarOff, Leaf, MoreVertical, Tag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Category } from '@prisma/client'

type ProductRow = {
  id: string
  name: string
  scientificName: string | null
  slug: string
  shortDescription: string | null
  isOrganic: boolean
  organicType: string | null
  conventionalType: string | null
  minOrderKg: number
  isActive: boolean
  isFeatured: boolean
  order: number
  categories: { category: Category }[]
  images: { mediaFile: { url: string } | null; isPrimary: boolean }[]
}

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<ProductRow[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchProducts = useCallback(async () => {
    try {
      const url = new URL('/api/admin/products', window.location.origin)
      url.searchParams.set('page', page.toString())
      if (search) url.searchParams.set('search', search)
      if (statusFilter !== 'all') url.searchParams.set('status', statusFilter)
      if (categoryFilter !== 'all') url.searchParams.set('categoryId', categoryFilter)
      const res = await fetch(url.toString())
      const data = await res.json()
      setProducts(data.products || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, categoryFilter])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  useEffect(() => {
    fetch('/api/admin/categories')
      .then(r => r.json())
      .then(d => setCategories(d.categories || []))
  }, [])

  const handleCreate = async () => {
    const name = prompt('Product name:')
    if (!name?.trim()) return
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim() }),
    })
    if (res.ok) {
      const { product } = await res.json()
      toast.success('Product created')
      router.push(`/admin/dashboard/products/${product.id}`)
    } else {
      toast.error('Failed to create product')
    }
  }

  const handleToggleActive = async (p: ProductRow) => {
    await fetch(`/api/admin/products/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !p.isActive }),
    })
    toast.success(p.isActive ? 'Product deactivated' : 'Product activated')
    fetchProducts()
  }

  const handleToggleFeatured = async (p: ProductRow) => {
    await fetch(`/api/admin/products/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isFeatured: !p.isFeatured }),
    })
    toast.success(p.isFeatured ? 'Removed from featured' : 'Added to featured')
    fetchProducts()
  }

  const handleDelete = async (p: ProductRow) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return
    const res = await fetch(`/api/admin/products/${p.id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Product deleted')
      fetchProducts()
    } else {
      toast.error('Failed to delete product')
    }
  }

  const primaryImage = (p: ProductRow) => p.images.find(i => i.isPrimary)?.mediaFile?.url || p.images[0]?.mediaFile?.url

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Products</h1>
          <p className="text-sm text-neutral-500 mt-1">{total} product{total !== 1 ? 's' : ''} total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/admin/dashboard/products/categories')}>
            <Tag className="h-4 w-4 mr-2" />
            Categories
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            New Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Search by name or scientific name..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            className="pl-9"
          />
        </div>
        <Select aria-label="Filter by status" value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2 text-neutral-400" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select aria-label="Filter by category" value={categoryFilter} onValueChange={v => { setCategoryFilter(v); setPage(1) }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-neutral-400">
          <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No products found</p>
          <p className="text-sm mt-1">Try adjusting your filters or create a new product.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3 w-16">Image</th>
                <th className="text-left px-4 py-3">Product</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Categories</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Min Order</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map(product => {
                const thumb = primaryImage(product)
                return (
                  <tr key={product.id} className="hover:bg-neutral-50 transition-colors group">
                    {/* Thumbnail */}
                    <td className="px-4 py-3">
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-neutral-100 border shrink-0">
                        {thumb ? (
                          <Image src={thumb} alt={product.name} width={48} height={48} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="h-5 w-5 text-neutral-300" />
                          </div>
                        )}
                      </div>
                    </td>
                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="font-medium text-neutral-900">{product.name}</div>
                      {product.scientificName && (
                        <div className="text-xs text-neutral-400 italic mt-0.5">{product.scientificName}</div>
                      )}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {product.organicType && (
                          <span className="inline-flex items-center gap-0.5 text-xs text-green-700 font-medium">
                            <Leaf className="h-3 w-3 text-green-600" />
                            Organic · {product.organicType}
                          </span>
                        )}
                        {product.conventionalType && (
                          <span className="inline-flex items-center gap-0.5 text-xs text-amber-700 font-medium">
                            <Leaf className="h-3 w-3 text-amber-600" />
                            Conventional · {product.conventionalType}
                          </span>
                        )}
                      </div>
                    </td>
                    {/* Categories */}
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {product.categories.length === 0 ? (
                          <span className="text-neutral-300 text-xs">—</span>
                        ) : product.categories.map(pc => (
                          <Badge key={pc.category.id} variant="secondary" className="text-xs">
                            {pc.category.name}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    {/* Min order */}
                    <td className="px-4 py-3 hidden md:table-cell text-neutral-600">
                      {product.minOrderKg.toLocaleString()} kg
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <Badge variant={product.isActive ? 'default' : 'secondary'} className="w-fit text-xs">
                          {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {product.isFeatured && (
                          <Badge className="w-fit text-xs bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/admin/dashboard/products/${product.id}`)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <MoreVertical className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleToggleActive(product)}>
                              {product.isActive ? (
                                <><EyeOff className="h-4 w-4 mr-2" /> Deactivate</>
                              ) : (
                                <><Eye className="h-4 w-4 mr-2" /> Activate</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleFeatured(product)}>
                              {product.isFeatured ? (
                                <><StarOff className="h-4 w-4 mr-2" /> Unfeature</>
                              ) : (
                                <><Star className="h-4 w-4 mr-2" /> Feature</>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(product)}
                              className="text-red-600 focus:text-red-600 focus:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
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
