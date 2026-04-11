'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Child {
  id: string
  full_name: string
  grade: number
  pin: string
}

export default function ChildLoginPage() {
  const router = useRouter()
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<'select' | 'pin'>('select')

  useEffect(() => {
    loadChildren()
  }, [])

  const loadChildren = async () => {
    const { data } = await supabase
      .from('children')
      .select('id, full_name, grade, pin')
      .eq('is_active', true)
      .not('pin', 'is', null)

    if (data) setChildren(data)
    setLoading(false)
  }

  const handleSelectChild = (child: Child) => {
    setSelectedChild(child)
    setPin('')
    setError('')
    setStep('pin')
  }

  const handlePinLogin = () => {
    if (pin.length !== 4) {
      setError('Please enter your 4 digit PIN')
      return
    }

    if (pin !== selectedChild?.pin) {
      setError('Wrong PIN, try again')
      setPin('')
      return
    }

    localStorage.setItem('childId', selectedChild.id)
    localStorage.setItem('childName', selectedChild.full_name)
    localStorage.setItem('childGrade', selectedChild.grade.toString())
    router.push('/child/dashboard')
  }

  const handlePinPress = (digit: string) => {
    if (pin.length < 4) {
      const newPin = pin + digit
      setPin(newPin)
      setError('')
      if (newPin.length === 4) {
        setTimeout(() => {
          if (newPin !== selectedChild?.pin) {
            setError('Wrong PIN, try again')
            setPin('')
          } else {
            localStorage.setItem('childId', selectedChild.id)
            localStorage.setItem('childName', selectedChild.full_name)
            localStorage.setItem('childGrade', selectedChild.grade.toString())
            router.push('/child/dashboard')
          }
        }, 300)
      }
    }
  }

  const handleDelete = () => {
    setPin(pin.slice(0, -1))
    setError('')
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#EEEDFE',
      }}>
        <p style={{ color: '#7F77DD', fontSize: '16px' }}>Loading...</p>
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
        borderRadius: '20px',
        padding: '40px',
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
          margin: '0 auto 16px',
        }}>
          <span style={{ color: '#fff', fontSize: '26px' }}>★</span>
        </div>

        <h1 style={{
          fontSize: '22px',
          fontWeight: '500',
          color: '#26215C',
          marginBottom: '6px',
        }}>
          {step === 'select' ? 'Who are you?' : `Hi ${selectedChild?.full_name}!`}
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#888780',
          marginBottom: '28px',
        }}>
          {step === 'select'
            ? 'Tap your name to get started'
            : 'Enter your secret PIN'}
        </p>

        {step === 'select' && (
          <>
            {children.length === 0 ? (
              <div style={{
                padding: '20px',
                color: '#888780',
                fontSize: '14px',
              }}>
                No student accounts found.
                Ask your parent to set up your account.
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: '12px',
                marginBottom: '24px',
              }}>
                {children.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => handleSelectChild(child)}
                    style={{
                      background: '#EEEDFE',
                      border: '0.5px solid #AFA9EC',
                      borderRadius: '12px',
                      padding: '16px 12px',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: '#7F77DD',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px',
                      fontSize: '20px',
                      fontWeight: '500',
                      color: '#fff',
                    }}>
                      {child.full_name.charAt(0).toUpperCase()}
                    </div>
                    <p style={{
                      fontSize: '13px',
                      fontWeight: '500',
                      color: '#26215C',
                      margin: '0 0 2px',
                    }}>
                      {child.full_name.split(' ')[0]}
                    </p>
                    <p style={{
                      fontSize: '11px',
                      color: '#888780',
                      margin: 0,
                    }}>
                      Grade {child.grade}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {step === 'pin' && (
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '28px',
            }}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: pin.length > i ? '#7F77DD' : '#e5e3db',
                  transition: 'background 0.15s',
                }} />
              ))}
            </div>

            {error && (
              <div style={{
                background: '#FCEBEB',
                border: '0.5px solid #F09595',
                borderRadius: '8px',
                padding: '10px',
                marginBottom: '16px',
                fontSize: '13px',
                color: '#A32D2D',
              }}>
                {error}
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
              maxWidth: '240px',
              margin: '0 auto 20px',
            }}>
              {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((key, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (key === '⌫') handleDelete()
                    else if (key !== '') handlePinPress(key)
                  }}
                  style={{
                    height: '56px',
                    borderRadius: '12px',
                    border: '0.5px solid #e5e3db',
                    background: key === '' ? 'transparent' : '#ffffff',
                    fontSize: key === '⌫' ? '18px' : '20px',
                    fontWeight: '500',
                    color: '#26215C',
                    cursor: key === '' ? 'default' : 'pointer',
                    visibility: key === '' ? 'hidden' : 'visible',
                  }}>
                  {key}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setStep('select')
                setPin('')
                setError('')
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#888780',
                fontSize: '13px',
                cursor: 'pointer',
              }}>
              ← Back to name selection
            </button>
          </>
        )}

        <div style={{
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '0.5px solid #e5e3db',
        }}>
          <p style={{ fontSize: '12px', color: '#888780' }}>
            Are you a parent?{' '}
            <a href="/login" style={{
              color: '#7F77DD',
              fontWeight: '500',
            }}>
              Parent login
            </a>
          </p>
        </div>

      </div>
    </div>
  )
}