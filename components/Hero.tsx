'use client'

import { useRouter } from 'next/navigation'
import ParentChildIllustration from '@/components/ParentChildIllustration'

export default function Hero() {
  const router = useRouter()

  return (
    <section style={{
      padding: '40px 40px',
      background: '#EEEDFE',
    }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '48px',
        alignItems: 'center',
      }}>

        {/* Left: text + CTAs */}
        <div>
          <div style={{
            display: 'inline-block',
            background: '#CECBF6',
            color: '#3C3489',
            fontSize: '13px',
            padding: '5px 14px',
            borderRadius: '20px',
            marginBottom: '20px',
          }}>
            Grade 1 to Grade 10 · Maths · English · Science
          </div>

          <h1 style={{
            fontSize: '44px',
            fontWeight: '500',
            color: '#26215C',
            lineHeight: '1.2',
            marginBottom: '18px',
          }}>
            Your child can go from confused to confident
          </h1>

          <p style={{
            fontSize: '17px',
            color: '#534AB7',
            marginBottom: '32px',
            lineHeight: '1.6',
            maxWidth: '440px',
          }}>
            Assign subjects, set deadlines, and watch real progress — all in one place built for Grade 1 to 10.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => router.push('/signup?role=parent')}
              style={{
                padding: '13px 28px',
                background: '#7F77DD',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                cursor: 'pointer',
                fontWeight: '500',
              }}>
              I am a parent
            </button>
            <button
              onClick={() => router.push('/child-login')}
              style={{
                padding: '13px 28px',
                background: '#fff',
                color: '#534AB7',
                border: '0.5px solid #534AB7',
                borderRadius: '8px',
                fontSize: '15px',
                cursor: 'pointer',
              }}>
              I am a student
            </button>
          </div>
        </div>

        {/* Right: illustration */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <ParentChildIllustration />
        </div>

      </div>
    </section>
  )
}
