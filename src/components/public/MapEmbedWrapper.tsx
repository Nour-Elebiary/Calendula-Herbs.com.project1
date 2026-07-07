'use client'

import React from 'react'
import dynamic from 'next/dynamic'

const MapEmbedInner = dynamic(
  () => import('@/components/public/MapEmbed').then(mod => mod.MapEmbed),
  {
    ssr: false,
    loading: () => <div className="w-full h-[400px] rounded-2xl bg-[var(--color-bg-base)] animate-pulse" />,
  }
)

interface MapEmbedWrapperProps {
  address: string
  mapLat?: number | null
  mapLng?: number | null
}

export function MapEmbedWrapper({ address, mapLat, mapLng }: MapEmbedWrapperProps) {
  return <MapEmbedInner address={address} mapLat={mapLat} mapLng={mapLng} />
}
