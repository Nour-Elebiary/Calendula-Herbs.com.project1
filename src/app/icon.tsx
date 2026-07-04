import { ImageResponse } from 'next/og'

export const size = { width: 192, height: 192 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #2d7a3a 0%, #1a4d24 100%)',
          borderRadius: 32,
        }}
      >
        <span style={{ fontSize: 72, color: '#f5f5f0', fontFamily: 'serif', fontWeight: 700, letterSpacing: 2 }}>
          CH
        </span>
      </div>
    ),
    { ...size },
  )
}
