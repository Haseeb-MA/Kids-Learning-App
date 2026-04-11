'use client'

import { useRouter } from 'next/navigation'

export default function Hero() {
  const router = useRouter()

  return (
    <section style={{
      padding: '64px 40px',
      textAlign: 'center',
      background: '#EEEDFE',
    }}>
      <div style={{
        display: 'inline-block',
        background: '#CECBF6',
        color: '#3C3489',
        fontSize: '13px',
        padding: '5px 14px',
        borderRadius: '20px',
        marginBottom: '16px',
      }}>
        For Grade 1 to Grade 10 · Learn, play and grow
      </div>

      <h1 style={{
        fontSize: '40px',
        fontWeight: '500',
        color: '#26215C',
        lineHeight: '1.25',
        marginBottom: '14px',
      }}>
        Learning made fun,<br />progress made visible
      </h1>

      <p style={{
        fontSize: '16px',
        color: '#534AB7',
        marginBottom: '28px',
      }}>
        Parents assign. Kids learn. Everyone tracks progress together.
      </p>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button
          onClick={() => router.push('/signup?role=parent')}
          style={{
            padding: '12px 28px',
            background: '#7F77DD',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
          }}>
          I am a parent
        </button>
        <button
          onClick={() => router.push('/child-login')}
          style={{
            padding: '12px 28px',
            background: '#fff',
            color: '#534AB7',
            border: '0.5px solid #534AB7',
            borderRadius: '8px',
            fontSize: '15px',
          }}>
          I am a student
        </button>
      </div>
    </section>
  )
}