
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'


export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
const [forgotMessage, setForgotMessage] = useState('')
  useEffect(() => {
    document.title = 'Log in · BrightMinds'
  }, [])

  const handleLogin = async () => {
    setLoading(true)
    setError('')

    
    if (!email || !password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setError('Invalid email or password')
      setLoading(false)
      return
    }

    if (data.user) {
        await new Promise(resolve => setTimeout(resolve, 500))
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .maybeSingle()

      // AFTER
if (profile?.role === 'admin') {
  router.push('/admin/dashboard')
} else if (profile?.role === 'parent') {
  router.push('/parent/dashboard')
} else if (profile?.role === 'child') {
  router.push('/child/dashboard')
} else {
  // No profile yet — default to parent dashboard (new signup)
  router.push('/parent/dashboard')
}
    }

    setLoading(false)
  }
const handleForgotPassword = async () => {
  setForgotMessage('')
  if (!email) {
    setForgotMessage('Enter your email above first.')
    return
  }
  setForgotLoading(true)
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  setForgotLoading(false)
  if (error) {
    setForgotMessage(error.message)
  } else {
    setForgotMessage('Check your email for a reset link.')
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
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        border: '0.5px solid #e5e3db',
      }}>

        <div 
        onClick={() => router.push('/')}
        style={{
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
          Welcome back
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#888780',
          marginBottom: '28px',
        }}>
          Log in to your BrightMinds account
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
            Email address
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
    <label style={{ fontSize: '13px', color: '#444441' }}>
      Password
    </label>
    <button
      type="button"
      onClick={handleForgotPassword}
      disabled={forgotLoading}
      style={{ background: 'none', border: 'none', padding: 0, fontSize: '13px', color: '#7F77DD', cursor: 'pointer', fontWeight: '500' }}
    >
      {forgotLoading ? 'Sending...' : 'Forgot password?'}
    </button>
  </div>
  <input
    type="password"
    placeholder="Enter your password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
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
  {forgotMessage && (
    <p style={{
      fontSize: '13px',
      marginTop: '8px',
      marginBottom: 0,
      color: forgotMessage.includes('Check') ? '#3B6D11' : '#A32D2D',
    }}>
      {forgotMessage}
    </p>
  )}
</div>

        <button
          onClick={handleLogin}
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
          {loading ? 'Logging in...' : 'Log in'}
        </button>

        <p style={{
          textAlign: 'center',
          fontSize: '13px',
          color: '#888780',
        }}>
          Don't have an account?{' '}
          <Link href="/signup" style={{
            color: '#7F77DD',
            fontWeight: '500',
          }}>
            Sign up free
          </Link>
        </p>

      </div>
    </div>
  )
}