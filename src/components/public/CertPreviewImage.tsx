'use client'

import Image from 'next/image'
import { useState } from 'react'
import { FileImage } from 'lucide-react'

type Props = {
  src: string
  alt: string
}

export function CertPreviewImage({ src, alt }: Props) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div className="w-full aspect-[4/3] relative mb-3 rounded-lg overflow-hidden bg-neutral-50 flex items-center justify-center">
        <FileImage className="w-10 h-10 text-neutral-300" />
      </div>
    )
  }

  return (
    <div className="w-full aspect-[4/3] relative mb-3 rounded-lg overflow-hidden bg-neutral-50">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-contain p-2"
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
        onError={() => setFailed(true)}
      />
    </div>
  )
}
