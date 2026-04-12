'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Subject {
  id: string
  name: string
  category: string
  grade_level: number
  is_active: boolean
  lesson_count?: number
  quiz_count?: number
}

export default function AdminContent() {
  const router = useRouter()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [activeGrade, setActiveGrade] = useState<number | 'all'>('all')
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [search, setSearch] = useState('')
  const [showAddSubject, setShowAddSubject] = useState(false)
  const [newSubjectName, setNewSubjectName] = useState('')
  const [newSubjectCategory, setNewSubjectCategory] = useState('Mathematics')
  const [newSubjectGrade, setNewSubjectGrade] = useState('1')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    checkAdminAndLoad()
  }, [])

  const checkAdminAndLoad = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      router.push('/login')
      return
    }

    await loadSubjects()
    setLoading(false)
  }

  const loadSubjects = async () => {
    const { data: subjectsData } = await supabase
      .from('subjects')
      .select('*')
      .order('grade_level')
      .order('category')
      .order('name')

    if (!subjectsData) return

    const { data: lessonsData } = await supabase
      .from('lessons')
      .select('id, subject_id')

    const { data: quizzesData } = await supabase
      .from('quizzes')
      .select('id, lesson_id, lessons(subject_id)')

    const enriched = subjectsData.map(s => ({
      ...s,
      lesson_count: lessonsData?.filter(l => l.subject_id === s.id).length || 0,
      quiz_count: quizzesData?.filter((q: any) =>
        q.lessons?.subject_id === s.id
      ).length || 0,
    }))

    setSubjects(enriched)
  }

  const handleAddSubject = async () => {
    setAdding(true)
    setError('')

    if (!newSubjectName.trim()) {
      setError('Please enter a subject name')
      setAdding(false)
      return
    }

    const { error: insertError } = await supabase
      .from('subjects')
      .insert({
        name: newSubjectName.trim(),
        category: newSubjectCategory,
        grade_level: parseInt(newSubjectGrade),
        is_active: true,
      })

    if (insertError) {
      setError(insertError.message)
      setAdding(false)
      return
    }

    setNewSubjectName('')
    setNewSubjectGrade('1')
    setShowAddSubject(false)
    await loadSubjects()
    setAdding(false)
  }

  const toggleSubjectActive = async (id: string, current: boolean) => {
    await supabase
      .from('subjects')
      .update({ is_active: !current })
      .eq('id', id)
    await loadSubjects()
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

  const filteredSubjects = subjects.filter(s => {
    const matchGrade = activeGrade === 'all' || s.grade_level === activeGrade
    const matchCat = activeCategory === 'All' || s.category === activeCategory
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase())
    return matchGrade && matchCat && matchSearch
  })

  const stats = {
    total: subjects.length,
    withLessons: subjects.filter(s => (s.lesson_count || 0) > 0).length,
    withQuizzes: subjects.filter(s => (s.quiz_count || 0) > 0).length,
    empty: subjects.filter(s => (s.lesson_count || 0) === 0).length,
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
        background: '#26215C',
        padding: '14px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => router.push('/admin/dashboard')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#AFA9EC',
              fontSize: '14px',
            }}>
            ← Back
          </button>
          <span style={{ color: '#AFA9EC' }}>|</span>
          <span style={{
            color: '#fff',
            fontSize: '16px',
            fontWeight: '500',
          }}>
            Content manager
          </span>
        </div>
        <button
          onClick={() => setShowAddSubject(true)}
          style={{
            padding: '7px 16px',
            background: '#7F77DD',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '13px',
            cursor: 'pointer',
          }}>
          + Add subject
        </button>
      </nav>

      <div style={{ padding: '32px 40px' }}>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
          marginBottom: '28px',
        }}>
          {[
            { label: 'Total subjects', value: stats.total, bg: '#EEEDFE', color: '#26215C' },
            { label: 'Have lessons', value: stats.withLessons, bg: '#E1F5EE', color: '#085041' },
            { label: 'Have quizzes', value: stats.withQuizzes, bg: '#E6F1FB', color: '#0C447C' },
            { label: 'Empty', value: stats.empty, bg: '#FCEBEB', color: '#A32D2D' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: stat.bg,
              borderRadius: '12px',
              padding: '16px',
            }}>
              <p style={{
                fontSize: '12px',
                color: stat.color,
                opacity: 0.7,
                marginBottom: '6px',
              }}>
                {stat.label}
              </p>
              <p style={{
                fontSize: '28px',
                fontWeight: '500',
                color: stat.color,
              }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {showAddSubject && (
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
              Add new subject
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
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '12px',
              marginBottom: '16px',
            }}>
              <div>
                <label style={{
                  fontSize: '13px',
                  color: '#444441',
                  display: 'block',
                  marginBottom: '6px',
                }}>
                  Subject name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fractions"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
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
                  Category
                </label>
                <select
                  value={newSubjectCategory}
                  onChange={(e) => setNewSubjectCategory(e.target.value)}
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
                  <option>Mathematics</option>
                  <option>English</option>
                  <option>Science</option>
                </select>
              </div>
              <div>
                <label style={{
                  fontSize: '13px',
                  color: '#444441',
                  display: 'block',
                  marginBottom: '6px',
                }}>
                  Grade level
                </label>
                <select
                  value={newSubjectGrade}
                  onChange={(e) => setNewSubjectGrade(e.target.value)}
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
                onClick={handleAddSubject}
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
                {adding ? 'Adding...' : 'Add subject'}
              </button>
              <button
                onClick={() => {
                  setShowAddSubject(false)
                  setError('')
                  setNewSubjectName('')
                }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}>
          <input
            type="text"
            placeholder="Search subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '8px 14px',
              border: '0.5px solid #D3D1C7',
              borderRadius: '8px',
              fontSize: '13px',
              outline: 'none',
              width: '200px',
            }}
          />

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['All', 'Mathematics', 'English', 'Science'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '6px 12px',
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

          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveGrade('all')}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: '0.5px solid',
                borderColor: activeGrade === 'all' ? '#7F77DD' : '#D3D1C7',
                background: activeGrade === 'all' ? '#EEEDFE' : 'transparent',
                color: activeGrade === 'all' ? '#534AB7' : '#888780',
                fontSize: '11px',
                cursor: 'pointer',
              }}>
              All grades
            </button>
            {[1,2,3,4,5,6,7,8,9,10].map(g => (
              <button
                key={g}
                onClick={() => setActiveGrade(g)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: '0.5px solid',
                  borderColor: activeGrade === g ? '#7F77DD' : '#D3D1C7',
                  background: activeGrade === g ? '#EEEDFE' : 'transparent',
                  color: activeGrade === g ? '#534AB7' : '#888780',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}>
                G{g}
              </button>
            ))}
          </div>
        </div>

        <div style={{
          background: '#ffffff',
          border: '0.5px solid #e5e3db',
          borderRadius: '12px',
          overflow: 'hidden',
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px',
          }}>
            <thead>
              <tr style={{ background: '#f5f4f0' }}>
                <th style={thStyle}>Subject</th>
                <th style={thStyle}>Grade</th>
                <th style={thStyle}>Lessons</th>
                <th style={thStyle}>Quizzes</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#888780',
                    fontSize: '14px',
                  }}>
                    No subjects found
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((subject, index) => (
                  <tr key={subject.id} style={{
                    borderTop: index === 0 ? 'none' : '0.5px solid #e5e3db',
                  }}>
                    <td style={tdStyle}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}>
                        <div style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '6px',
                          background: getCategoryBg(subject.category),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                        }}>
                          {getCategoryIcon(subject.category)}
                        </div>
                        <div>
                          <p style={{
                            fontSize: '13px',
                            fontWeight: '500',
                            color: '#2C2C2A',
                            margin: '0 0 1px',
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
                        </div>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        background: '#EEEDFE',
                        color: '#534AB7',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                      }}>
                        Grade {subject.grade_level}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        color: (subject.lesson_count || 0) > 0 ? '#085041' : '#A32D2D',
                        fontWeight: '500',
                      }}>
                        {subject.lesson_count || 0}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        color: (subject.quiz_count || 0) > 0 ? '#085041' : '#A32D2D',
                        fontWeight: '500',
                      }}>
                        {subject.quiz_count || 0}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        background: subject.is_active ? '#E1F5EE' : '#FCEBEB',
                        color: subject.is_active ? '#085041' : '#A32D2D',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                      }}>
                        {subject.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => router.push(`/admin/content/subject/${subject.id}`)}
                          style={{
                            padding: '5px 10px',
                            background: '#EEEDFE',
                            border: '0.5px solid #AFA9EC',
                            borderRadius: '6px',
                            fontSize: '12px',
                            color: '#534AB7',
                            cursor: 'pointer',
                          }}>
                          Manage →
                        </button>
                        <button
                          onClick={() => toggleSubjectActive(subject.id, subject.is_active)}
                          style={{
                            padding: '5px 10px',
                            background: 'transparent',
                            border: '0.5px solid #D3D1C7',
                            borderRadius: '6px',
                            fontSize: '12px',
                            color: subject.is_active ? '#A32D2D' : '#085041',
                            cursor: 'pointer',
                          }}>
                          {subject.is_active ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: '12px',
  color: '#888780',
  fontWeight: '500',
}

const tdStyle: React.CSSProperties = {
  padding: '14px 16px',
  color: '#2C2C2A',
}