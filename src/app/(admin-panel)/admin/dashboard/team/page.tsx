'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Plus, Users, GripVertical, Trash2, Pencil, Loader2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { TeamMember, MediaFile, ContactType } from '@prisma/client'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove, SortableContext, verticalListSortingStrategy, useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type MemberRow = TeamMember & {
  photo: { url: string } | null
  contacts: { id: string, type: ContactType, value: string }[]
}

export default function TeamPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'TEAM' | 'BOARD'>('TEAM')
  const [members, setMembers] = useState<MemberRow[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/team?type=${activeTab}`)
      const data = await res.json()
      setMembers(data.members || [])
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const handleCreate = async () => {
    const name = prompt(`Enter ${activeTab.toLowerCase()} member name:`)
    if (!name?.trim()) return
    const title = prompt(`Enter ${activeTab.toLowerCase()} member title:`)
    if (!title?.trim()) return

    const res = await fetch('/api/admin/team', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), title: title.trim(), memberType: activeTab })
    })

    if (res.ok) {
      const { member } = await res.json()
      toast.success('Member created')
      router.push(`/admin/dashboard/team/${member.id}`)
    } else {
      toast.error('Failed to create member')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return
    const res = await fetch(`/api/admin/team/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Member deleted')
      fetchMembers()
    } else {
      toast.error('Failed to delete member')
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = members.findIndex(m => m.id === active.id)
    const newIndex = members.findIndex(m => m.id === over.id)

    const newMembers = arrayMove(members, oldIndex, newIndex)
    setMembers(newMembers)

    const updates = newMembers.map((m, i) => ({ id: m.id, order: i }))
    const res = await fetch('/api/admin/team/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })

    if (!res.ok) {
      toast.error('Failed to save order')
      fetchMembers()
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading">Team & Board</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage personnel and board of directors</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </div>

      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('TEAM')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'TEAM' ? 'border-green-600 text-green-700' : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Team Members
        </button>
        <button
          onClick={() => setActiveTab('BOARD')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'BOARD' ? 'border-green-600 text-green-700' : 'border-transparent text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Board of Directors
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-green-600" />
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-16 bg-neutral-50 rounded-xl border border-dashed">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-lg font-medium text-neutral-600">No {activeTab.toLowerCase()} members</p>
          <p className="text-sm text-neutral-400 mt-1">Add your first member to get started.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={members.map(m => m.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {members.map(member => (
                <SortableMemberRow 
                  key={member.id} 
                  member={member} 
                  onEdit={() => router.push(`/admin/dashboard/team/${member.id}`)}
                  onDelete={() => handleDelete(member.id, member.name)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

function SortableMemberRow({ member, onEdit, onDelete }: { member: MemberRow, onEdit: () => void, onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: member.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-4 bg-white border rounded-xl p-3 ${isDragging ? 'shadow-lg border-green-300' : 'shadow-sm'}`}>
      <div {...attributes} {...listeners} className="cursor-grab text-neutral-400 hover:text-neutral-600 p-1">
        <GripVertical className="w-5 h-5" />
      </div>

      <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-100 border shrink-0">
        {member.photo?.url ? (
          <Image src={member.photo.url} alt={member.name} width={48} height={48} className="object-cover w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-300">
            <Users className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-neutral-900 truncate">{member.name}</div>
        <div className="text-sm text-neutral-500 truncate">{member.title}</div>
      </div>

      <div className="flex items-center gap-3">
        {!member.isActive && <Badge variant="secondary" className="bg-neutral-100 text-neutral-500">Inactive</Badge>}
        
        <Button size="sm" variant="ghost" onClick={onEdit}>
          <Pencil className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={onDelete} className="text-red-500 hover:text-red-600 hover:bg-red-50">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
