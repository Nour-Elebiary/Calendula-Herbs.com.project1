import { ImageResponse } from 'next/og'

export const size = { width: 512, height: 512 }
export const contentType = 'image/png'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #2d7a3a 0%, #1a4d24 100%)',
          borderRadius: 64,
        }}
      >
        <span style={{ fontSize: 200, color: '#f5f5f0', fontFamily: 'serif', fontWeight: 700, letterSpacing: 2 }}>
          CH
        </span>
      </div>
    ),
    { ...size },
  )
}
