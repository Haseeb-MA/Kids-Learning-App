'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Subject {
  id: string
  name: string
  category: string
  grade_level: number
}

interface Lesson {
  id: string
  title: string
  content: string
  order_number: number
}

interface Quiz {
  id: string
  lesson_id: string
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
}

interface GeneratedQuestion {
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
  explanation: string
  accepted?: boolean
  discarded?: boolean
}

export default function SubjectDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [subject, setSubject] = useState<Subject | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null)
  const [showAddLesson, setShowAddLesson] = useState(false)
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonContent, setLessonContent] = useState('')
  const [savingLesson, setSavingLesson] = useState(false)
  const [generatingLesson, setGeneratingLesson] = useState(false)
  const [generatingQuestions, setGeneratingQuestions] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([])
  const [savingQuestions, setSavingQuestions] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: subjectData } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', id)
      .single()

    if (subjectData) setSubject(subjectData)

    const { data: lessonData } = await supabase
      .from('lessons')
      .select('*')
      .eq('subject_id', id)
      .order('order_number')

    if (lessonData) {
      setLessons(lessonData)
      if (lessonData.length > 0 && !activeLesson) {
        setActiveLesson(lessonData[0])
      }
    }

    const { data: quizData } = await supabase
      .from('quizzes')
      .select('*')
      .in('lesson_id', lessonData?.map(l => l.id) || [])

    if (quizData) setQuizzes(quizData)
    setLoading(false)
  }

  const handleGenerateLesson = async () => {
    setGeneratingLesson(true)
    setError('')

    try {
      const response = await fetch('/api/generate-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectName: subject?.name,
          gradeLevel: subject?.grade_level,
          topic: lessonTitle || subject?.name,
        }),
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      setLessonTitle(data.lesson.title)
      setLessonContent(data.lesson.content)
    } catch (err: any) {
      setError(err.message || 'Failed to generate lesson')
    }

    setGeneratingLesson(false)
  }

  const handleSaveLesson = async () => {
    setSavingLesson(true)
    setError('')

    if (!lessonTitle.trim() || !lessonContent.trim()) {
      setError('Please fill in both title and content')
      setSavingLesson(false)
      return
    }

    const { data, error: insertError } = await supabase
      .from('lessons')
      .insert({
        subject_id: id,
        title: lessonTitle.trim(),
        content: lessonContent.trim(),
        grade_level: subject?.grade_level,
        order_number: lessons.length + 1,
      })
      .select()
      .single()

    if (insertError) {
      setError(insertError.message)
      setSavingLesson(false)
      return
    }

    setLessonTitle('')
    setLessonContent('')
    setShowAddLesson(false)
    setSuccess('Lesson saved successfully!')
    setTimeout(() => setSuccess(''), 3000)
    await loadData()
    if (data) setActiveLesson(data)
    setSavingLesson(false)
  }

  const handleGenerateQuestions = async () => {
    if (!activeLesson) return
    setGeneratingQuestions(true)
    setGeneratedQuestions([])
    setError('')

    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonTitle: activeLesson.title,
          lessonContent: activeLesson.content,
          gradeLevel: subject?.grade_level,
          subjectName: subject?.name,
        }),
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      setGeneratedQuestions(data.questions.map((q: GeneratedQuestion) => ({
        ...q,
        accepted: false,
        discarded: false,
      })))
    } catch (err: any) {
      setError(err.message || 'Failed to generate questions')
    }

    setGeneratingQuestions(false)
  }

  const handleAcceptAll = () => {
    setGeneratedQuestions(prev =>
      prev.map(q => ({ ...q, accepted: true, discarded: false }))
    )
  }

  const handleAcceptQuestion = (index: number) => {
    setGeneratedQuestions(prev =>
      prev.map((q, i) => i === index ? { ...q, accepted: true, discarded: false } : q)
    )
  }

  const handleDiscardQuestion = (index: number) => {
    setGeneratedQuestions(prev =>
      prev.map((q, i) => i === index ? { ...q, discarded: true, accepted: false } : q)
    )
  }

  const handleSaveQuestions = async () => {
    if (!activeLesson) return
    setSavingQuestions(true)
    setError('')

    const toSave = generatedQuestions.filter(q => q.accepted && !q.discarded)

    if (toSave.length === 0) {
      setError('Please accept at least one question before saving')
      setSavingQuestions(false)
      return
    }

    const { error: insertError } = await supabase
      .from('quizzes')
      .insert(toSave.map(q => ({
        lesson_id: activeLesson.id,
        question: q.question,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer,
        grade_level: subject?.grade_level,
      })))

    if (insertError) {
      setError(insertError.message)
      setSavingQuestions(false)
      return
    }

    setGeneratedQuestions([])
    setSuccess(`${toSave.length} questions saved successfully!`)
    setTimeout(() => setSuccess(''), 3000)
    await loadData()
    setSavingQuestions(false)
  }

  const handleDeleteLesson = async (lessonId: string) => {
    await supabase.from('quizzes').delete().eq('lesson_id', lessonId)
    await supabase.from('lessons').delete().eq('id', lessonId)
    await loadData()
    setActiveLesson(null)
  }

  const handleDeleteQuiz = async (quizId: string) => {
    await supabase.from('quizzes').delete().eq('id', quizId)
    await loadData()
  }

  const getLessonQuizzes = (lessonId: string) => {
    return quizzes.filter(q => q.lesson_id === lessonId)
  }

  const getOptionLabel = (correct: string) => {
    const map: Record<string, string> = { a: 'A', b: 'B', c: 'C', d: 'D' }
    return map[correct] || correct
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
            onClick={() => router.push('/admin/content')}
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
          <span style={{ color: '#fff', fontSize: '16px', fontWeight: '500' }}>
            {subject?.name}
          </span>
          <span style={{
            background: '#534AB7',
            color: '#CECBF6',
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '20px',
          }}>
            Grade {subject?.grade_level}
          </span>
        </div>
        <button
          onClick={() => setShowAddLesson(true)}
          style={{
            padding: '7px 16px',
            background: '#7F77DD',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '13px',
            cursor: 'pointer',
          }}>
          + Add lesson
        </button>
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

        {error && (
          <div style={{
            background: '#FCEBEB',
            border: '0.5px solid #F09595',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            fontSize: '13px',
            color: '#A32D2D',
          }}>
            {error}
          </div>
        )}

        {showAddLesson && (
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
              Add new lesson
            </h2>

            <div style={{ marginBottom: '14px' }}>
              <label style={{
                fontSize: '13px',
                color: '#444441',
                display: 'block',
                marginBottom: '6px',
              }}>
                Lesson title
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="e.g. Introduction to Decimals"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    border: '0.5px solid #D3D1C7',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={handleGenerateLesson}
                  disabled={generatingLesson}
                  style={{
                    padding: '10px 16px',
                    background: generatingLesson ? '#AFA9EC' : '#EEEDFE',
                    border: '0.5px solid #AFA9EC',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#534AB7',
                    cursor: generatingLesson ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap',
                  }}>
                  {generatingLesson ? '🤖 Generating...' : '🤖 Generate with AI'}
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                fontSize: '13px',
                color: '#444441',
                display: 'block',
                marginBottom: '6px',
              }}>
                Lesson content
              </label>
              <textarea
                placeholder="Write or generate lesson content here..."
                value={lessonContent}
                onChange={(e) => setLessonContent(e.target.value)}
                rows={8}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '0.5px solid #D3D1C7',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  lineHeight: '1.6',
                  boxSizing: 'border-box',
                }}
              />
              <p style={{
                fontSize: '12px',
                color: '#888780',
                marginTop: '4px',
              }}>
                {lessonContent.length} characters
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSaveLesson}
                disabled={savingLesson}
                style={{
                  padding: '10px 20px',
                  background: savingLesson ? '#AFA9EC' : '#7F77DD',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: savingLesson ? 'not-allowed' : 'pointer',
                }}>
                {savingLesson ? 'Saving...' : 'Save lesson'}
              </button>
              <button
                onClick={() => {
                  setShowAddLesson(false)
                  setLessonTitle('')
                  setLessonContent('')
                  setError('')
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
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: '20px',
        }}>

          <div>
            <h2 style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#2C2C2A',
              marginBottom: '12px',
            }}>
              Lessons ({lessons.length})
            </h2>
            {lessons.length === 0 ? (
              <div style={{
                background: '#ffffff',
                border: '0.5px solid #e5e3db',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
              }}>
                <p style={{ fontSize: '13px', color: '#888780' }}>
                  No lessons yet
                </p>
                <button
                  onClick={() => setShowAddLesson(true)}
                  style={{
                    marginTop: '10px',
                    padding: '8px 14px',
                    background: '#7F77DD',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}>
                  Add first lesson
                </button>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}>
                {lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    onClick={() => setActiveLesson(lesson)}
                    style={{
                      background: activeLesson?.id === lesson.id ? '#EEEDFE' : '#ffffff',
                      border: activeLesson?.id === lesson.id
                        ? '0.5px solid #AFA9EC'
                        : '0.5px solid #e5e3db',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      cursor: 'pointer',
                    }}>
                    <p style={{
                      fontSize: '13px',
                      fontWeight: '500',
                      color: activeLesson?.id === lesson.id ? '#26215C' : '#2C2C2A',
                      marginBottom: '3px',
                    }}>
                      {lesson.title}
                    </p>
                    <p style={{
                      fontSize: '11px',
                      color: '#888780',
                    }}>
                      {getLessonQuizzes(lesson.id).length} quiz questions
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            {activeLesson ? (
              <>
                <div style={{
                  background: '#ffffff',
                  border: '0.5px solid #e5e3db',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '16px',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '14px',
                  }}>
                    <h2 style={{
                      fontSize: '16px',
                      fontWeight: '500',
                      color: '#2C2C2A',
                      margin: 0,
                    }}>
                      {activeLesson.title}
                    </h2>
                    <button
                      onClick={() => handleDeleteLesson(activeLesson.id)}
                      style={{
                        padding: '5px 10px',
                        background: 'transparent',
                        border: '0.5px solid #F09595',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#A32D2D',
                        cursor: 'pointer',
                      }}>
                      Delete lesson
                    </button>
                  </div>
                  <p style={{
                    fontSize: '14px',
                    color: '#444441',
                    lineHeight: '1.7',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {activeLesson.content}
                  </p>
                </div>

                <div style={{
                  background: '#ffffff',
                  border: '0.5px solid #e5e3db',
                  borderRadius: '12px',
                  padding: '24px',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                  }}>
                    <h2 style={{
                      fontSize: '16px',
                      fontWeight: '500',
                      color: '#2C2C2A',
                      margin: 0,
                    }}>
                      Quiz questions ({getLessonQuizzes(activeLesson.id).length})
                    </h2>
                    <button
                      onClick={handleGenerateQuestions}
                      disabled={generatingQuestions}
                      style={{
                        padding: '8px 16px',
                        background: generatingQuestions ? '#AFA9EC' : '#7F77DD',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        cursor: generatingQuestions ? 'not-allowed' : 'pointer',
                      }}>
                      {generatingQuestions ? '🤖 Generating...' : '🤖 Generate with AI'}
                    </button>
                  </div>

                  {getLessonQuizzes(activeLesson.id).map((quiz, index) => (
                    <div key={quiz.id} style={{
                      background: '#f5f4f0',
                      borderRadius: '10px',
                      padding: '14px',
                      marginBottom: '10px',
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '10px',
                      }}>
                        <p style={{
                          fontSize: '13px',
                          fontWeight: '500',
                          color: '#2C2C2A',
                          margin: 0,
                        }}>
                          {index + 1}. {quiz.question}
                        </p>
                        <button
                          onClick={() => handleDeleteQuiz(quiz.id)}
                          style={{
                            padding: '3px 8px',
                            background: 'transparent',
                            border: '0.5px solid #F09595',
                            borderRadius: '6px',
                            fontSize: '11px',
                            color: '#A32D2D',
                            cursor: 'pointer',
                            flexShrink: 0,
                            marginLeft: '10px',
                          }}>
                          Delete
                        </button>
                      </div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '6px',
                      }}>
                        {(['a', 'b', 'c', 'd'] as const).map(opt => (
                          <div key={opt} style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            background: quiz.correct_answer === opt ? '#E1F5EE' : '#ffffff',
                            border: `0.5px solid ${quiz.correct_answer === opt ? '#9FE1CB' : '#D3D1C7'}`,
                            color: quiz.correct_answer === opt ? '#085041' : '#444441',
                          }}>
                            {opt.toUpperCase()}. {quiz[`option_${opt}` as keyof Quiz]}
                            {quiz.correct_answer === opt && ' ✓'}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {generatingQuestions && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '16px',
                      background: '#EEEDFE',
                      borderRadius: '10px',
                      marginBottom: '12px',
                    }}>
                      <div style={{
                        display: 'flex',
                        gap: '4px',
                      }}>
                        {[0, 1, 2].map(i => (
                          <div key={i} style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#7F77DD',
                            animation: 'pulse 1s infinite',
                            animationDelay: `${i * 0.2}s`,
                          }} />
                        ))}
                      </div>
                      <span style={{ fontSize: '13px', color: '#534AB7' }}>
                        Claude is reading the lesson and generating questions...
                      </span>
                    </div>
                  )}

                  {generatedQuestions.length > 0 && (
                    <>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px',
                        padding: '12px 14px',
                        background: '#EEEDFE',
                        borderRadius: '10px',
                      }}>
                        <span style={{
                          fontSize: '13px',
                          fontWeight: '500',
                          color: '#26215C',
                        }}>
                          {generatedQuestions.filter(q => q.accepted).length} of {generatedQuestions.length} questions accepted
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={handleAcceptAll}
                            style={{
                              padding: '6px 12px',
                              background: '#E1F5EE',
                              border: '0.5px solid #9FE1CB',
                              borderRadius: '6px',
                              fontSize: '12px',
                              color: '#085041',
                              cursor: 'pointer',
                            }}>
                            Accept all
                          </button>
                          <button
                            onClick={handleGenerateQuestions}
                            style={{
                              padding: '6px 12px',
                              background: 'transparent',
                              border: '0.5px solid #D3D1C7',
                              borderRadius: '6px',
                              fontSize: '12px',
                              color: '#888780',
                              cursor: 'pointer',
                            }}>
                            Regenerate all
                          </button>
                        </div>
                      </div>

                      {generatedQuestions.map((q, index) => (
                        !q.discarded && (
                          <div key={index} style={{
                            background: q.accepted ? '#E1F5EE' : '#f5f4f0',
                            border: `0.5px solid ${q.accepted ? '#9FE1CB' : '#e5e3db'}`,
                            borderRadius: '10px',
                            padding: '14px',
                            marginBottom: '10px',
                          }}>
                            {editingQuestion === index ? (
                              <div>
                                <textarea
                                  value={q.question}
                                  onChange={(e) => {
                                    const updated = [...generatedQuestions]
                                    updated[index].question = e.target.value
                                    setGeneratedQuestions(updated)
                                  }}
                                  rows={2}
                                  style={{
                                    width: '100%',
                                    padding: '8px',
                                    border: '0.5px solid #D3D1C7',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    outline: 'none',
                                    marginBottom: '8px',
                                    boxSizing: 'border-box',
                                    fontFamily: 'inherit',
                                  }}
                                />
                                {(['a', 'b', 'c', 'd'] as const).map(opt => (
                                  <div key={opt} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '6px',
                                  }}>
                                    <input
                                      type="radio"
                                      name={`correct-${index}`}
                                      checked={q.correct_answer === opt}
                                      onChange={() => {
                                        const updated = [...generatedQuestions]
                                        updated[index].correct_answer = opt
                                        setGeneratedQuestions(updated)
                                      }}
                                    />
                                    <input
                                      type="text"
                                      value={q[`option_${opt}` as keyof GeneratedQuestion] as string}
                                      onChange={(e) => {
                                        const updated = [...generatedQuestions]
                                        ;(updated[index] as any)[`option_${opt}`] = e.target.value
                                        setGeneratedQuestions(updated)
                                      }}
                                      style={{
                                        flex: 1,
                                        padding: '6px 10px',
                                        border: '0.5px solid #D3D1C7',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        outline: 'none',
                                      }}
                                    />
                                    <span style={{
                                      fontSize: '11px',
                                      color: '#888780',
                                    }}>
                                      {opt.toUpperCase()}
                                    </span>
                                  </div>
                                ))}
                                <button
                                  onClick={() => setEditingQuestion(null)}
                                  style={{
                                    padding: '6px 12px',
                                    background: '#7F77DD',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                  }}>
                                  Done editing
                                </button>
                              </div>
                            ) : (
                              <>
                                <p style={{
                                  fontSize: '13px',
                                  fontWeight: '500',
                                  color: '#2C2C2A',
                                  marginBottom: '10px',
                                }}>
                                  {index + 1}. {q.question}
                                </p>
                                <div style={{
                                  display: 'grid',
                                  gridTemplateColumns: '1fr 1fr',
                                  gap: '6px',
                                  marginBottom: '10px',
                                }}>
                                  {(['a', 'b', 'c', 'd'] as const).map(opt => (
                                    <div key={opt} style={{
                                      padding: '6px 10px',
                                      borderRadius: '6px',
                                      fontSize: '12px',
                                      background: q.correct_answer === opt ? '#E1F5EE' : '#ffffff',
                                      border: `0.5px solid ${q.correct_answer === opt ? '#9FE1CB' : '#D3D1C7'}`,
                                      color: q.correct_answer === opt ? '#085041' : '#444441',
                                    }}>
                                      {opt.toUpperCase()}. {q[`option_${opt}` as keyof GeneratedQuestion] as string}
                                      {q.correct_answer === opt && ' ✓'}
                                    </div>
                                  ))}
                                </div>
                                {q.explanation && (
                                  <p style={{
                                    fontSize: '11px',
                                    color: '#534AB7',
                                    background: '#EEEDFE',
                                    padding: '6px 10px',
                                    borderRadius: '6px',
                                    marginBottom: '10px',
                                  }}>
                                    💡 {q.explanation}
                                  </p>
                                )}
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  {!q.accepted && (
                                    <button
                                      onClick={() => handleAcceptQuestion(index)}
                                      style={{
                                        padding: '5px 10px',
                                        background: '#E1F5EE',
                                        border: '0.5px solid #9FE1CB',
                                        borderRadius: '6px',
                                        fontSize: '11px',
                                        color: '#085041',
                                        cursor: 'pointer',
                                      }}>
                                      Accept ✓
                                    </button>
                                  )}
                                  {q.accepted && (
                                    <span style={{
                                      padding: '5px 10px',
                                      background: '#E1F5EE',
                                      borderRadius: '6px',
                                      fontSize: '11px',
                                      color: '#085041',
                                    }}>
                                      Accepted ✓
                                    </span>
                                  )}
                                  <button
                                    onClick={() => setEditingQuestion(index)}
                                    style={{
                                      padding: '5px 10px',
                                      background: 'transparent',
                                      border: '0.5px solid #D3D1C7',
                                      borderRadius: '6px',
                                      fontSize: '11px',
                                      color: '#444441',
                                      cursor: 'pointer',
                                    }}>
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDiscardQuestion(index)}
                                    style={{
                                      padding: '5px 10px',
                                      background: 'transparent',
                                      border: '0.5px solid #F09595',
                                      borderRadius: '6px',
                                      fontSize: '11px',
                                      color: '#A32D2D',
                                      cursor: 'pointer',
                                    }}>
                                    Discard
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )
                      ))}

                      <button
                        onClick={handleSaveQuestions}
                        disabled={savingQuestions || generatedQuestions.filter(q => q.accepted).length === 0}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: savingQuestions || generatedQuestions.filter(q => q.accepted).length === 0
                            ? '#AFA9EC' : '#7F77DD',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          cursor: savingQuestions ? 'not-allowed' : 'pointer',
                          marginTop: '8px',
                        }}>
                        {savingQuestions
                          ? 'Saving...'
                          : `Save ${generatedQuestions.filter(q => q.accepted).length} accepted questions`}
                      </button>
                    </>
                  )}

                </div>
              </>
            ) : (
              <div style={{
                background: '#ffffff',
                border: '0.5px solid #e5e3db',
                borderRadius: '12px',
                padding: '48px',
                textAlign: 'center',
              }}>
                <p style={{ fontSize: '14px', color: '#888780' }}>
                  Select a lesson from the left to manage its content
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}