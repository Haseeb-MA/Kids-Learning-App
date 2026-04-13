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
  lesson_count?: number
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
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [deadline, setDeadline] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [error, setError] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [pin, setPin] = useState('')
  const [savingPin, setSavingPin] = useState(false)
  const [pinSaved, setPinSaved] = useState(false)
  const [pinReset, setPinReset] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    document.title = 'Child details · BrightMinds'
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
    document.title = `${childData.full_name} · BrightMinds`

    const { data: fetchedSubjects } = await supabase
  .from('subjects')
  .select('*')
  .eq('grade_level', childData.grade)
  .eq('is_active', true)
  .order('category')

if (fetchedSubjects) {
  const { data: lessonCounts } = await supabase
    .from('lessons')
    .select('subject_id')
    .in('subject_id', fetchedSubjects.map(s => s.id))

  const enriched = fetchedSubjects.map(s => ({
    ...s,
    lesson_count: lessonCounts?.filter(l => l.subject_id === s.id).length || 0,
  }))

  setSubjectList(enriched)
}
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
      a => a.subject_id === selectedSubject.id
    )

    if (alreadyAssigned) {
      setError('This subject is already assigned')
      setAssigning(false)
      return
    }

    const { error: insertError } = await supabase
      .from('assigned_subjects')
      .insert({
        child_id: id,
        subject_id: selectedSubject.id,
        deadline,
        completed: false,
      })

    if (insertError) {
      setError(insertError.message)
      setAssigning(false)
      return
    }

    setSelectedSubject(null)
    setDeadline('')
    setShowAssign(false)
    setSuccess(`${selectedSubject.name} assigned successfully!`)
    setTimeout(() => setSuccess(''), 3000)
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

  const handleResetPin = async () => {
    const { error } = await supabase
      .from('children')
      .update({ pin: null })
      .eq('id', id)

    if (!error) {
      setPin('')
      setPinSaved(false)
      setPinReset(true)
      setTimeout(() => setPinReset(false), 3000)
    }
  }

  const setQuickDeadline = (days: number) => {
    const date = new Date()
    date.setDate(date.getDate() + days)
    setDeadline(date.toISOString().split('T')[0])
  }

  const getDaysLeft = (deadline: string) => {
    return Math.ceil(
      (new Date(deadline).getTime() - new Date().getTime())
      / (1000 * 60 * 60 * 24)
    )
  }

  const getDeadlineColor = (deadline: string) => {
    const days = getDaysLeft(deadline)
    if (days < 0) return '#A32D2D'
    if (days <= 7) return '#854F0B'
    return '#085041'
  }

  const getDeadlineBg = (deadline: string) => {
    const days = getDaysLeft(deadline)
    if (days < 0) return '#FCEBEB'
    if (days <= 7) return '#FAEEDA'
    return '#E1F5EE'
  }

  const getDeadlineText = (deadline: string) => {
    const days = getDaysLeft(deadline)
    if (days < 0) return `Overdue · ${new Date(deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
    if (days === 0) return 'Due today'
    if (days === 1) return '1 day left'
    if (days <= 7) return `${days} days left · Due soon`
    return `${days} days left · ${new Date(deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Mathematics': return '➕'
      case 'English': return '📖'
      case 'Science': return '🔬'
      default: return '📚'
    }
  }

  const getCategoryBg = (category: string) => {
    switch (category) {
      case 'Mathematics': return '#EAF3DE'
      case 'English': return '#E6F1FB'
      case 'Science': return '#FAEEDA'
      default: return '#EEEDFE'
    }
  }

  const categories = ['All', ...Array.from(
    new Set(subjectList.map(s => s.category))
  )]

  const filteredSubjects = activeCategory === 'All'
    ? subjectList
    : subjectList.filter(s => s.category === activeCategory)

  const isAlreadyAssigned = (subjectId: string) => {
    return assigned.some(a => a.subject_id === subjectId)
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

        {success && (
          <div style={{
            background: '#E1F5EE',
            border: '0.5px solid #9FE1CB',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            fontSize: '13px',
            color: '#085041',
          }}>
            ✓ {success}
          </div>
        )}

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
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => router.push(`/parent/progress/${id}`)}
              style={{
                padding: '10px 16px',
                background: '#EEEDFE',
                border: '0.5px solid #AFA9EC',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#534AB7',
                cursor: 'pointer',
              }}>
              📊 Progress
            </button>
            <button
              onClick={() => setShowAssign(!showAssign)}
              style={{
                padding: '10px 20px',
                background: showAssign ? '#f5f4f0' : '#7F77DD',
                color: showAssign ? '#888780' : '#fff',
                border: showAssign ? '0.5px solid #D3D1C7' : 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
              }}>
              {showAssign ? 'Cancel' : '+ Assign subject'}
            </button>
          </div>
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
              marginBottom: '4px',
            }}>
              Assign a subject
            </h2>
            <p style={{
              fontSize: '13px',
              color: '#888780',
              marginBottom: '16px',
            }}>
              Grade {child?.grade} subjects · tap to select
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
                    padding: '5px 14px',
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
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: '10px',
                marginBottom: '16px',
              }}>
                {filteredSubjects.map(subject => {
                  const alreadyAssigned = isAlreadyAssigned(subject.id)
                  const isSelected = selectedSubject?.id === subject.id
                  const hasNoLessons = (subject.lesson_count || 0) === 0

                  return (
                    <div
                      key={subject.id}
                      onClick={() => {
                        if (!alreadyAssigned && !hasNoLessons) {
                          setSelectedSubject(isSelected ? null : subject)
                          setError('')
                        }
                      }}
                      style={{
  background: alreadyAssigned || hasNoLessons
    ? '#f5f4f0'
    : isSelected
    ? '#EEEDFE'
    : '#ffffff',
  border: isSelected
    ? '2px solid #7F77DD'
    : '0.5px solid #e5e3db',
  borderRadius: '12px',
  padding: '14px',
  cursor: alreadyAssigned || hasNoLessons ? 'default' : 'pointer',
  opacity: alreadyAssigned || hasNoLessons ? 0.6 : 1,
  transition: 'border-color 0.15s',
}}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: getCategoryBg(subject.category),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '16px',
                        marginBottom: '8px',
                      }}>
                        {getCategoryIcon(subject.category)}
                      </div>
                      <p style={{
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#2C2C2A',
                        margin: '0 0 2px',
                      }}>
                        {subject.name}
                      </p>
                      <p style={{
                        fontSize: '11px',
                        color: '#888780',
                        margin: 0,
                      }}>
                        {subject.category}
                      </p>
                      {alreadyAssigned && (
  <span style={{
    display: 'inline-block',
    marginTop: '6px',
    background: '#E1F5EE',
    color: '#085041',
    fontSize: '10px',
    padding: '2px 8px',
    borderRadius: '10px',
  }}>
    Already assigned
  </span>
)}
{!alreadyAssigned && hasNoLessons && (
  <span style={{
    display: 'inline-block',
    marginTop: '6px',
    background: '#FCEBEB',
    color: '#A32D2D',
    fontSize: '10px',
    padding: '2px 8px',
    borderRadius: '10px',
  }}>
    No lessons yet
  </span>
)}
{!alreadyAssigned && !hasNoLessons && (
  <span style={{
    display: 'inline-block',
    marginTop: '6px',
    background: '#E1F5EE',
    color: '#085041',
    fontSize: '10px',
    padding: '2px 8px',
    borderRadius: '10px',
  }}>
    {subject.lesson_count} lesson{subject.lesson_count !== 1 ? 's' : ''}
  </span>
)}
                    </div>
                  )
                })}
              </div>
            )}

            {selectedSubject && (
              <div style={{
                background: '#EEEDFE',
                border: '0.5px solid #AFA9EC',
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#26215C',
                    margin: '0 0 2px',
                  }}>
                    {selectedSubject.name} selected
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: '#534AB7',
                    margin: 0,
                  }}>
                    {selectedSubject.category} · Grade {selectedSubject.grade_level}
                  </p>
                </div>
                <span style={{ fontSize: '18px' }}>✓</span>
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                fontSize: '13px',
                color: '#444441',
                display: 'block',
                marginBottom: '8px',
              }}>
                Completion deadline
              </label>
              <div style={{
                display: 'flex',
                gap: '10px',
                flexWrap: 'wrap',
                alignItems: 'center',
              }}>
                <input
                  type="date"
                  value={deadline}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDeadline(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    border: '0.5px solid #D3D1C7',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span style={{
                    fontSize: '12px',
                    color: '#888780',
                    alignSelf: 'center',
                  }}>
                    Quick set:
                  </span>
                  {[
                    { label: '1 week', days: 7 },
                    { label: '2 weeks', days: 14 },
                    { label: '1 month', days: 30 },
                  ].map(({ label, days }) => (
                    <button
                      key={label}
                      onClick={() => setQuickDeadline(days)}
                      style={{
                        padding: '6px 12px',
                        border: '0.5px solid #D3D1C7',
                        borderRadius: '6px',
                        fontSize: '12px',
                        background: '#ffffff',
                        color: '#444441',
                        cursor: 'pointer',
                      }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleAssign}
                disabled={assigning || !selectedSubject || !deadline}
                style={{
                  padding: '10px 20px',
                  background: assigning || !selectedSubject || !deadline
                    ? '#AFA9EC' : '#7F77DD',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: assigning || !selectedSubject || !deadline
                    ? 'not-allowed' : 'pointer',
                }}>
                {assigning ? 'Assigning...' : 'Assign subject'}
              </button>
              <button
                onClick={() => {
                  setShowAssign(false)
                  setSelectedSubject(null)
                  setDeadline('')
                  setError('')
                  setActiveCategory('All')
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

          {pinReset && (
            <div style={{
              background: '#FAEEDA',
              border: '0.5px solid #FAC775',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '16px',
              fontSize: '13px',
              color: '#633806',
            }}>
              PIN has been reset. Please set a new one.
            </div>
          )}

          {pinSaved && (
            <div style={{
              background: '#E1F5EE',
              border: '0.5px solid #9FE1CB',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '16px',
              fontSize: '13px',
              color: '#085041',
            }}>
              PIN saved successfully
            </div>
          )}

          <div style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}>
            <input
              type="number"
              placeholder="Enter 4 digit PIN"
              value={pin}
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
            <button
              onClick={handleResetPin}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                color: '#A32D2D',
                border: '0.5px solid #F09595',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
              }}>
              Reset PIN
            </button>
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
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: getCategoryBg(item.subjects.category),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                    }}>
                      {getCategoryIcon(item.subjects.category)}
                    </div>
                    <div>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#2C2C2A',
                        margin: '0 0 2px',
                      }}>
                        {item.subjects.name}
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: '#888780',
                        margin: 0,
                      }}>
                        {item.subjects.category}
                      </p>
                    </div>
                  </div>
                  <span style={{
                    background: item.completed ? '#E1F5EE' : '#EEEDFE',
                    color: item.completed ? '#085041' : '#534AB7',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    whiteSpace: 'nowrap',
                  }}>
                    {item.completed ? 'Completed ✓' : 'In progress'}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{
                    background: item.completed
                      ? '#E1F5EE'
                      : getDeadlineBg(item.deadline),
                    color: item.completed
                      ? '#085041'
                      : getDeadlineColor(item.deadline),
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                  }}>
                    {item.completed
                      ? 'Done'
                      : getDeadlineText(item.deadline)}
                  </span>
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