'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase' // adjust path if needed

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase parses the token from the URL hash automatically
    // We just need to confirm a session exists
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setReady(true)
      } else {
        setError('Invalid or expired reset link. Please request a new one.')
      }
    })
  }, [])

  const handleReset = async () => {
    setError('')
    setMessage('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setMessage('Password updated! Redirecting to login...')
      setTimeout(() => router.push('/login'), 2000)
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', padding: '0 1rem' }}>
      <h1 style={{ fontSize: '22px', fontWeight: '500', marginBottom: '24px' }}>
        Reset your password
      </h1>

      {!ready && !error && <p style={{ color: '#888' }}>Verifying link...</p>}

      {error && <p style={{ color: 'red', fontSize: '14px', marginBottom: '12px' }}>{error}</p>}
      {message && <p style={{ color: 'green', fontSize: '14px', marginBottom: '12px' }}>{message}</p>}

      {ready && (
        <>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' }}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleReset()}
            style={{ width: '100%', padding: '10px', marginBottom: '16px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' }}
          />
          <button
            onClick={handleReset}
            disabled={loading}
            style={{ width: '100%', padding: '10px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}
          >
            {loading ? 'Updating...' : 'Update password'}
          </button>
        </>
      )}
    </div>
  )
}