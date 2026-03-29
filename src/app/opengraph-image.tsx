import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'BestCar Premium'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '40px' }}>
           <div style={{
               width: '100px', height: '100px', background: 'linear-gradient(135deg, #10b981, #0f766e)',
               borderRadius: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center',
               color: 'white', fontSize: '64px', fontWeight: 'bold'
           }}>B</div>
           <h1 style={{ fontSize: '80px', color: 'white', fontWeight: 'bold', letterSpacing: '-0.02em', margin: 0 }}>
             BestCar <span style={{ color: '#10b981' }}>Premium</span>
           </h1>
        </div>
        <p style={{ fontSize: '32px', color: '#737373', maxWidth: '800px', textAlign: 'center', lineHeight: 1.4, margin: 0 }}>
          A sua concessionária digital. 
          Encontre os melhores veículos premium com atendimento de primeira.
        </p>
      </div>
    ),
    { ...size }
  )
}
