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
      // Supabase puts the token in the URL hash — this exchanges it for a session
      const { data, error } = await supabase.auth.getSession()

      // If no session yet, listen for the auth state change (SIGNED_IN fires after token exchange)
      if (!data.session) {
        const { data: listenData, error: listenError } = await new Promise<any>((resolve) => {
          const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
              sub.subscription.unsubscribe()
              resolve({ data: { session }, error: null })
            }
          })
          // Timeout after 5s
          setTimeout(() => resolve({ data: { session: null }, error: 'timeout' }), 5000)
        })

        if (!listenData?.session) {
          setStatus('error')
          setMessage('Confirmation link has expired or already been used. Please sign up again.')
          return
        }

        await redirectByRole(listenData.session)
        return
      }

      await redirectByRole(data.session)

    } catch (err) {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  const redirectByRole = async (session: any) => {
    const userId = session.user.id
    const userEmail = session.user.email

    // Ensure profile exists (fallback in case trigger didn't fire)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('role, family_code')
      .eq('id', userId)
      .single()

    if (!existingProfile) {
      // Trigger didn't fire — create the profile manually
      await supabase.from('profiles').insert({
        id: userId,
        email: userEmail,
        role: 'parent',
      })
    }

    setStatus('success')
    setMessage('Your email has been confirmed successfully!')

    setTimeout(() => {
      const role = existingProfile?.role ?? 'parent'
      if (role === 'admin') {
        router.push('/admin/dashboard')
      } else if (role === 'parent') {
        router.push('/parent/dashboard')
      } else {
        router.push('/login')
      }
    }, 2000)
  }

     {
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