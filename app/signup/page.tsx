'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)

  useEffect(() => {
    document.title = 'Sign up · BrightMinds'
  }, [])

  const handleSignup = async () => {
    setLoading(true)
    setError('')

    if (!fullName || !email || !password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      if (!data.session) {
        setLoading(false)
        setShowConfirmation(true)
        return
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email,
          full_name: fullName,
          role: 'parent',
          is_active: true,
        })

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }

      router.push('/parent/dashboard')
    }

    setLoading(false)
  }

  if (showConfirmation) {
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
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📧</div>
          <h1 style={{
            fontSize: '22px',
            fontWeight: '500',
            color: '#26215C',
            marginBottom: '10px',
          }}>
            Check your email
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#888780',
            marginBottom: '8px',
            lineHeight: '1.6',
          }}>
            We sent a confirmation link to
          </p>
          <p style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#26215C',
            marginBottom: '20px',
          }}>
            {email}
          </p>
          <p style={{
            fontSize: '13px',
            color: '#888780',
            marginBottom: '28px',
            lineHeight: '1.6',
          }}>
            Click the link in the email to confirm your account
            and get started. Check your spam folder if you
            don't see it.
          </p>
          <button
            onClick={() => router.push('/login')}
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
            Go to login
          </button>
        </div>
      </div>
    )
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
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        border: '0.5px solid #e5e3db',
      }}>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '28px',
        }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: '#7F77DD',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontSize: '18px' }}>★</span>
          </div>
          <span style={{
            fontSize: '18px',
            fontWeight: '500',
            color: '#2C2C2A',
          }}>
            BrightMinds
          </span>
        </div>

        <h1 style={{
          fontSize: '22px',
          fontWeight: '500',
          color: '#26215C',
          marginBottom: '6px',
        }}>
          Create your parent account
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#888780',
          marginBottom: '28px',
        }}>
          Sign up to manage your children's learning
        </p>

        {error && (
          <div style={{
            background: '#FCEBEB',
            border: '0.5px solid #F09595',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            fontSize: '13px',
            color: '#A32D2D',
          }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={{
            fontSize: '13px',
            color: '#444441',
            display: 'block',
            marginBottom: '6px',
          }}>
            Full name
          </label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '0.5px solid #D3D1C7',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{
            fontSize: '13px',
            color: '#444441',
            display: 'block',
            marginBottom: '6px',
          }}>
            Email address
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '0.5px solid #D3D1C7',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{
            fontSize: '13px',
            color: '#444441',
            display: 'block',
            marginBottom: '6px',
          }}>
            Password
          </label>
          <input
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSignup()}
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '0.5px solid #D3D1C7',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          onClick={handleSignup}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: loading ? '#AFA9EC' : '#7F77DD',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginBottom: '16px',
          }}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        <p style={{
          textAlign: 'center',
          fontSize: '13px',
          color: '#888780',
        }}>
          Already have an account?{' '}
          <Link href="/login" style={{
            color: '#7F77DD',
            fontWeight: '500',
          }}>
            Log in
          </Link>
        </p>

      </div>
    </div>
  )
}