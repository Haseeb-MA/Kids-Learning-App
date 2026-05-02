'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Child {
  id: string
  full_name: string
  grade: number
  is_active: boolean
  created_at: string
}

interface Profile {
  full_name: string
  email: string
  family_code: string
  is_content_manager: boolean
}

export default function ParentDashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddChild, setShowAddChild] = useState(false)
  const [childName, setChildName] = useState('')
  const [childGrade, setChildGrade] = useState('1')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    checkParentAndLoad()
  }, [])

  const checkParentAndLoad = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    // AFTER
const { data: profileData } = await supabase
  .from('profiles')
  .select('full_name, email, role, family_code, is_content_manager')
  .eq('id', user.id)
  .maybeSingle()

// If no profile exists yet, create one now
if (!profileData) {
  await supabase.from('profiles').insert({
    id: user.id,
    email: user.email,
    role: 'parent',
  })
  // Reload after insert
  await checkParentAndLoad()
  return
}

if (profileData?.role !== 'parent') {
  router.push('/login')
  return
}

    setProfile(profileData)
    await loadChildren(user.id)
    setLoading(false)
  }

  const loadChildren = async (parentId: string) => {
    const { data } = await supabase
      .from('children')
      .select('*')
      .eq('parent_id', parentId)
      .order('created_at', { ascending: false })

    if (data) setChildren(data)
  }

  const handleAddChild = async () => {
    setAdding(true)
    setError('')

    if (!childName.trim()) {
      setError('Please enter your child\'s name')
      setAdding(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()

    const { error: insertError } = await supabase
      .from('children')
      .insert({
        parent_id: user?.id,
        full_name: childName.trim(),
        grade: parseInt(childGrade),
        is_active: true,
      })

    if (insertError) {
      setError(insertError.message)
      setAdding(false)
      return
    }

    setChildName('')
    setChildGrade('1')
    setShowAddChild(false)
    await loadChildren(user?.id!)
    setAdding(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: '#888780' }}>
            {profile?.full_name}
          </span>
          {profile?.is_content_manager && (
            <button
              onClick={() => router.push('/content-manager/dashboard')}
              style={{
                padding: '7px 16px',
                background: '#EEEDFE',
                border: '0.5px solid #AFA9EC',
                borderRadius: '8px',
                color: '#534AB7',
                fontSize: '13px',
                cursor: 'pointer',
                fontWeight: '500',
              }}>
              Content manager
            </button>
          )}
          <button
            onClick={handleLogout}
            style={{
              padding: '7px 16px',
              background: 'transparent',
              border: '0.5px solid #D3D1C7',
              borderRadius: '8px',
              color: '#888780',
              fontSize: '13px',
              cursor: 'pointer',
            }}>
            Log out
          </button>
        </div>
      </nav>

      <div style={{ padding: '32px 40px' }}>

{/* Family Code Card */}
<div style={{
  background: '#ffffff',
  border: '0.5px solid #e5e3db',
  borderRadius: '12px',
  padding: '20px 24px',
  marginBottom: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '12px',
}}>
  <div>
    <p style={{ fontSize: '13px', color: '#888780', marginBottom: '4px' }}>
      Your family code
    </p>
    <p style={{ fontSize: '28px', fontWeight: '500', color: '#26215C', letterSpacing: '6px', margin: 0 }}>
      {profile?.family_code}
    </p>
    <p style={{ fontSize: '12px', color: '#888780', marginTop: '4px' }}>
      Share this code with your children so they can log in
    </p>
  </div>
  <button
    onClick={() => navigator.clipboard.writeText(profile?.family_code || '')}
    style={{
      padding: '8px 18px',
      background: '#EEEDFE',
      border: '0.5px solid #AFA9EC',
      borderRadius: '8px',
      fontSize: '13px',
      color: '#534AB7',
      cursor: 'pointer',
      fontWeight: '500',
    }}>
    Copy code
  </button>
</div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '28px',
        }}>
          <div>
            <h1 style={{
              fontSize: '22px',
              fontWeight: '500',
              color: '#2C2C2A',
              marginBottom: '6px',
            }}>
              Welcome back, {profile?.full_name?.split(' ')[0]}
            </h1>
            <p style={{ fontSize: '14px', color: '#888780' }}>
              Manage your children's learning journey
            </p>
          </div>
          <button
            onClick={() => setShowAddChild(true)}
            style={{
              padding: '10px 20px',
              background: '#7F77DD',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
            }}>
            + Add child
          </button>
        </div>

        {showAddChild && (
          <div style={{
            background: '#ffffff',
            border: '0.5px solid #e5e3db',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
          }}>
            <h2 style={{
              fontSize: '16px',
              fontWeight: '500',
              color: '#2C2C2A',
              marginBottom: '20px',
            }}>
              Add a child
            </h2>

            {error && (
              <div style={{
                background: '#FCEBEB',
                border: '0.5px solid #F09595',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '16px',
                fontSize: '13px',
                color: '#A32D2D',
              }}>
                {error}
              </div>
            )}

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '16px',
            }}>
              <div>
                <label style={{
                  fontSize: '13px',
                  color: '#444441',
                  display: 'block',
                  marginBottom: '6px',
                }}>
                  Child's name
                </label>
                <input
                  type="text"
                  placeholder="Enter child's name"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
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
              <div>
                <label style={{
                  fontSize: '13px',
                  color: '#444441',
                  display: 'block',
                  marginBottom: '6px',
                }}>
                  Grade
                </label>
                <select
                  value={childGrade}
                  onChange={(e) => setChildGrade(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '0.5px solid #D3D1C7',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    background: '#fff',
                    boxSizing: 'border-box',
                  }}>
                  {[1,2,3,4,5,6,7,8,9,10].map(g => (
                    <option key={g} value={g}>Grade {g}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleAddChild}
                disabled={adding}
                style={{
                  padding: '10px 20px',
                  background: adding ? '#AFA9EC' : '#7F77DD',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: adding ? 'not-allowed' : 'pointer',
                }}>
                {adding ? 'Adding...' : 'Add child'}
              </button>
              <button
                onClick={() => {
                  setShowAddChild(false)
                  setError('')
                  setChildName('')
                }}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  color: '#888780',
                  border: '0.5px solid #D3D1C7',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {children.length === 0 ? (
          <div style={{
            background: '#ffffff',
            border: '0.5px solid #e5e3db',
            borderRadius: '12px',
            padding: '60px 40px',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '40px',
              marginBottom: '16px',
            }}>👨‍👧</div>
            <p style={{
              fontSize: '16px',
              fontWeight: '500',
              color: '#2C2C2A',
              marginBottom: '8px',
            }}>
              No children added yet
            </p>
            <p style={{
              fontSize: '14px',
              color: '#888780',
              marginBottom: '20px',
            }}>
              Add your first child to start assigning subjects and tracking progress
            </p>
            <button
              onClick={() => setShowAddChild(true)}
              style={{
                padding: '10px 20px',
                background: '#7F77DD',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
              }}>
              + Add your first child
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
          }}>
            {children.map((child) => (
              <div
                key={child.id}
                style={{
                  background: '#ffffff',
                  border: '0.5px solid #e5e3db',
                  borderRadius: '12px',
                  padding: '24px',
                  cursor: 'pointer',
                }}
                onClick={() => router.push(`/parent/child/${child.id}`)}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  marginBottom: '16px',
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: '#EEEDFE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: '500',
                    color: '#534AB7',
                  }}>
                    {child.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{
                      fontSize: '15px',
                      fontWeight: '500',
                      color: '#2C2C2A',
                      marginBottom: '2px',
                    }}>
                      {child.full_name}
                    </p>
                    <p style={{
                      fontSize: '13px',
                      color: '#888780',
                    }}>
                      Grade {child.grade}
                    </p>
                  </div>
                </div>
                <div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}}>
  <span style={{
    background: child.is_active ? '#E1F5EE' : '#FCEBEB',
    color: child.is_active ? '#085041' : '#A32D2D',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '12px',
  }}>
    {child.is_active ? 'Active' : 'Inactive'}
  </span>
  <div style={{ display: 'flex', gap: '8px' }}>
    <button
      onClick={(e) => {
        e.stopPropagation()
        router.push(`/parent/progress/${child.id}`)
      }}
      style={{
        padding: '4px 10px',
        background: '#EEEDFE',
        border: '0.5px solid #AFA9EC',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#534AB7',
        cursor: 'pointer',
      }}>
      📊 Progress
    </button>
    <span style={{
      fontSize: '12px',
      color: '#7F77DD',
      display: 'flex',
      alignItems: 'center',
    }}>
      View →
    </span>
  </div>
</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}