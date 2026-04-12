'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface AssignedSubject {
  id: string
  deadline: string
  completed: boolean
  subjects: {
    id: string
    name: string
    category: string
  }
}

interface Badge {
  id: string
  badge_name: string
  earned_at: string
}

interface ChildInfo {
  id: string
  name: string
  grade: string
}

export default function ChildDashboard() {
  const router = useRouter()
  const [childInfo, setChildInfo] = useState<ChildInfo | null>(null)
  const [assigned, setAssigned] = useState<AssignedSubject[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedId = localStorage.getItem('childId')
    const storedName = localStorage.getItem('childName')
    const storedGrade = localStorage.getItem('childGrade')

    if (!storedId) {
      router.push('/child-login')
      return
    }

    const info = {
      id: storedId,
      name: storedName || '',
      grade: storedGrade || '',
    }

    setChildInfo(info)

    const fetchData = async () => {
      const { data: assignedData } = await supabase
        .from('assigned_subjects')
        .select(`
          id,
          deadline,
          completed,
          subjects (
            id,
            name,
            category
          )
        `)
        .eq('child_id', storedId)
        .order('deadline', { ascending: true })

      if (assignedData) setAssigned(assignedData as any)

      const { data: badgeData } = await supabase
        .from('badges')
        .select('*')
        .eq('child_id', storedId)
        .order('earned_at', { ascending: false })

      if (badgeData) setBadges(badgeData)
      setLoading(false)
    }

    fetchData()
  }, [])

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
    if (days < 0) return 'Overdue'
    if (days === 0) return 'Due today'
    if (days === 1) return '1 day left'
    return `${days} days left`
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

  const games = [
    { icon: '🧩', name: 'Maths puzzles', bg: '#EAF3DE', color: '#27500A' },
    { icon: '🔤', name: 'Word scramble', bg: '#E6F1FB', color: '#0C447C' },
    { icon: '🧠', name: 'Memory match', bg: '#FAEEDA', color: '#633806' },
    { icon: '⚡', name: 'Quick fire quiz', bg: '#FBEAF0', color: '#72243E' },
  ]

  const handleLogout = () => {
    localStorage.removeItem('childId')
    localStorage.removeItem('childName')
    localStorage.removeItem('childGrade')
    router.push('/child-login')
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

  const completed = assigned.filter(a => a.completed).length
  const total = assigned.length

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
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: '#534AB7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontSize: '16px' }}>★</span>
          </div>
          <span style={{
            fontSize: '16px',
            fontWeight: '500',
            color: '#ffffff',
          }}>
            BrightMinds
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '13px', color: '#CECBF6' }}>
            Grade {childInfo?.grade}
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: '7px 16px',
              background: 'transparent',
              border: '0.5px solid #AFA9EC',
              borderRadius: '8px',
              color: '#CECBF6',
              fontSize: '13px',
              cursor: 'pointer',
            }}>
            Log out
          </button>
        </div>
      </nav>

      <div style={{ padding: '32px 40px' }}>

        <div style={{
          background: '#EEEDFE',
          borderRadius: '16px',
          padding: '28px 32px',
          marginBottom: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <h1 style={{
              fontSize: '26px',
              fontWeight: '500',
              color: '#26215C',
              marginBottom: '6px',
            }}>
              Hello, {childInfo?.name.split(' ')[0]}! 👋
            </h1>
            <p style={{ fontSize: '14px', color: '#534AB7' }}>
              {total === 0
                ? 'No subjects assigned yet — check back soon!'
                : completed === total
                ? 'Amazing! You completed all your subjects! 🎉'
                : `You have ${total - completed} subject${total - completed !== 1 ? 's' : ''} to complete`}
            </p>
          </div>
          {total > 0 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '36px',
                fontWeight: '500',
                color: '#26215C',
              }}>
                {Math.round((completed / total) * 100)}%
              </div>
              <div style={{ fontSize: '12px', color: '#534AB7' }}>
                completed
              </div>
            </div>
          )}
        </div>

        {badges.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{
              fontSize: '16px',
              fontWeight: '500',
              color: '#2C2C2A',
              marginBottom: '12px',
            }}>
              Your badges 🏆
            </h2>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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
          My subjects
        </h2>

        {assigned.length === 0 ? (
          <div style={{
            background: '#ffffff',
            border: '0.5px solid #e5e3db',
            borderRadius: '12px',
            padding: '48px 40px',
            textAlign: 'center',
            marginBottom: '28px',
          }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📚</div>
            <p style={{
              fontSize: '15px',
              fontWeight: '500',
              color: '#2C2C2A',
              marginBottom: '6px',
            }}>
              No subjects yet
            </p>
            <p style={{ fontSize: '13px', color: '#888780' }}>
              Your parent will assign subjects soon
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '12px',
            marginBottom: '28px',
          }}>
            {assigned.map((item) => (
              <div
                key={item.id}
                onClick={() => router.push(`/child/subject/${item.subjects.id}`)}
                style={{
                  background: '#ffffff',
                  border: '0.5px solid #e5e3db',
                  borderRadius: '12px',
                  padding: '18px',
                  cursor: 'pointer',
                  opacity: item.completed ? 0.7 : 1,
                }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '14px',
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: getCategoryBg(item.subjects.category),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                  }}>
                    {getCategoryIcon(item.subjects.category)}
                  </div>
                  <div>
                    <p style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#2C2C2A',
                      marginBottom: '2px',
                    }}>
                      {item.subjects.name}
                    </p>
                    <p style={{ fontSize: '12px', color: '#888780' }}>
                      {item.subjects.category}
                    </p>
                  </div>
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
                      ? 'Completed ✓'
                      : getDeadlineText(item.deadline)}
                  </span>
                  {!item.completed && (
                    <span style={{ fontSize: '12px', color: '#7F77DD' }}>
                      Start →
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <h2 style={{
          fontSize: '16px',
          fontWeight: '500',
          color: '#2C2C2A',
          marginBottom: '16px',
        }}>
          Brain break games 🎮
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: '12px',
        }}>
          {games.map((game) => (
            <div
              key={game.name}
              style={{
                background: game.bg,
                borderRadius: '12px',
                padding: '18px',
                cursor: 'pointer',
                textAlign: 'center',
              }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                {game.icon}
              </div>
              <p style={{
                fontSize: '13px',
                fontWeight: '500',
                color: game.color,
              }}>
                {game.name}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}