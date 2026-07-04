'use client'

import React from 'react'

const LEAVES = [
  { size: 24, left: '5%', delay: '0s', duration: '14s', opacity: 0.12 },
  { size: 18, left: '15%', delay: '2s', duration: '18s', opacity: 0.08 },
  { size: 32, left: '30%', delay: '4s', duration: '16s', opacity: 0.1 },
  { size: 20, left: '45%', delay: '1s', duration: '20s', opacity: 0.15 },
  { size: 28, left: '60%', delay: '3s', duration: '15s', opacity: 0.08 },
  { size: 16, left: '72%', delay: '5s', duration: '17s', opacity: 0.12 },
  { size: 22, left: '82%', delay: '0.5s', duration: '19s', opacity: 0.1 },
  { size: 14, left: '92%', delay: '3.5s', duration: '13s', opacity: 0.06 },
  { size: 26, left: '10%', delay: '6s', duration: '22s', opacity: 0.09 },
  { size: 18, left: '50%', delay: '7s', duration: '16s', opacity: 0.07 },
]

export function FloatingLeaves() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {LEAVES.map((leaf, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          fill="currentColor"
          className="absolute text-white"
          style={{
            width: leaf.size,
            height: leaf.size,
            left: leaf.left,
            top: '60%',
            opacity: 0,
            animation: `leafDrift ${leaf.duration} ${leaf.delay} ease-in-out infinite`,
            transform: `rotate(${i * 37}deg)`,
          }}
        >
          <path d="M12 2C12 2 8 6 8 10C8 13.3 10.7 16 12 16C13.3 16 16 13.3 16 10C16 6 12 2 12 2Z" />
        </svg>
      ))}
    </div>
  )
}
