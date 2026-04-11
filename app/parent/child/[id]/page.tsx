'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Child {
  id: string
  full_name: string
  grade: number
  is_active: boolean
}

interface Subject {
  id: string
  name: string
  category: string
  grade_level: number
}

interface AssignedSubject {
  id: string
  subject_id: string
  deadline: string
  completed: boolean
  subjects: Subject
}

export default function ChildDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [child, setChild] = useState<Child | null>(null)
  const [subjectList, setSubjectList] = useState<Subject[]>([])
  const [assigned, setAssigned] = useState<AssignedSubject[]>([])
  const [loading, setLoading] = useState(true)
  const [showAssign, setShowAssign] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState('')
  const [deadline, setDeadline] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [error, setError] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [pin, setPin] = useState('')
  const [savingPin, setSavingPin] = useState(false)
  const [pinSaved, setPinSaved] = useState(false)
  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: childData } = await supabase
      .from('children')
      .select('*')
      .eq('id', id)
      .eq('parent_id', user.id)
      .single()

    if (!childData) {
      router.push('/parent/dashboard')
      return
    }

    setChild(childData)

    const { data: fetchedSubjects } = await supabase
      .from('subjects')
      .select('*')
      .eq('grade_level', childData.grade)
      .eq('is_active', true)
      .order('category')

    if (fetchedSubjects) setSubjectList(fetchedSubjects)

    await loadAssigned()
    setLoading(false)
  }

  const loadAssigned = async () => {
    const { data } = await supabase
      .from('assigned_subjects')
      .select(`
        id,
        subject_id,
        deadline,
        completed,
        subjects (
          id,
          name,
          category,
          grade_level
        )
      `)
      .eq('child_id', id)
      .order('deadline', { ascending: true })

    if (data) setAssigned(data as any)
  }

  const handleAssign = async () => {
    setAssigning(true)
    setError('')

    if (!selectedSubject) {
      setError('Please select a subject')
      setAssigning(false)
      return
    }

    if (!deadline) {
      setError('Please set a deadline')
      setAssigning(false)
      return
    }

    const alreadyAssigned = assigned.find(
      a => a.subject_id === selectedSubject
    )

    if (alreadyAssigned) {
      setError('This subject is already assigned to this child')
      setAssigning(false)
      return
    }

    const { error: insertError } = await supabase
      .from('assigned_subjects')
      .insert({
        child_id: id,
        subject_id: selectedSubject,
        deadline,
        completed: false,
      })

    if (insertError) {
      setError(insertError.message)
      setAssigning(false)
      return
    }

    setSelectedSubject('')
    setDeadline('')
    setShowAssign(false)
    await loadAssigned()
    setAssigning(false)
  }

  const handleRemove = async (assignedId: string) => {
    await supabase
      .from('assigned_subjects')
      .delete()
      .eq('id', assignedId)

    await loadAssigned()
  }
const handleSavePin = async () => {
  setSavingPin(true)
  setPinSaved(false)

  if (pin.length !== 4 || !/^\d+$/.test(pin)) {
    setError('PIN must be exactly 4 digits')
    setSavingPin(false)
    return
  }

  const { error: pinError } = await supabase
    .from('children')
    .update({ pin })
    .eq('id', id)

  if (pinError) {
    setError(pinError.message)
    setSavingPin(false)
    return
  }

  setPinSaved(true)
  setSavingPin(false)
}
  const categories = ['All', ...Array.from(
    new Set(subjectList.map(s => s.category))
  )]

  const filteredSubjects = activeCategory === 'All'
    ? subjectList
    : subjectList.filter(s => s.category === activeCategory)

  const isDeadlineSoon = (deadline: string) => {
    const days = Math.ceil(
      (new Date(deadline).getTime() - new Date().getTime())
      / (1000 * 60 * 60 * 24)
    )
    return days <= 7 && days >= 0
  }

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date()
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
          <button
            onClick={() => router.push('/parent/dashboard')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#888780',
              fontSize: '14px',
              padding: '0',
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

      <div style={{ padding: '32px 40px' }}>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '28px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#EEEDFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: '500',
              color: '#534AB7',
            }}>
              {child?.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 style={{
                fontSize: '22px',
                fontWeight: '500',
                color: '#2C2C2A',
                marginBottom: '4px',
              }}>
                {child?.full_name}
              </h1>
              <p style={{ fontSize: '14px', color: '#888780' }}>
                Grade {child?.grade} ·{' '}
                <span style={{
                  color: child?.is_active ? '#085041' : '#A32D2D',
                }}>
                  {child?.is_active ? 'Active' : 'Inactive'}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAssign(true)}
            style={{
              padding: '10px 20px',
              background: '#7F77DD',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
            }}>
            + Assign subject
          </button>
        </div>

        {showAssign && (
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
              marginBottom: '6px',
            }}>
              Assign a subject
            </h2>
            <p style={{
              fontSize: '13px',
              color: '#888780',
              marginBottom: '20px',
            }}>
              Showing Grade {child?.grade} subjects
            </p>

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
              display: 'flex',
              gap: '6px',
              flexWrap: 'wrap',
              marginBottom: '16px',
            }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '20px',
                    border: '0.5px solid',
                    borderColor: activeCategory === cat ? '#7F77DD' : '#D3D1C7',
                    background: activeCategory === cat ? '#EEEDFE' : 'transparent',
                    color: activeCategory === cat ? '#534AB7' : '#888780',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}>
                  {cat}
                </button>
              ))}
            </div>

            {subjectList.length === 0 ? (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                color: '#888780',
                fontSize: '14px',
                background: '#f5f4f0',
                borderRadius: '8px',
                marginBottom: '16px',
              }}>
                No subjects available for Grade {child?.grade} yet.
                Add subjects from the admin panel first.
              </div>
            ) : (
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  fontSize: '13px',
                  color: '#444441',
                  display: 'block',
                  marginBottom: '6px',
                }}>
                  Select subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
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
                  <option value="">Choose a subject...</option>
                  {filteredSubjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.category})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                fontSize: '13px',
                color: '#444441',
                display: 'block',
                marginBottom: '6px',
              }}>
                Completion deadline
              </label>
              <input
                type="date"
                value={deadline}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDeadline(e.target.value)}
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

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleAssign}
                disabled={assigning}
                style={{
                  padding: '10px 20px',
                  background: assigning ? '#AFA9EC' : '#7F77DD',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: assigning ? 'not-allowed' : 'pointer',
                }}>
                {assigning ? 'Assigning...' : 'Assign subject'}
              </button>
              <button
                onClick={() => {
                  setShowAssign(false)
                  setError('')
                  setSelectedSubject('')
                  setDeadline('')
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
    marginBottom: '6px',
  }}>
    Child login PIN
  </h2>
  <p style={{
    fontSize: '13px',
    color: '#888780',
    marginBottom: '16px',
  }}>
    Set a 4 digit PIN your child will use to log in
  </p>
  <div style={{
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  }}>
    <input
      type="number"
      placeholder="Enter 4 digit PIN"
      value={pin}
      maxLength={4}
      onChange={(e) => {
        if (e.target.value.length <= 4) setPin(e.target.value)
      }}
      style={{
        width: '160px',
        padding: '10px 14px',
        border: '0.5px solid #D3D1C7',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box',
      }}
    />
    <button
      onClick={handleSavePin}
      disabled={savingPin}
      style={{
        padding: '10px 20px',
        background: savingPin ? '#AFA9EC' : '#7F77DD',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        cursor: savingPin ? 'not-allowed' : 'pointer',
      }}>
      {savingPin ? 'Saving...' : 'Save PIN'}
    </button>
    {pinSaved && (
      <span style={{
        fontSize: '13px',
        color: '#085041',
        background: '#E1F5EE',
        padding: '6px 12px',
        borderRadius: '8px',
      }}>
        PIN saved successfully
      </span>
    )}
  </div>
</div>
        <h2 style={{
          fontSize: '16px',
          fontWeight: '500',
          color: '#2C2C2A',
          marginBottom: '16px',
        }}>
          Assigned subjects ({assigned.length})
        </h2>

        {assigned.length === 0 ? (
          <div style={{
            background: '#ffffff',
            border: '0.5px solid #e5e3db',
            borderRadius: '12px',
            padding: '48px 40px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📚</div>
            <p style={{
              fontSize: '15px',
              fontWeight: '500',
              color: '#2C2C2A',
              marginBottom: '6px',
            }}>
              No subjects assigned yet
            </p>
            <p style={{ fontSize: '13px', color: '#888780' }}>
              Click "Assign subject" to get started
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '12px',
          }}>
            {assigned.map((item) => (
              <div key={item.id} style={{
                background: '#ffffff',
                border: '0.5px solid #e5e3db',
                borderRadius: '12px',
                padding: '18px',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px',
                }}>
                  <div>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#2C2C2A',
                      marginBottom: '3px',
                    }}>
                      {item.subjects.name}
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: '#888780',
                    }}>
                      {item.subjects.category}
                    </p>
                  </div>
                  <span style={{
                    background: item.completed ? '#E1F5EE' : '#EEEDFE',
                    color: item.completed ? '#085041' : '#534AB7',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                  }}>
                    {item.completed ? 'Completed' : 'In progress'}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <p style={{
                      fontSize: '11px',
                      color: '#888780',
                      marginBottom: '2px',
                    }}>
                      Deadline
                    </p>
                    <p style={{
                      fontSize: '13px',
                      color: isOverdue(item.deadline)
                        ? '#A32D2D'
                        : isDeadlineSoon(item.deadline)
                        ? '#854F0B'
                        : '#2C2C2A',
                      fontWeight: '500',
                    }}>
                      {new Date(item.deadline).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                      {isOverdue(item.deadline) && ' · Overdue'}
                      {isDeadlineSoon(item.deadline) &&
                        !isOverdue(item.deadline) && ' · Due soon'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemove(item.id)}
                    style={{
                      padding: '5px 10px',
                      background: 'transparent',
                      border: '0.5px solid #F09595',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#A32D2D',
                      cursor: 'pointer',
                    }}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}