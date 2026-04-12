'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Child {
  id: string
  full_name: string
  grade: number
}

interface SubjectProgress {
  subject_name: string
  category: string
  total_quizzes: number
  completed_quizzes: number
  correct_answers: number
  deadline: string
  completed: boolean
}

interface Badge {
  id: string
  badge_name: string
  earned_at: string
}

interface RecentActivity {
  quiz_id: string
  score: number
  completed_at: string
  lesson_title: string
  subject_name: string
}

export default function ProgressReport({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [child, setChild] = useState<Child | null>(null)
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [totalScore, setTotalScore] = useState(0)
  const [totalQuizzes, setTotalQuizzes] = useState(0)

  useEffect(() => {
    checkParentAndLoad()
  }, [])

  const checkParentAndLoad = async () => {
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
    await loadProgress(childData)
    setLoading(false)
  }

  const loadProgress = async (childData: Child) => {
    const { data: assignedData } = await supabase
      .from('assigned_subjects')
      .select(`
        deadline,
        completed,
        subjects (
          id,
          name,
          category
        )
      `)
      .eq('child_id', id)

    const { data: progressData } = await supabase
      .from('progress')
      .select(`
        score,
        completed_at,
        quizzes (
          id,
          lesson_id,
          lessons (
            title,
            subject_id
          )
        )
      `)
      .eq('child_id', id)
      .order('completed_at', { ascending: false })

    const { data: badgeData } = await supabase
      .from('badges')
      .select('*')
      .eq('child_id', id)
      .order('earned_at', { ascending: false })

    if (badgeData) setBadges(badgeData)

    if (progressData) {
      const total = progressData.length
      const correct = progressData.filter((p: any) => p.score === 1).length
      setTotalQuizzes(total)
      setTotalScore(correct)

      const recent = progressData.slice(0, 5).map((p: any) => ({
        quiz_id: p.quizzes?.id,
        score: p.score,
        completed_at: p.completed_at,
        lesson_title: p.quizzes?.lessons?.title || 'Unknown lesson',
        subject_name: 'Quiz',
      }))
      setRecentActivity(recent)
    }

    if (assignedData && progressData) {
      const progress: SubjectProgress[] = (assignedData as any[]).map((a: any) => {
        const subjectQuizzes = (progressData as any[]).filter(
          p => p.quizzes?.lessons?.subject_id === a.subjects?.id
        )
        const correct = subjectQuizzes.filter(p => p.score === 1).length

        return {
          subject_name: a.subjects?.name || 'Unknown',
          category: a.subjects?.category || '',
          total_quizzes: subjectQuizzes.length,
          completed_quizzes: subjectQuizzes.length,
          correct_answers: correct,
          deadline: a.deadline,
          completed: a.completed,
        }
      })
      setSubjectProgress(progress)
    }
  }

  const getScoreColor = (correct: number, total: number) => {
    if (total === 0) return '#888780'
    const pct = (correct / total) * 100
    if (pct >= 80) return '#085041'
    if (pct >= 60) return '#854F0B'
    return '#A32D2D'
  }

  const getScoreBg = (correct: number, total: number) => {
    if (total === 0) return '#F1EFE8'
    const pct = (correct / total) * 100
    if (pct >= 80) return '#E1F5EE'
    if (pct >= 60) return '#FAEEDA'
    return '#FCEBEB'
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Mathematics': return '➕'
      case 'English': return '📖'
      case 'Science': return '🔬'
      default: return '📚'
    }
  }

  const getOverallPercentage = () => {
    if (totalQuizzes === 0) return 0
    return Math.round((totalScore / totalQuizzes) * 100)
  }

  const getOverallMessage = () => {
    const pct = getOverallPercentage()
    if (totalQuizzes === 0) return 'No quizzes completed yet'
    if (pct >= 80) return 'Excellent performance! 🌟'
    if (pct >= 60) return 'Good progress! Keep going! 💪'
    return 'Needs more practice — encourage them! 📚'
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
          alignItems: 'center',
          gap: '16px',
          marginBottom: '28px',
        }}>
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
              {child?.full_name}'s progress
            </h1>
            <p style={{ fontSize: '14px', color: '#888780' }}>
              Grade {child?.grade} · Progress report
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px',
          marginBottom: '28px',
        }}>
          <div style={{
            background: '#EEEDFE',
            borderRadius: '12px',
            padding: '20px',
          }}>
            <p style={{
              fontSize: '13px',
              color: '#534AB7',
              marginBottom: '8px',
              opacity: 0.8,
            }}>
              Overall score
            </p>
            <p style={{
              fontSize: '32px',
              fontWeight: '500',
              color: '#26215C',
            }}>
              {getOverallPercentage()}%
            </p>
          </div>
          <div style={{
            background: '#E1F5EE',
            borderRadius: '12px',
            padding: '20px',
          }}>
            <p style={{
              fontSize: '13px',
              color: '#085041',
              marginBottom: '8px',
              opacity: 0.8,
            }}>
              Quizzes done
            </p>
            <p style={{
              fontSize: '32px',
              fontWeight: '500',
              color: '#085041',
            }}>
              {totalQuizzes}
            </p>
          </div>
          <div style={{
            background: '#FAEEDA',
            borderRadius: '12px',
            padding: '20px',
          }}>
            <p style={{
              fontSize: '13px',
              color: '#854F0B',
              marginBottom: '8px',
              opacity: 0.8,
            }}>
              Badges earned
            </p>
            <p style={{
              fontSize: '32px',
              fontWeight: '500',
              color: '#633806',
            }}>
              {badges.length}
            </p>
          </div>
          <div style={{
            background: '#E6F1FB',
            borderRadius: '12px',
            padding: '20px',
          }}>
            <p style={{
              fontSize: '13px',
              color: '#185FA5',
              marginBottom: '8px',
              opacity: 0.8,
            }}>
              Subjects assigned
            </p>
            <p style={{
              fontSize: '32px',
              fontWeight: '500',
              color: '#0C447C',
            }}>
              {subjectProgress.length}
            </p>
          </div>
        </div>

        <div style={{
          background: totalQuizzes === 0 ? '#F1EFE8' : getScoreBg(totalScore, totalQuizzes),
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '28px',
          fontSize: '14px',
          color: totalQuizzes === 0 ? '#888780' : getScoreColor(totalScore, totalQuizzes),
        }}>
          {getOverallMessage()}
        </div>

        {badges.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{
              fontSize: '16px',
              fontWeight: '500',
              color: '#2C2C2A',
              marginBottom: '12px',
            }}>
              Badges earned 🏆
            </h2>
            <div style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
            }}>
              {badges.map((badge) => (
                <div key={badge.id} style={{
                  background: '#FAEEDA',
                  border: '0.5px solid #FAC775',
                  borderRadius: '20px',
                  padding: '6px 14px',
                  fontSize: '13px',
                  color: '#633806',
                }}>
                  {badge.badge_name}
                </div>
              ))}
            </div>
          </div>
        )}

        <h2 style={{
          fontSize: '16px',
          fontWeight: '500',
          color: '#2C2C2A',
          marginBottom: '16px',
        }}>
          Subject breakdown
        </h2>

        {subjectProgress.length === 0 ? (
          <div style={{
            background: '#ffffff',
            border: '0.5px solid #e5e3db',
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
            marginBottom: '28px',
          }}>
            <p style={{ fontSize: '14px', color: '#888780' }}>
              No subjects assigned yet
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginBottom: '28px',
          }}>
            {subjectProgress.map((subject, index) => (
              <div key={index} style={{
                background: '#ffffff',
                border: '0.5px solid #e5e3db',
                borderRadius: '12px',
                padding: '20px',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '14px',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: subject.category === 'Mathematics'
                        ? '#EAF3DE'
                        : subject.category === 'English'
                        ? '#E6F1FB'
                        : '#FAEEDA',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                    }}>
                      {getCategoryIcon(subject.category)}
                    </div>
                    <div>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#2C2C2A',
                        marginBottom: '2px',
                      }}>
                        {subject.subject_name}
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: '#888780',
                      }}>
                        {subject.category}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      background: subject.completed ? '#E1F5EE' : '#EEEDFE',
                      color: subject.completed ? '#085041' : '#534AB7',
                      padding: '3px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                    }}>
                      {subject.completed ? 'Completed ✓' : 'In progress'}
                    </span>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px',
                }}>
                  <span style={{ fontSize: '13px', color: '#888780' }}>
                    Score
                  </span>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: '500',
                    color: getScoreColor(
                      subject.correct_answers,
                      subject.total_quizzes
                    ),
                  }}>
                    {subject.total_quizzes === 0
                      ? 'Not started'
                      : `${subject.correct_answers}/${subject.total_quizzes} correct (${Math.round((subject.correct_answers / subject.total_quizzes) * 100)}%)`}
                  </span>
                </div>

                {subject.total_quizzes > 0 && (
                  <div style={{
                    background: '#e5e3db',
                    borderRadius: '20px',
                    height: '6px',
                    overflow: 'hidden',
                    marginBottom: '10px',
                  }}>
                    <div style={{
                      background: getScoreColor(
                        subject.correct_answers,
                        subject.total_quizzes
                      ),
                      height: '100%',
                      width: `${Math.round((subject.correct_answers / subject.total_quizzes) * 100)}%`,
                      borderRadius: '20px',
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: '#888780',
                }}>
                  <span>
                    Deadline: {new Date(subject.deadline).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span>
                    {subject.total_quizzes} quiz{subject.total_quizzes !== 1 ? 'zes' : ''} attempted
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {recentActivity.length > 0 && (
          <>
            <h2 style={{
              fontSize: '16px',
              fontWeight: '500',
              color: '#2C2C2A',
              marginBottom: '16px',
            }}>
              Recent activity
            </h2>
            <div style={{
              background: '#ffffff',
              border: '0.5px solid #e5e3db',
              borderRadius: '12px',
              overflow: 'hidden',
            }}>
              {recentActivity.map((activity, index) => (
                <div key={index} style={{
                  padding: '14px 20px',
                  borderTop: index === 0 ? 'none' : '0.5px solid #e5e3db',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <p style={{
                      fontSize: '14px',
                      color: '#2C2C2A',
                      marginBottom: '2px',
                    }}>
                      {activity.lesson_title}
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: '#888780',
                    }}>
                      {new Date(activity.completed_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span style={{
                    background: activity.score === 1 ? '#E1F5EE' : '#FCEBEB',
                    color: activity.score === 1 ? '#085041' : '#A32D2D',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                  }}>
                    {activity.score === 1 ? 'Correct ✓' : 'Incorrect ✗'}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}