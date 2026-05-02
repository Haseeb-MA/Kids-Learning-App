'use client'

import { useRouter } from 'next/navigation'

export default function CallToAction() {
  const router = useRouter()

  return (
    <section style={{
      padding: '80px 40px',
      background: '#26215C',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        <h2 style={{
          fontSize: '32px',
          fontWeight: '500',
          color: '#ffffff',
          marginBottom: '14px',
          lineHeight: '1.25',
        }}>
          Ready to get started?
        </h2>
        <p style={{
          fontSize: '16px',
          color: '#AFA9EC',
          marginBottom: '36px',
          lineHeight: '1.6',
        }}>
          Join parents already using BrightMinds to keep their children learning, growing and ahead of the class.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => router.push('/signup')}
            style={{
              padding: '13px 32px',
              background: '#7F77DD',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
            }}>
            Create a free account
          </button>
          <button
            onClick={() => router.push('/child-login')}
            style={{
              padding: '13px 32px',
              background: 'transparent',
              color: '#AFA9EC',
              border: '0.5px solid #534AB7',
              borderRadius: '8px',
              fontSize: '15px',
              cursor: 'pointer',
            }}>
            I am a student
          </button>
        </div>
      </div>
    </section>
  )
}
