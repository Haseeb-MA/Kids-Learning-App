'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Lesson {
  id: string
  title: string
  content: string
  subject_id: string
}

interface Quiz {
  id: string
  question: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
}

type Stage = 'lesson' | 'quiz' | 'result'

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [stage, setStage] = useState<Stage>('lesson')
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [childId, setChildId] = useState('')
  const [childName, setChildName] = useState('')

  useEffect(() => {
    const storedId = localStorage.getItem('childId')
    const storedName = localStorage.getItem('childName')
    if (!storedId) {
      router.push('/child-login')
      return
    }
    setChildId(storedId)
    setChildName(storedName || '')
    loadData()
  }, [])

  const loadData = async () => {
    const { data: lessonData } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', id)
      .single()

    if (lessonData) setLesson(lessonData)

    const { data: quizData } = await supabase
      .from('quizzes')
      .select('*')
      .eq('lesson_id', id)

    if (quizData) setQuizzes(quizData)
    setLoading(false)
  }

  const handleAnswer = async (option: string) => {
    if (answered) return
    setSelected(option)
    setAnswered(true)

    const correct = option === quizzes[currentQ].correct_answer
    if (correct) setScore(prev => prev + 1)

    await supabase
      .from('progress')
      .insert({
        child_id: childId,
        quiz_id: quizzes[currentQ].id,
        score: correct ? 1 : 0,
      })
  }

  const handleNext = () => {
    if (currentQ < quizzes.length - 1) {
      setCurrentQ(prev => prev + 1)
      setSelected(null)
      setAnswered(false)
    } else {
      checkAndAwardBadge()
      setStage('result')
    }
  }

  const checkAndAwardBadge = async () => {
    const percentage = Math.round((score / quizzes.length) * 100)
    if (percentage >= 80) {
      await supabase
        .from('badges')
        .insert({
          child_id: childId,
          badge_name: `${lesson?.title} Star ⭐`,
        })
    }
  }

  const getOptionStyle = (option: string) => {
    if (!answered) {
      return {
        background: '#ffffff',
        border: '0.5px solid #D3D1C7',
        color: '#2C2C2A',
      }
    }
    if (option === quizzes[currentQ].correct_answer) {
      return {
        background: '#E1F5EE',
        border: '0.5px solid #9FE1CB',
        color: '#085041',
      }
    }
    if (option === selected && option !== quizzes[currentQ].correct_answer) {
      return {
        background: '#FCEBEB',
        border: '0.5px solid #F09595',
        color: '#A32D2D',
      }
    }
    return {
      background: '#ffffff',
      border: '0.5px solid #D3D1C7',
      color: '#888780',
    }
  }

  const getScoreMessage = () => {
    const percentage = Math.round((score / quizzes.length) * 100)
    if (percentage === 100) return 'Perfect score! Amazing work! 🎉'
    if (percentage >= 80) return 'Great job! You earned a badge! ⭐'
    if (percentage >= 60) return 'Good effort! Keep practising! 💪'
    return 'Keep trying! You will get there! 🌟'
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
        <button
          onClick={() => router.back()}
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
        <span style={{
          fontSize: '14px',
          color: '#CECBF6',
        }}>
          {stage === 'lesson' ? 'Read carefully' :
           stage === 'quiz' ? `Question ${currentQ + 1} of ${quizzes.length}` :
           'Results'}
        </span>
      </nav>

      <div style={{
        maxWidth: '680px',
        margin: '0 auto',
        padding: '32px 40px',
      }}>

        {stage === 'lesson' && (
          <>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '500',
              color: '#26215C',
              marginBottom: '20px',
            }}>
              {lesson?.title}
            </h1>

            <div style={{
              background: '#ffffff',
              border: '0.5px solid #e5e3db',
              borderRadius: '12px',
              padding: '28px',
              marginBottom: '24px',
              fontSize: '15px',
              lineHeight: '1.8',
              color: '#2C2C2A',
            }}>
              {lesson?.content}
            </div>

            {quizzes.length > 0 ? (
              <button
                onClick={() => setStage('quiz')}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: '#7F77DD',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  cursor: 'pointer',
                }}>
                I am ready — start the quiz →
              </button>
            ) : (
              <button
                onClick={() => router.back()}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: '#7F77DD',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  cursor: 'pointer',
                }}>
                Back to lessons
              </button>
            )}
          </>
        )}

        {stage === 'quiz' && quizzes.length > 0 && (
          <>
            <div style={{
              background: '#e5e3db',
              borderRadius: '20px',
              height: '6px',
              marginBottom: '28px',
              overflow: 'hidden',
            }}>
              <div style={{
                background: '#7F77DD',
                height: '100%',
                width: `${((currentQ + 1) / quizzes.length) * 100}%`,
                borderRadius: '20px',
                transition: 'width 0.3s ease',
              }} />
            </div>

            <h2 style={{
              fontSize: '20px',
              fontWeight: '500',
              color: '#26215C',
              marginBottom: '24px',
              lineHeight: '1.4',
            }}>
              {quizzes[currentQ].question}
            </h2>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              marginBottom: '24px',
            }}>
              {(['a', 'b', 'c', 'd'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  style={{
                    padding: '14px 18px',
                    borderRadius: '10px',
                    fontSize: '15px',
                    cursor: answered ? 'default' : 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.15s',
                    ...getOptionStyle(opt),
                  }}>
                  <span style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: '500',
                    flexShrink: 0,
                  }}>
                    {opt.toUpperCase()}
                  </span>
                  {quizzes[currentQ][`option_${opt}` as keyof Quiz]}
                </button>
              ))}
            </div>

            {answered && (
              <div style={{
                background: selected === quizzes[currentQ].correct_answer
                  ? '#E1F5EE' : '#FCEBEB',
                border: `0.5px solid ${selected === quizzes[currentQ].correct_answer
                  ? '#9FE1CB' : '#F09595'}`,
                borderRadius: '10px',
                padding: '14px 18px',
                marginBottom: '16px',
                fontSize: '14px',
                color: selected === quizzes[currentQ].correct_answer
                  ? '#085041' : '#A32D2D',
              }}>
                {selected === quizzes[currentQ].correct_answer
                  ? '✓ Correct! Well done!'
                  : `✗ Not quite. The correct answer is ${quizzes[currentQ][`option_${quizzes[currentQ].correct_answer}` as keyof Quiz]}`}
              </div>
            )}

            {answered && (
              <button
                onClick={handleNext}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: '#7F77DD',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  cursor: 'pointer',
                }}>
                {currentQ < quizzes.length - 1 ? 'Next question →' : 'See my results →'}
              </button>
            )}
          </>
        )}

        {stage === 'result' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '64px',
              marginBottom: '16px',
            }}>
              {Math.round((score / quizzes.length) * 100) >= 80 ? '🏆' : '💪'}
            </div>
            <h1 style={{
              fontSize: '26px',
              fontWeight: '500',
              color: '#26215C',
              marginBottom: '8px',
            }}>
              Quiz complete!
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#534AB7',
              marginBottom: '28px',
            }}>
              {getScoreMessage()}
            </p>

            <div style={{
              background: '#EEEDFE',
              borderRadius: '16px',
              padding: '28px',
              marginBottom: '28px',
              display: 'inline-block',
              minWidth: '200px',
            }}>
              <div style={{
                fontSize: '48px',
                fontWeight: '500',
                color: '#26215C',
                marginBottom: '4px',
              }}>
                {score}/{quizzes.length}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#534AB7',
              }}>
                {Math.round((score / quizzes.length) * 100)}% correct
              </div>
            </div>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}>
              <button
                onClick={() => {
                  setStage('lesson')
                  setCurrentQ(0)
                  setSelected(null)
                  setAnswered(false)
                  setScore(0)
                }}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: '#7F77DD',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  cursor: 'pointer',
                }}>
                Try again
              </button>
              <button
                onClick={() => router.back()}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'transparent',
                  color: '#7F77DD',
                  border: '0.5px solid #7F77DD',
                  borderRadius: '10px',
                  fontSize: '15px',
                  cursor: 'pointer',
                }}>
                Back to lessons
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}