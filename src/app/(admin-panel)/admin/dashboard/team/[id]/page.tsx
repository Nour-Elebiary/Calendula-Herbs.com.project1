'use client'

import React, { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Save, Loader2, Plus, Trash2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { MediaPicker } from '@/components/admin/media/MediaPicker'
import { IconPicker } from '@/components/ui/icon-picker'
import { getContactTypeIcon, CONTACT_TYPE_ICONS } from '@/lib/icon-map'
import { TeamMember, ContactType, MediaFile } from '@prisma/client'

type Contact = {
  id?: string
  type: ContactType
  label: string | null
  value: string
  icon: string | null
}

type MemberData = TeamMember & {
  photo: MediaFile | null
  contacts: Contact[]
}

const CONTACT_TYPES: ContactType[] = ['EMAIL', 'PHONE', 'LINKEDIN', 'TWITTER', 'WHATSAPP', 'FACEBOOK', 'INSTAGRAM', 'TELEGRAM', 'VIBER', 'WECHAT', 'SIGNAL', 'MESSENGER', 'LINE', 'DISCORD', 'YOUTUBE', 'TIKTOK', 'SNAPCHAT', 'WEBSITE', 'OTHER']

export default function EditTeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  
  const [member, setMember] = useState<MemberData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showMediaPicker, setShowMediaPicker] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/team/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.member) setMember(d.member)
        setLoading(false)
      })
      .catch(() => {
        toast.error('Failed to load member')
        setLoading(false)
      })
  }, [id])

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-green-600" /></div>
  if (!member) return <div className="text-center py-20">Member not found</div>

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/team/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: member.name,
          title: member.title,
          bio: member.bio,
          isActive: member.isActive,
          photoId: member.photoId,
          memberType: member.memberType,
          contacts: member.contacts
        })
      })

      if (res.ok) {
        toast.success('Member updated successfully')
        router.push('/admin/dashboard/team')
      } else {
        toast.error('Failed to update member')
      }
    } finally {
      setSaving(false)
    }
  }

  const updateContact = (index: number, updates: Partial<Contact>) => {
    const newContacts = [...member.contacts]
    newContacts[index] = { ...newContacts[index], ...updates }
    setMember({ ...member, contacts: newContacts })
  }

  const removeContact = (index: number) => {
    const newContacts = [...member.contacts]
    newContacts.splice(index, 1)
    setMember({ ...member, contacts: newContacts })
  }

  const addContact = () => {
    setMember({ ...member, contacts: [...member.contacts, { type: 'EMAIL', label: null, value: '', icon: null }] })
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/dashboard/team')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-heading">Edit Member</h1>
            <p className="text-sm text-neutral-500 mt-1">{member.memberType} • {member.id}</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6 bg-white p-6 rounded-xl border shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="member-name">Name</Label>
              <Input id="member-name" value={member.name} onChange={e => setMember({ ...member, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="member-title">Title / Role</Label>
              <Input id="member-title" value={member.title} onChange={e => setMember({ ...member, title: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea 
              value={member.bio || ''} 
              onChange={e => setMember({ ...member, bio: e.target.value })} 
              rows={4}
              placeholder="Sarah has over 15 years of experience in the herbal exports industry. She leads our quality assurance team, ensuring all products meet EU and USDA organic standards. Sarah holds a degree in Botany from the University of Marrakech."
            />
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-base">Contacts & Social Links</Label>
              <Button size="sm" variant="outline" onClick={addContact}>
                <Plus className="w-4 h-4 mr-2" /> Add Link
              </Button>
            </div>
            
            <div className="space-y-3">
              {member.contacts.length === 0 && (
                <div className="text-sm text-neutral-500 italic py-4">No contacts added yet.</div>
              )}
              {member.contacts.map((contact, i) => {
                const Icon = getContactTypeIcon(contact.icon || contact.type)
                return (
                  <div key={i} className="flex items-start gap-3 bg-neutral-50 p-3 rounded-lg border">
                    {/* Icon preview + picker */}
                    <div className="space-y-2 w-16 shrink-0">
                      <Label className="text-xs">Icon</Label>
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-9 h-9 rounded-full bg-white border flex items-center justify-center text-neutral-600">
                          <Icon className="w-4 h-4" />
                        </div>
                        <IconPicker
                          value={contact.icon || CONTACT_TYPE_ICONS[contact.type] || null}
                          onChange={(name) => updateContact(i, { icon: name })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2 w-28 shrink-0">
                      <Label className="text-xs">Type</Label>
                      <Select aria-label="Contact type" value={contact.type} onValueChange={(v: ContactType) => updateContact(i, { type: v })}>
                        <SelectTrigger aria-label="Contact type" className="h-8 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CONTACT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 flex-1">
                      <Label htmlFor={`contact-value-${i}`} className="text-xs">Value (URL, Email, Phone)</Label>
                      <Input id={`contact-value-${i}`} value={contact.value} onChange={e => updateContact(i, { value: e.target.value })} placeholder="e.g. https://linkedin.com/in/..." className="h-8 text-xs" />
                    </div>
                    <div className="space-y-2 w-28 shrink-0">
                      <Label htmlFor={`contact-label-${i}`} className="text-xs">Label (Optional)</Label>
                      <Input id={`contact-label-${i}`} value={contact.label || ''} onChange={e => updateContact(i, { label: e.target.value })} placeholder="Display text" className="h-8 text-xs" />
                    </div>
                    <div className="pt-6">
                      <Button variant="ghost" size="icon" onClick={() => removeContact(i)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
            <h3 className="font-semibold border-b pb-2">Profile Photo</h3>
            <div className="aspect-square bg-neutral-100 rounded-lg border-2 border-dashed flex flex-col items-center justify-center overflow-hidden relative">
              {member.photo?.url ? (
                <>
                  <Image src={member.photo.url} alt="Profile" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" size="sm" onClick={() => setShowMediaPicker(true)}>Change Photo</Button>
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <ImageIcon className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                  <Button variant="outline" size="sm" onClick={() => setShowMediaPicker(true)}>Select Photo</Button>
                </div>
              )}
            </div>
            {member.photoId && (
              <Button variant="ghost" size="sm" className="w-full text-red-500" onClick={() => setMember({ ...member, photoId: null, photo: null })}>
                Remove Photo
              </Button>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm space-y-6">
            <h3 className="font-semibold border-b pb-2">Settings</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Active Status</Label>
                <p className="text-xs text-neutral-500">Is this member currently visible?</p>
              </div>
              <Switch checked={member.isActive} onCheckedChange={c => setMember({ ...member, isActive: c })} />
            </div>

            <div className="space-y-2 pt-4">
              <Label htmlFor="member-type">Type</Label>
              <Select aria-label="Member type" value={member.memberType} onValueChange={(v: 'TEAM' | 'BOARD') => setMember({ ...member, memberType: v })}>
                <SelectTrigger id="member-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEAM">Team Member</SelectItem>
                  <SelectItem value="BOARD">Board of Directors</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {showMediaPicker && (
        <MediaPicker 
          open={showMediaPicker}
          onOpenChange={setShowMediaPicker}
          onSelect={(file) => {
            setMember(prev => prev ? { ...prev, photoId: file.id, photo: file } : prev)
            setShowMediaPicker(false)
          }} 
        />
      )}
    </div>
  )
}
