'use client'

import { useState, useCallback, type ReactNode, type MouseEvent } from 'react'

export function Card3D({ children, className = '' }: { children: ReactNode; className?: string }) {
  const [style, setStyle] = useState<React.CSSProperties>({
    transformStyle: 'preserve-3d',
    transition: 'transform 0.15s ease-out',
    willChange: 'transform',
  })

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const tiltX = (y - 0.5) * -12
    const tiltY = (x - 0.5) * 12

    setStyle({
      transformStyle: 'preserve-3d',
      transition: 'transform 0.15s ease-out',
      willChange: 'transform',
      transform: `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02,1.02,1.02)`,
    })
  }, [])

  const handleMouseLeave = useCallback(() => {
    setStyle({
      transformStyle: 'preserve-3d',
      transition: 'transform 0.15s ease-out',
      willChange: 'transform',
      transform: 'perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)',
    })
  }, [])

  return (
    <div
      className={className}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
}
