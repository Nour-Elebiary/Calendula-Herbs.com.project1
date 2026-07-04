'use client'

import React, { useState, useRef } from 'react'
import ReactCrop, { type Crop, centerCrop, makeAspectCrop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface ImageCropperProps {
  file: File | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCropComplete: (croppedFile: File) => void
  aspectRatio?: number
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  )
}

export function ImageCropper({ file, open, onOpenChange, onCropComplete, aspectRatio = 1 }: ImageCropperProps) {
  const [imgSrc, setImgSrc] = useState('')
  const imgRef = useRef<HTMLImageElement>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()

  React.useEffect(() => {
    if (!file) return
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      setCrop(undefined)
      setImgSrc(reader.result?.toString() || '')
    })
    reader.readAsDataURL(file)
  }, [file])

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspectRatio) {
      const { width, height } = e.currentTarget
      setCrop(centerAspectCrop(width, height, aspectRatio))
    }
  }

  const handleCropSave = async () => {
    if (!completedCrop || !imgRef.current || !file) return

    const image = imgRef.current
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    canvas.width = Math.floor(completedCrop.width * scaleX)
    canvas.height = Math.floor(completedCrop.height * scaleY)

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    )

    canvas.toBlob((blob) => {
      if (!blob) return
      const croppedFile = new File([blob], file.name, {
        type: file.type,
        lastModified: Date.now(),
      })
      onCropComplete(croppedFile)
      onOpenChange(false)
    }, file.type)
  }

  if (!file) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>

        <div className="mt-4 flex justify-center bg-neutral-100 rounded-md overflow-hidden p-2">
          {imgSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
            >
              <img
                ref={imgRef}
                alt="Crop preview"
                src={imgSrc}
                onLoad={onImageLoad}
                style={{ maxHeight: '60vh', objectFit: 'contain' }}
              />
            </ReactCrop>
          )}
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCropSave} disabled={!completedCrop}>
            Crop & Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
