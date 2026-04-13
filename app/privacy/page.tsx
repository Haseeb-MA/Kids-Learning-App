'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PrivacyPage() {
  const router = useRouter()

  useEffect(() => {
    document.title = 'Privacy policy · BrightMinds'
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#f5f4f0' }}>
      <nav style={{
        background: '#ffffff',
        padding: '14px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '0.5px solid #e5e3db',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#888780',
              fontSize: '14px',
            }}>
            ← Back
          </button>
          <span style={{ color: '#D3D1C7' }}>|</span>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: '#7F77DD',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontSize: '16px' }}>★</span>
          </div>
          <span style={{
            fontSize: '16px',
            fontWeight: '500',
            color: '#2C2C2A',
          }}>
            BrightMinds
          </span>
        </div>
      </nav>

      <div style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: '48px 40px',
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: '500',
          color: '#26215C',
          marginBottom: '8px',
        }}>
          Privacy policy
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#888780',
          marginBottom: '40px',
        }}>
          Last updated: April 2026
        </p>

        {[
          {
            title: 'Who we are',
            content: 'BrightMinds is a learning platform designed for school-age children from Grade 1 to Grade 10. The platform is managed by parents who create accounts on behalf of their children. We are committed to protecting the privacy of all users, especially children.',
          },
          {
            title: 'What information we collect',
            content: 'For parents we collect your name, email address and password. For children we collect their first name, grade level and learning progress including quiz scores and badges earned. We do not collect any financial information, location data, or any information beyond what is needed to run the platform.',
          },
          {
            title: 'How we use your information',
            content: 'We use parent information to manage your account and communicate with you about your children\'s progress. We use children\'s information solely to personalise their learning experience, track their progress and award badges. We do not sell, share or rent any personal information to third parties.',
          },
          {
            title: 'Children\'s privacy',
            content: 'We take children\'s privacy very seriously. Children do not create their own accounts — they are added by parents. Children log in using a simple PIN rather than an email address. We collect the minimum information necessary and do not display advertising to children.',
          },
          {
            title: 'Data storage',
            content: 'Your data is stored securely using Supabase, a trusted database platform with industry-standard encryption. All data is transmitted over encrypted HTTPS connections. We retain your data for as long as your account is active.',
          },
          {
            title: 'Your rights',
            content: 'You have the right to access, correct or delete your personal data at any time. Parents can delete their children\'s data directly from the parent dashboard. To delete your parent account or request a copy of your data, please contact us using the details below.',
          },
          {
            title: 'AI features',
            content: 'BrightMinds uses Claude AI by Anthropic to power the homework helper and content generation features. Questions asked in the homework helper are sent to Anthropic\'s API to generate responses. We do not store these conversations beyond the current session. Please review Anthropic\'s privacy policy at anthropic.com for details on how they handle data.',
          },
          {
            title: 'Contact us',
            content: 'If you have any questions about this privacy policy or how we handle your data, please contact us through our contact page.',
          },
        ].map((section) => (
          <div key={section.title} style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '18px',
              fontWeight: '500',
              color: '#2C2C2A',
              marginBottom: '10px',
            }}>
              {section.title}
            </h2>
            <p style={{
              fontSize: '15px',
              color: '#444441',
              lineHeight: '1.8',
            }}>
              {section.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}