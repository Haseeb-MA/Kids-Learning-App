'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ConfirmPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    document.title = 'Confirming your account · BrightMinds'
    handleConfirmation()
  }, [])

  const handleConfirmation = async () => {
    try {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        setStatus('error')
        setMessage('Something went wrong confirming your account. Please try again.')
        return
      }

      if (data.session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.session.user.id)
          .single()

        setStatus('success')
        setMessage('Your email has been confirmed successfully!')

        setTimeout(() => {
          if (profile?.role === 'admin') {
            router.push('/admin/dashboard')
          } else if (profile?.role === 'parent') {
            router.push('/parent/dashboard')
          } else {
            router.push('/login')
          }
        }, 2000)
      } else {
        setStatus('error')
        setMessage('Confirmation link has expired. Please sign up again.')
      }
    } catch (err) {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#EEEDFE',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '420px',
        border: '0.5px solid #e5e3db',
        textAlign: 'center',
      }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '14px',
          background: '#7F77DD',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <span style={{ color: '#fff', fontSize: '26px' }}>★</span>
        </div>

        {status === 'loading' && (
          <>
            <h1 style={{
              fontSize: '20px',
              fontWeight: '500',
              color: '#26215C',
              marginBottom: '8px',
            }}>
              Confirming your account...
            </h1>
            <p style={{ fontSize: '14px', color: '#888780' }}>
              Please wait a moment
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{
              fontSize: '40px',
              marginBottom: '16px',
            }}>
              🎉
            </div>
            <h1 style={{
              fontSize: '20px',
              fontWeight: '500',
              color: '#26215C',
              marginBottom: '8px',
            }}>
              Email confirmed!
            </h1>
            <p style={{ fontSize: '14px', color: '#888780', marginBottom: '16px' }}>
              {message}
            </p>
            <p style={{ fontSize: '13px', color: '#7F77DD' }}>
              Taking you to your dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>😕</div>
            <h1 style={{
              fontSize: '20px',
              fontWeight: '500',
              color: '#26215C',
              marginBottom: '8px',
            }}>
              Something went wrong
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#888780',
              marginBottom: '24px',
            }}>
              {message}
            </p>
            <button
              onClick={() => router.push('/signup')}
              style={{
                width: '100%',
                padding: '12px',
                background: '#7F77DD',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
              }}>
              Back to sign up
            </button>
          </>
        )}
      </div>
    </div>
  )
}