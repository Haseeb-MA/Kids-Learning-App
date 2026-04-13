'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TermsPage() {
  const router = useRouter()

  useEffect(() => {
    document.title = 'Terms of use · BrightMinds'
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
          Terms of use
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
            title: 'Acceptance of terms',
            content: 'By creating an account on BrightMinds you agree to these terms of use. If you do not agree with any part of these terms, please do not use the platform. These terms apply to all users including parents, children and administrators.',
          },
          {
            title: 'Parent responsibility',
            content: 'Parents are responsible for all activity that occurs under their account and the accounts of their children. You must provide accurate information when creating your account. You are responsible for keeping your password and your children\'s PINs secure.',
          },
          {
            title: 'Acceptable use',
            content: 'BrightMinds is designed for educational use by school-age children. You agree not to misuse the platform, attempt to access other users\' accounts, upload harmful content, or use the platform for any purpose other than personal educational use.',
          },
          {
            title: 'AI features',
            content: 'The homework helper and content features are powered by AI. While we strive for accuracy, AI-generated content may occasionally contain errors. Parents should review content added to the platform and report any inaccuracies through the contact page.',
          },
          {
            title: 'Intellectual property',
            content: 'All content on BrightMinds including lessons, quiz questions and design elements are the property of BrightMinds. You may not copy, reproduce or distribute any content without permission.',
          },
          {
            title: 'Account termination',
            content: 'We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time by contacting us.',
          },
          {
            title: 'Changes to terms',
            content: 'We may update these terms from time to time. We will notify you of significant changes by email. Continued use of the platform after changes constitutes acceptance of the new terms.',
          },
          {
            title: 'Contact',
            content: 'If you have any questions about these terms please contact us through our contact page.',
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