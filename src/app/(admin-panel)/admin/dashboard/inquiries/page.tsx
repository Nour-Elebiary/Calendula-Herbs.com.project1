'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  MessageSquare, ShoppingCart, Leaf, Mail,
  Globe, Loader2, Trash2, Eye, EyeOff, CheckCheck, Clock,
  Package, ChevronDown, ChevronUp, FileSearch
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

// ─── Types ────────────────────────────────────────────────────────────────────

type ContactSubmission = {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  country: string | null
  subject: string | null
  message: string
  isRead: boolean
  createdAt: string
}

type CartInquiry = {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  country: string | null
  notes: string | null
  itemsJson: string
  isRead: boolean
  createdAt: string
}

type SampleRequest = {
  id: string
  productName: string
  quantity: string | null
  name: string
  email: string
  company: string | null
  address: string | null
  shippingBy: string
  notes: string | null
  isRead: boolean
  createdAt: string
}

type ProductRequest = {
  id: string
  productName: string
  productDescription: string | null
  quantity: string | null
  name: string
  email: string
  phone: string | null
  company: string | null
  country: string | null
  usage: string | null
  notes: string | null
  isRead: boolean
  createdAt: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(d: string) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(d))
}

function UnreadDot() {
  return <span className="inline-block w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
}

// ─── Expandable card shared component ────────────────────────────────────────

function InquiryCard({ isRead, isExpanded, onToggle, header, children, onMarkRead, onDelete }: {
  isRead: boolean
  isExpanded: boolean
  onToggle: () => void
  header: React.ReactNode
  children: React.ReactNode
  onMarkRead: () => void
  onDelete: () => void
}) {
  return (
    <div className={`bg-white border rounded-xl overflow-hidden transition-all ${!isRead ? 'border-primary/30 shadow-sm' : ''}`}>
      <div
        className="flex items-start gap-3 p-4 cursor-pointer hover:bg-neutral-50 transition-colors"
        onClick={onToggle}
      >
        {!isRead && <UnreadDot />}
        <div className="flex-1 min-w-0">{header}</div>
        <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation() }}>
          <Button size="sm" variant="ghost" onClick={onMarkRead} title={isRead ? 'Mark unread' : 'Mark read'}>
            {isRead ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete} className="text-red-500 hover:bg-red-50">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          {isExpanded ? <ChevronUp className="h-4 w-4 text-neutral-400 ml-1" /> : <ChevronDown className="h-4 w-4 text-neutral-400 ml-1" />}
        </div>
      </div>
      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t bg-neutral-50 space-y-2">
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Tab: Contact Submissions ─────────────────────────────────────────────────

function ContactTab() {
  const [items, setItems] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  const fetch_ = useCallback(async () => {
    const url = `/api/admin/inquiries/contact?page=${page}${unreadOnly ? '&unread=true' : ''}`
    const res = await fetch(url)
    const data = await res.json()
    setItems(data.submissions || [])
    setTotalPages(data.totalPages || 1)
    setLoading(false)
  }, [page, unreadOnly])

  useEffect(() => { Promise.resolve().then(fetch_) }, [fetch_])

  const markRead = async (id: string, isRead: boolean) => {
    await fetch(`/api/admin/inquiries/contact/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isRead: !isRead }),
    })
    fetch_()
  }

  const del = async (id: string) => {
    if (!confirm('Delete this submission?')) return
    await fetch(`/api/admin/inquiries/contact/${id}`, { method: 'DELETE' })
    toast.success('Deleted')
    fetch_()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          variant={unreadOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setUnreadOnly(!unreadOnly); setPage(1) }}
        >
          {unreadOnly ? <CheckCheck className="h-3.5 w-3.5 mr-1.5" /> : <Mail className="h-3.5 w-3.5 mr-1.5" />}
          {unreadOnly ? 'Showing unread only' : 'Show unread only'}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No submissions yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <InquiryCard
              key={item.id}
              isRead={item.isRead}
              isExpanded={expanded === item.id}
              onToggle={() => setExpanded(expanded === item.id ? null : item.id)}
              onMarkRead={() => markRead(item.id, item.isRead)}
              onDelete={() => del(item.id)}
              header={
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-neutral-900">{item.name}</span>
                    {item.company && <span className="text-xs text-neutral-400">· {item.company}</span>}
                    {!item.isRead && <Badge className="text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">New</Badge>}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{item.email}</span>
                    {item.country && <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{item.country}</span>}
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(item.createdAt)}</span>
                  </div>
                  {item.subject && <p className="text-sm text-neutral-600 mt-1 font-medium">{item.subject}</p>}
                </div>
              }
            >
              <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                {item.phone && <div><span className="text-neutral-400">Phone:</span> {item.phone}</div>}
                {item.country && <div><span className="text-neutral-400">Country:</span> {item.country}</div>}
              </div>
              <div className="text-sm text-neutral-700 whitespace-pre-wrap bg-white border rounded-lg p-3 mt-2">
                {item.message}
              </div>
              <div className="flex gap-2 mt-2">
                <a href={`mailto:${item.email}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                  <Mail className="h-3 w-3" /> Reply via Email
                </a>
              </div>
            </InquiryCard>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
          <span className="text-sm text-neutral-500">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
        </div>
      )}
    </div>
  )
}

// ─── Tab: Cart Inquiries ──────────────────────────────────────────────────────

function CartTab() {
  const [items, setItems] = useState<CartInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  const fetch_ = useCallback(async () => {
    const url = `/api/admin/inquiries/cart?page=${page}${unreadOnly ? '&unread=true' : ''}`
    const res = await fetch(url)
    const data = await res.json()
    setItems(data.inquiries || [])
    setTotalPages(data.totalPages || 1)
    setLoading(false)
  }, [page, unreadOnly])

  useEffect(() => { Promise.resolve().then(fetch_) }, [fetch_])

  const markRead = async (id: string, isRead: boolean) => {
    await fetch(`/api/admin/inquiries/cart/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isRead: !isRead }),
    })
    fetch_()
  }

  const del = async (id: string) => {
    if (!confirm('Delete this inquiry?')) return
    await fetch(`/api/admin/inquiries/cart/${id}`, { method: 'DELETE' })
    toast.success('Deleted')
    fetch_()
  }

  const parseItems = (json: string) => {
    try { return JSON.parse(json) as { productId: string; productName: string; quantity: number }[] }
    catch { return [] }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          variant={unreadOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setUnreadOnly(!unreadOnly); setPage(1) }}
        >
          {unreadOnly ? <CheckCheck className="h-3.5 w-3.5 mr-1.5" /> : <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />}
          {unreadOnly ? 'Showing unread only' : 'Show unread only'}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No cart inquiries yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => {
            const cartItems = parseItems(item.itemsJson)
            return (
              <InquiryCard
                key={item.id}
                isRead={item.isRead}
                isExpanded={expanded === item.id}
                onToggle={() => setExpanded(expanded === item.id ? null : item.id)}
                onMarkRead={() => markRead(item.id, item.isRead)}
                onDelete={() => del(item.id)}
                header={
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-neutral-900">{item.name}</span>
                      {item.company && <span className="text-xs text-neutral-400">· {item.company}</span>}
                      {!item.isRead && <Badge className="text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">New</Badge>}
                      <Badge variant="secondary" className="text-xs">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{item.email}</span>
                      {item.country && <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{item.country}</span>}
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(item.createdAt)}</span>
                    </div>
                  </div>
                }
              >
                {/* Cart items list */}
                <div className="bg-white border rounded-lg overflow-hidden mt-2">
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-50 text-xs text-neutral-500 uppercase">
                      <tr>
                        <th className="text-left px-3 py-2">Product</th>
                        <th className="text-left px-3 py-2">Quantity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {cartItems.map((ci, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2 font-medium">{ci.productName}</td>
                          <td className="px-3 py-2 text-neutral-600">{ci.quantity} kg</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs mt-2">
                  {item.phone && <div><span className="text-neutral-400">Phone:</span> {item.phone}</div>}
                  {item.country && <div><span className="text-neutral-400">Country:</span> {item.country}</div>}
                </div>
                {item.notes && (
                  <div className="text-sm text-neutral-700 bg-white border rounded-lg p-3 mt-1 whitespace-pre-wrap">{item.notes}</div>
                )}
                <div className="flex gap-2 mt-2">
                  <a href={`mailto:${item.email}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Reply via Email
                  </a>
                </div>
              </InquiryCard>
            )
          })}
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
          <span className="text-sm text-neutral-500">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
        </div>
      )}
    </div>
  )
}

// ─── Tab: Sample Requests ─────────────────────────────────────────────────────

function SamplesTab() {
  const [items, setItems] = useState<SampleRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  const fetch_ = useCallback(async () => {
    const url = `/api/admin/inquiries/samples?page=${page}${unreadOnly ? '&unread=true' : ''}`
    const res = await fetch(url)
    const data = await res.json()
    setItems(data.requests || [])
    setTotalPages(data.totalPages || 1)
    setLoading(false)
  }, [page, unreadOnly])

  useEffect(() => { Promise.resolve().then(fetch_) }, [fetch_])

  const markRead = async (id: string, isRead: boolean) => {
    await fetch(`/api/admin/inquiries/samples/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isRead: !isRead }),
    })
    fetch_()
  }

  const del = async (id: string) => {
    if (!confirm('Delete this sample request?')) return
    await fetch(`/api/admin/inquiries/samples/${id}`, { method: 'DELETE' })
    toast.success('Deleted')
    fetch_()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          variant={unreadOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setUnreadOnly(!unreadOnly); setPage(1) }}
        >
          {unreadOnly ? <CheckCheck className="h-3.5 w-3.5 mr-1.5" /> : <Package className="h-3.5 w-3.5 mr-1.5" />}
          {unreadOnly ? 'Showing unread only' : 'Show unread only'}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <Leaf className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No sample requests yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <InquiryCard
              key={item.id}
              isRead={item.isRead}
              isExpanded={expanded === item.id}
              onToggle={() => setExpanded(expanded === item.id ? null : item.id)}
              onMarkRead={() => markRead(item.id, item.isRead)}
              onDelete={() => del(item.id)}
              header={
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-neutral-900">{item.name}</span>
                    {item.company && <span className="text-xs text-neutral-400">· {item.company}</span>}
                    {!item.isRead && <Badge className="text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">New</Badge>}
                    <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                      <Leaf className="h-3 w-3 mr-1 inline" />{item.productName}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{item.email}</span>
                    {item.quantity && <span className="flex items-center gap-1"><Package className="h-3 w-3" />{item.quantity}</span>}
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(item.createdAt)}</span>
                  </div>
                </div>
              }
            >
              <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                <div><span className="text-neutral-400">Product:</span> <strong>{item.productName}</strong></div>
                {item.quantity && <div><span className="text-neutral-400">Quantity:</span> {item.quantity}</div>}
                <div><span className="text-neutral-400">Shipping by:</span> {item.shippingBy === 'buyer' ? 'Buyer' : 'Calendula Herbs'}</div>
                {item.company && <div><span className="text-neutral-400">Company:</span> {item.company}</div>}
                {item.address && <div className="col-span-2"><span className="text-neutral-400">Address:</span> {item.address}</div>}
              </div>
              {item.notes && (
                <div className="text-sm text-neutral-700 bg-white border rounded-lg p-3 mt-2 whitespace-pre-wrap">{item.notes}</div>
              )}
              <div className="flex gap-2 mt-2">
                <a href={`mailto:${item.email}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                  <Mail className="h-3 w-3" /> Reply via Email
                </a>
              </div>
            </InquiryCard>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
          <span className="text-sm text-neutral-500">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
        </div>
      )}
    </div>
  )
}

// ─── Tab: Product Requests ─────────────────────────────────────────────────────

function ProductRequestsTab() {
  const [items, setItems] = useState<ProductRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  const fetch_ = useCallback(async () => {
    const url = `/api/admin/inquiries/product-requests?page=${page}${unreadOnly ? '&unread=true' : ''}`
    const res = await fetch(url)
    const data = await res.json()
    setItems(data.requests || [])
    setTotalPages(data.totalPages || 1)
    setLoading(false)
  }, [page, unreadOnly])

  useEffect(() => { Promise.resolve().then(fetch_) }, [fetch_])

  const markRead = async (id: string, isRead: boolean) => {
    await fetch(`/api/admin/inquiries/product-requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isRead: !isRead }),
    })
    fetch_()
  }

  const del = async (id: string) => {
    if (!confirm('Delete this product request?')) return
    await fetch(`/api/admin/inquiries/product-requests/${id}`, { method: 'DELETE' })
    toast.success('Deleted')
    fetch_()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          variant={unreadOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => { setUnreadOnly(!unreadOnly); setPage(1) }}
        >
          {unreadOnly ? <CheckCheck className="h-3.5 w-3.5 mr-1.5" /> : <FileSearch className="h-3.5 w-3.5 mr-1.5" />}
          {unreadOnly ? 'Showing unread only' : 'Show unread only'}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <FileSearch className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No product requests yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <InquiryCard
              key={item.id}
              isRead={item.isRead}
              isExpanded={expanded === item.id}
              onToggle={() => setExpanded(expanded === item.id ? null : item.id)}
              onMarkRead={() => markRead(item.id, item.isRead)}
              onDelete={() => del(item.id)}
              header={
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-neutral-900">{item.name}</span>
                    {item.company && <span className="text-xs text-neutral-400">· {item.company}</span>}
                    {!item.isRead && <Badge className="text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">New</Badge>}
                    <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                      <FileSearch className="h-3 w-3 mr-1 inline" />{item.productName}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{item.email}</span>
                    {item.country && <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{item.country}</span>}
                    {item.quantity && <span className="flex items-center gap-1"><Package className="h-3 w-3" />{item.quantity}</span>}
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{formatDate(item.createdAt)}</span>
                  </div>
                </div>
              }
            >
              <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                <div className="col-span-2"><span className="text-neutral-400">Product:</span> <strong>{item.productName}</strong></div>
                {item.productDescription && <div className="col-span-2"><span className="text-neutral-400">Description:</span> {item.productDescription}</div>}
                {item.quantity && <div><span className="text-neutral-400">Quantity:</span> {item.quantity}</div>}
                {item.usage && <div><span className="text-neutral-400">Intended Use:</span> {item.usage}</div>}
                {item.phone && <div><span className="text-neutral-400">Phone:</span> {item.phone}</div>}
                {item.company && <div><span className="text-neutral-400">Company:</span> {item.company}</div>}
                {item.country && <div><span className="text-neutral-400">Country:</span> {item.country}</div>}
              </div>
              {item.notes && (
                <div className="text-sm text-neutral-700 bg-white border rounded-lg p-3 mt-2 whitespace-pre-wrap">{item.notes}</div>
              )}
              <div className="flex gap-2 mt-2">
                <a href={`mailto:${item.email}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                  <Mail className="h-3 w-3" /> Reply via Email
                </a>
              </div>
            </InquiryCard>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
          <span className="text-sm text-neutral-500">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type TabId = 'contact' | 'cart' | 'samples' | 'product-requests'

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'contact', label: 'Contact Submissions', icon: MessageSquare },
  { id: 'cart', label: 'Cart Inquiries', icon: ShoppingCart },
  { id: 'samples', label: 'Sample Requests', icon: Leaf },
  { id: 'product-requests', label: 'Product Requests', icon: FileSearch },
]

export default function InquiriesPage() {
  const [activeTab, setActiveTab] = useState<TabId>('contact')

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Inquiries</h1>
        <p className="text-sm text-neutral-500 mt-1">Customer contact forms, cart inquiries, and sample requests</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'contact' && <ContactTab />}
      {activeTab === 'cart' && <CartTab />}
      {activeTab === 'samples' && <SamplesTab />}
      {activeTab === 'product-requests' && <ProductRequestsTab />}
    </div>
  )
}
