'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Lesson {
  id: string
  title: string
  content: string
  order_number: number
}

interface Subject {
  name: string
  category: string
}

export default function SubjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [subject, setSubject] = useState<Subject | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [completedLessons, setCompletedLessons] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [childId, setChildId] = useState('')

  useEffect(() => {
    const storedId = localStorage.getItem('childId')
    if (!storedId) {
      router.push('/child-login')
      return
    }
    setChildId(storedId)
    loadData(storedId)
  }, [])

  const loadData = async (cId: string) => {
    const { data: subjectData } = await supabase
      .from('subjects')
      .select('name, category')
      .eq('id', id)
      .single()

    if (subjectData) setSubject(subjectData)

    const { data: lessonData } = await supabase
      .from('lessons')
      .select('*')
      .eq('subject_id', id)
      .order('order_number')

    if (lessonData) setLessons(lessonData)

    const { data: progressData } = await supabase
      .from('progress')
      .select('quiz_id, quizzes(lesson_id)')
      .eq('child_id', cId)

    if (progressData) {
      const lessonIds = progressData
        .map((p: any) => p.quizzes?.lesson_id)
        .filter(Boolean)
      setCompletedLessons([...new Set(lessonIds)] as string[])
    }

    setLoading(false)
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
        background: '#7F77DD',
        padding: '14px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => router.push('/child/dashboard')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#CECBF6',
              fontSize: '14px',
              padding: '0',
            }}>
            ← Back
          </button>
          <span style={{ color: '#AFA9EC' }}>|</span>
          <span style={{
            fontSize: '16px',
            fontWeight: '500',
            color: '#ffffff',
          }}>
            {subject?.name}
          </span>
        </div>
      </nav>

      <div style={{ padding: '32px 40px' }}>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '28px',
        }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: getCategoryBg(subject?.category || ''),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '26px',
          }}>
            {getCategoryIcon(subject?.category || '')}
          </div>
          <div>
            <h1 style={{
              fontSize: '22px',
              fontWeight: '500',
              color: '#2C2C2A',
              marginBottom: '4px',
            }}>
              {subject?.name}
            </h1>
            <p style={{ fontSize: '14px', color: '#888780' }}>
              {lessons.length} lesson{lessons.length !== 1 ? 's' : ''} ·{' '}
              {completedLessons.length} completed
            </p>
          </div>
        </div>

        {lessons.length === 0 ? (
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
              No lessons yet
            </p>
            <p style={{ fontSize: '13px', color: '#888780' }}>
              Your teacher is preparing lessons for this subject
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {lessons.map((lesson, index) => {
              const isCompleted = completedLessons.includes(lesson.id)
              return (
                <div
                  key={lesson.id}
                  onClick={() => router.push(`/child/lesson/${lesson.id}`)}
                  style={{
                    background: '#ffffff',
                    border: isCompleted
                      ? '0.5px solid #9FE1CB'
                      : '0.5px solid #e5e3db',
                    borderRadius: '12px',
                    padding: '20px 24px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: isCompleted ? '#E1F5EE' : '#EEEDFE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: isCompleted ? '#085041' : '#534AB7',
                      flexShrink: 0,
                    }}>
                      {isCompleted ? '✓' : index + 1}
                    </div>
                    <div>
                      <p style={{
                        fontSize: '15px',
                        fontWeight: '500',
                        color: '#2C2C2A',
                        marginBottom: '3px',
                      }}>
                        {lesson.title}
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: '#888780',
                      }}>
                        {lesson.content.substring(0, 60)}...
                      </p>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '12px',
                    color: isCompleted ? '#085041' : '#7F77DD',
                    background: isCompleted ? '#E1F5EE' : '#EEEDFE',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    whiteSpace: 'nowrap',
                    marginLeft: '12px',
                  }}>
                    {isCompleted ? 'Done ✓' : 'Start →'}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}