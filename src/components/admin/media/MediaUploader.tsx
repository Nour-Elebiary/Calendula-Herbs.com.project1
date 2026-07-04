'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, File, Image as ImageIcon, Film, Music, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { MediaType } from '@prisma/client'

interface MediaUploaderProps {
  onUploadSuccess: () => void
}

const MAX_SIZES = {
  IMAGE: 10 * 1024 * 1024, // 10MB
  VIDEO: 200 * 1024 * 1024, // 200MB
  AUDIO: 50 * 1024 * 1024, // 50MB
  PDF: 20 * 1024 * 1024, // 20MB
}

export function MediaUploader({ onUploadSuccess }: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<{ [key: string]: number }>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getMediaType = (file: File): MediaType | null => {
    if (file.type.startsWith('image/')) return 'IMAGE'
    if (file.type.startsWith('video/')) return 'VIDEO'
    if (file.type.startsWith('audio/')) return 'AUDIO'
    if (file.type === 'application/pdf') return 'PDF'
    return null
  }

  const handleFiles = async (files: File[]) => {
    setUploading(true)
    
    for (const file of files) {
      const type = getMediaType(file)
      if (!type) {
        toast.error(`Unsupported file type: ${file.name}`)
        continue
      }

      if (file.size > MAX_SIZES[type]) {
        toast.error(`${file.name} exceeds max size for ${type}`)
        continue
      }

      try {
        setProgress(prev => ({ ...prev, [file.name]: 0 }))
        
        // 1. Get Signature
        const sigRes = await fetch(`/api/admin/media/sign?folder=calendula_media`)
        const { signature, timestamp, apiKey, cloudName, folder } = await sigRes.json()

        // 2. Upload to Cloudinary
        const formData = new FormData()
        formData.append('file', file)
        formData.append('api_key', apiKey)
        formData.append('timestamp', timestamp.toString())
        formData.append('signature', signature)
        formData.append('folder', folder)

        const xhr = new XMLHttpRequest()
        
        const uploadPromise = new Promise((resolve, reject) => {
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const percent = Math.round((e.loaded / e.total) * 100)
              setProgress(prev => ({ ...prev, [file.name]: percent }))
            }
          })

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.responseText))
            } else {
              reject(new Error('Cloudinary upload failed'))
            }
          })

          xhr.addEventListener('error', () => reject(new Error('Network error')))
          
          xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`)
          xhr.send(formData)
        })

        const cloudinaryRes = await uploadPromise as {
          secure_url: string
          public_id: string
          width: number
          height: number
          duration?: number
          format: string
          bytes: number
        }

        // 3. Save to DB
        const dbRes = await fetch('/api/admin/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: file.name.split('.')[0],
            originalName: file.name,
            type,
            url: cloudinaryRes.secure_url,
            cloudinaryId: cloudinaryRes.public_id,
            mimeType: file.type,
            sizeBytes: file.size,
            width: cloudinaryRes.width,
            height: cloudinaryRes.height,
            duration: cloudinaryRes.duration,
          })
        })

        if (!dbRes.ok) throw new Error('Failed to save to database')
        
        toast.success(`${file.name} uploaded successfully`)
        setProgress(prev => {
          const newProg = { ...prev }
          delete newProg[file.name]
          return newProg
        })
      } catch (err) {
        console.error(err)
        toast.error(`Failed to upload ${file.name}`)
        setProgress(prev => {
          const newProg = { ...prev }
          delete newProg[file.name]
          return newProg
        })
      }
    }
    
    setUploading(false)
    onUploadSuccess()
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(Array.from(e.dataTransfer.files))
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files))
    }
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-neutral-200 hover:border-primary/50'
        }`}
      >
        <Upload className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
        <h3 className="text-lg font-medium">Drag & Drop files here</h3>
        <p className="text-sm text-neutral-500 mt-2">
          Images (10MB), Videos (200MB), Audio (50MB), PDFs (20MB)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,video/*,audio/*,application/pdf"
        />
      </div>

      {Object.entries(progress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(progress).map(([name, pct]) => (
            <div key={name} className="bg-white p-3 rounded-md border flex items-center gap-3">
              <File className="h-5 w-5 text-neutral-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-sm mb-1">
                  <span className="truncate">{name}</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
