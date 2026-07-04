'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { Check, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ICON_MAP, ICON_CATEGORIES } from '@/lib/icon-map'

type IconPickerProps = {
  value: string | null | undefined
  onChange: (name: string) => void
}

const ALL_ICON_NAMES = Object.keys(ICON_MAP).sort()

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const filteredIcons = useMemo(() => {
    if (!search.trim()) return null
    const q = search.toLowerCase()
    return ALL_ICON_NAMES.filter(n => n.toLowerCase().includes(q))
  }, [search])

  const selectIcon = (name: string) => {
    onChange(name)
    setOpen(false)
    setSearch('')
  }

  const CurrentIcon = value ? ICON_MAP[value] : null

  return (
    <div ref={ref} className="relative">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        className="w-full justify-start gap-2 font-normal"
      >
        {CurrentIcon ? (
          <CurrentIcon className="h-4 w-4 shrink-0" />
        ) : (
          <div className="h-4 w-4 shrink-0 rounded bg-neutral-100" />
        )}
        <span className="text-xs">{value || 'None'}</span>
      </Button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-72 rounded-xl border bg-white p-3 shadow-lg">
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search icons..."
              className="pl-8 h-8 text-xs"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Grid */}
          <div className="max-h-60 overflow-y-auto">
            {search.trim() ? (
              <div className="grid grid-cols-7 gap-1">
                {filteredIcons!.map(name => {
                  const Icon = ICON_MAP[name]
                  const isSelected = value === name
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => selectIcon(name)}
                      title={name}
                      className={`flex items-center justify-center h-8 w-8 rounded-md transition-colors ${
                        isSelected
                          ? 'bg-green-100 text-green-700 ring-1 ring-green-400'
                          : 'hover:bg-neutral-100 text-neutral-600'
                      }`}
                    >
                      {isSelected ? (
                        <div className="relative">
                          <Icon className="h-4 w-4" />
                          <Check className="absolute -top-1 -right-1 h-2.5 w-2.5 text-green-600" />
                        </div>
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </button>
                  )
                })}
                {filteredIcons!.length === 0 && (
                  <p className="col-span-7 text-xs text-neutral-400 py-4 text-center">No icons found</p>
                )}
              </div>
            ) : (
              ICON_CATEGORIES.map(cat => (
                <div key={cat.label} className="mb-3 last:mb-0">
                  <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider mb-1.5 px-0.5">{cat.label}</p>
                  <div className="grid grid-cols-7 gap-1">
                    {cat.icons.map(name => {
                      const Icon = ICON_MAP[name]
                      const isSelected = value === name
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => selectIcon(name)}
                          title={name}
                          className={`flex items-center justify-center h-8 w-8 rounded-md transition-colors ${
                            isSelected
                              ? 'bg-green-100 text-green-700 ring-1 ring-green-400'
                              : 'hover:bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          {isSelected ? (
                            <div className="relative">
                              <Icon className="h-4 w-4" />
                              <Check className="absolute -top-1 -right-1 h-2.5 w-2.5 text-green-600" />
                            </div>
                          ) : (
                            <Icon className="h-4 w-4" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
