'use client'

import { useEffect, useState, useCallback } from 'react'
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
  const [step, setStep] = useState<'code' | 'select' | 'pin'>('code')
  const [familyCode, setFamilyCode] = useState('')
  const [codeError, setCodeError] = useState('')
  const [codeLoading, setCodeLoading] = useState(false)
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<Child | null>(null)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')

  useEffect(() => {
    document.title = 'Student login · BrightMinds'
  }, [])

  const handleFamilyCode = async () => {
    setCodeError('')
    const code = familyCode.trim().toUpperCase()
    if (!code) {
      setCodeError('Please enter your family code')
      return
    }
    setCodeLoading(true)

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('family_code', code)
      .maybeSingle()
      console.log('Profile result:', profileData, 'Error:', profileError) 

    if (profileError || !profileData) {
      setCodeError('Family code not found. Check with your parent.')
      setCodeLoading(false)
      return
    }

    const { data: childrenData } = await supabase
      .from('children')
      .select('id, full_name, grade, pin')
      .eq('parent_id', profileData.id)
      .eq('is_active', true)
      .not('pin', 'is', null)

    setCodeLoading(false)

    if (!childrenData || childrenData.length === 0) {
      setCodeError('No children found. Ask your parent to add you first.')
      return
    }

    setChildren(childrenData)
    setStep('select')
  }

  const handleSelectChild = (child: Child) => {
    setSelectedChild(child)
    setPin('')
    setPinError('')
    setStep('pin')
  }

  const loginChild = useCallback((child: Child) => {
    localStorage.setItem('childId', child.id)
    localStorage.setItem('childName', child.full_name)
    localStorage.setItem('childGrade', child.grade.toString())
    router.push('/child/dashboard')
  }, [router])

  const handlePinPress = useCallback((digit: string) => {
    if (!selectedChild) return
    setPin(prev => {
      if (prev.length >= 4) return prev
      const newPin = prev + digit
      setPinError('')
      if (newPin.length === 4) {
        setTimeout(() => {
          if (newPin !== selectedChild.pin) {
            setPinError('Wrong PIN, try again')
            setPin('')
          } else {
            loginChild(selectedChild)
          }
        }, 300)
      }
      return newPin
    })
  }, [selectedChild, loginChild])

  const handleDelete = useCallback(() => {
    setPin(prev => prev.slice(0, -1))
    setPinError('')
  }, [])

  useEffect(() => {
    if (step !== 'pin') return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handlePinPress(e.key)
      if (e.key === 'Backspace') handleDelete()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [step, handlePinPress, handleDelete])

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

        {/* Logo — clicking this goes home */}
        <div
          onClick={() => router.push('/')}
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: '#7F77DD',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            cursor: 'pointer',
          }}>
          <span style={{ color: '#fff', fontSize: '26px' }}>★</span>
        </div>

        {/* STEP 1 — Family code */}
        {step === 'code' && (
          <>
            <h1 style={{ fontSize: '22px', fontWeight: '500', color: '#26215C', marginBottom: '6px' }}>
              Enter your family code
            </h1>
            <p style={{ fontSize: '14px', color: '#888780', marginBottom: '28px' }}>
              Ask your parent for your family code
            </p>

            <input
              type="text"
              placeholder="e.g. BM472"
              value={familyCode}
              onChange={(e) => setFamilyCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleFamilyCode()}
              maxLength={5}
              style={{
                width: '100%',
                padding: '14px',
                border: '0.5px solid #D3D1C7',
                borderRadius: '8px',
                fontSize: '22px',
                fontWeight: '500',
                letterSpacing: '6px',
                textAlign: 'center',
                outline: 'none',
                boxSizing: 'border-box',
                color: '#26215C',
                marginBottom: '12px',
                textTransform: 'uppercase',
              }}
            />

            {codeError && (
              <div style={{
                background: '#FCEBEB',
                border: '0.5px solid #F09595',
                borderRadius: '8px',
                padding: '10px',
                marginBottom: '12px',
                fontSize: '13px',
                color: '#A32D2D',
              }}>
                {codeError}
              </div>
            )}

            <button
              onClick={handleFamilyCode}
              disabled={codeLoading}
              style={{
                width: '100%',
                padding: '12px',
                background: codeLoading ? '#AFA9EC' : '#7F77DD',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                cursor: codeLoading ? 'not-allowed' : 'pointer',
              }}>
              {codeLoading ? 'Checking...' : 'Continue →'}
            </button>
          </>
        )}

        {/* STEP 2 — Select child */}
        {step === 'select' && (
          <>
            <h1 style={{ fontSize: '22px', fontWeight: '500', color: '#26215C', marginBottom: '6px' }}>
              Who are you?
            </h1>
            <p style={{ fontSize: '14px', color: '#888780', marginBottom: '28px' }}>
              Tap your name to get started
            </p>

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
                  <p style={{ fontSize: '13px', fontWeight: '500', color: '#26215C', margin: '0 0 2px' }}>
                    {child.full_name.split(' ')[0]}
                  </p>
                  <p style={{ fontSize: '11px', color: '#888780', margin: 0 }}>
                    Grade {child.grade}
                  </p>
                </button>
              ))}
            </div>

            <button
              onClick={() => { setStep('code'); setFamilyCode(''); setCodeError('') }}
              style={{ background: 'transparent', border: 'none', color: '#888780', fontSize: '13px', cursor: 'pointer' }}>
              ← Wrong family code?
            </button>
          </>
        )}

        {/* STEP 3 — PIN */}
        {step === 'pin' && (
          <>
            <h1 style={{ fontSize: '22px', fontWeight: '500', color: '#26215C', marginBottom: '6px' }}>
              Hi {selectedChild?.full_name.split(' ')[0]}!
            </h1>
            <p style={{ fontSize: '14px', color: '#888780', marginBottom: '28px' }}>
              Enter your secret PIN
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '28px' }}>
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

            {pinError && (
              <div style={{
                background: '#FCEBEB',
                border: '0.5px solid #F09595',
                borderRadius: '8px',
                padding: '10px',
                marginBottom: '16px',
                fontSize: '13px',
                color: '#A32D2D',
              }}>
                {pinError}
              </div>
            )}

            <p style={{ fontSize: '12px', color: '#888780', marginBottom: '16px' }}>
              Use keyboard numbers or tap below
            </p>

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
              onClick={() => { setStep('select'); setPin(''); setPinError('') }}
              style={{ background: 'transparent', border: 'none', color: '#888780', fontSize: '13px', cursor: 'pointer' }}>
              ← Back to name selection
            </button>
          </>
        )}

        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '0.5px solid #e5e3db' }}>
          <p style={{ fontSize: '12px', color: '#888780' }}>
            Are you a parent?{' '}
            <a href="/login" style={{ color: '#7F77DD', fontWeight: '500' }}>Parent login</a>
          </p>
        </div>

      </div>
    </div>
  )
}