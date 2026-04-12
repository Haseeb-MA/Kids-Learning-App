'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Card {
  id: number
  content: string
  isFlipped: boolean
  isMatched: boolean
}

const CARD_SETS: Record<string, string[]> = {
  '1': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊'],
  '2': ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒'],
  '3': ['➕', '➖', '✖️', '➗', '🟰', '💯'],
  '4': ['🌍', '🌙', '⭐', '☀️', '🌈', '❄️'],
  '5': ['⚡', '🔥', '💧', '🌱', '🪨', '💨'],
  '6': ['🔬', '🧪', '🧲', '💡', '🔭', '⚗️'],
  '7': ['📐', '📏', '🔢', '📊', '📈', '🧮'],
  '8': ['🧬', '🦠', '🧫', '🧪', '⚗️', '🔬'],
  '9': ['🌋', '🏔️', '🌊', '🌪️', '⚡', '🌡️'],
  '10': ['🚀', '🛸', '🌌', '🪐', '☄️', '🌠'],
}

export default function MemoryMatch() {
  const router = useRouter()
  const [cards, setCards] = useState<Card[]>([])
  const [flipped, setFlipped] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [matched, setMatched] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [childGrade, setChildGrade] = useState('1')
  const [disabled, setDisabled] = useState(false)
  const [startTime, setStartTime] = useState<number>(0)
  const [timeTaken, setTimeTaken] = useState(0)

  useEffect(() => {
    const grade = localStorage.getItem('childGrade') || '1'
    setChildGrade(grade)
    initGame(grade)
  }, [])

  const initGame = (grade: string) => {
    const gradeKey = Object.keys(CARD_SETS).includes(grade) ? grade : '1'
    const emojis = CARD_SETS[gradeKey]
    const doubled = [...emojis, ...emojis]
    const shuffled = doubled
      .sort(() => Math.random() - 0.5)
      .map((content, index) => ({
        id: index,
        content,
        isFlipped: false,
        isMatched: false,
      }))
    setCards(shuffled)
    setFlipped([])
    setMoves(0)
    setMatched(0)
    setGameOver(false)
    setStartTime(Date.now())
  }

  const handleCardClick = (id: number) => {
    if (disabled) return
    if (flipped.includes(id)) return
    if (cards[id].isMatched) return

    const newFlipped = [...flipped, id]
    setFlipped(newFlipped)

    const newCards = cards.map(c =>
      c.id === id ? { ...c, isFlipped: true } : c
    )
    setCards(newCards)

    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1)
      setDisabled(true)

      const [first, second] = newFlipped
      if (newCards[first].content === newCards[second].content) {
        const matchedCards = newCards.map(c =>
          c.id === first || c.id === second
            ? { ...c, isMatched: true }
            : c
        )
        setCards(matchedCards)
        setFlipped([])
        setDisabled(false)
        const newMatched = matched + 1
        setMatched(newMatched)
        if (newMatched === 6) {
          setTimeTaken(Math.round((Date.now() - startTime) / 1000))
          setGameOver(true)
        }
      } else {
        setTimeout(() => {
          setCards(newCards.map(c =>
            c.id === first || c.id === second
              ? { ...c, isFlipped: false }
              : c
          ))
          setFlipped([])
          setDisabled(false)
        }, 900)
      }
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f4f0' }}>
      <nav style={{
        background: '#FAEEDA',
        padding: '14px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '0.5px solid #FAC775',
      }}>
        <button
          onClick={() => router.push('/child/dashboard')}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#633806',
            fontSize: '14px',
          }}>
          ← Back
        </button>
        <span style={{
          fontSize: '16px',
          fontWeight: '500',
          color: '#633806',
        }}>
          🧠 Memory match
        </span>
        <div style={{
          fontSize: '13px',
          color: '#854F0B',
        }}>
          Moves: {moves}
        </div>
      </nav>

      <div style={{
        maxWidth: '480px',
        margin: '0 auto',
        padding: '32px 20px',
      }}>

        {!gameOver ? (
          <>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}>
              <div style={{
                background: '#FAEEDA',
                borderRadius: '10px',
                padding: '10px 16px',
                textAlign: 'center',
              }}>
                <p style={{
                  fontSize: '11px',
                  color: '#854F0B',
                  marginBottom: '2px',
                }}>
                  Matched
                </p>
                <p style={{
                  fontSize: '20px',
                  fontWeight: '500',
                  color: '#633806',
                }}>
                  {matched}/6
                </p>
              </div>
              <div style={{
                background: '#FAEEDA',
                borderRadius: '10px',
                padding: '10px 16px',
                textAlign: 'center',
              }}>
                <p style={{
                  fontSize: '11px',
                  color: '#854F0B',
                  marginBottom: '2px',
                }}>
                  Moves
                </p>
                <p style={{
                  fontSize: '20px',
                  fontWeight: '500',
                  color: '#633806',
                }}>
                  {moves}
                </p>
              </div>
              <button
                onClick={() => initGame(childGrade)}
                style={{
                  background: '#EF9F27',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 16px',
                  fontSize: '13px',
                  color: '#fff',
                  cursor: 'pointer',
                }}>
                Restart
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px',
            }}>
              {cards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card.id)}
                  style={{
                    height: '80px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '32px',
                    cursor: card.isMatched ? 'default' : 'pointer',
                    background: card.isMatched
                      ? '#E1F5EE'
                      : card.isFlipped
                      ? '#ffffff'
                      : '#7F77DD',
                    border: card.isMatched
                      ? '0.5px solid #9FE1CB'
                      : card.isFlipped
                      ? '0.5px solid #e5e3db'
                      : '0.5px solid #534AB7',
                    transition: 'all 0.2s ease',
                  }}>
                  {card.isFlipped || card.isMatched ? card.content : '?'}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
            <h1 style={{
              fontSize: '26px',
              fontWeight: '500',
              color: '#26215C',
              marginBottom: '8px',
            }}>
              You did it!
            </h1>
            <p style={{
              fontSize: '15px',
              color: '#534AB7',
              marginBottom: '28px',
            }}>
              You matched all the cards!
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '28px',
            }}>
              <div style={{
                background: '#FAEEDA',
                borderRadius: '12px',
                padding: '16px',
              }}>
                <p style={{
                  fontSize: '12px',
                  color: '#854F0B',
                  marginBottom: '4px',
                }}>
                  Total moves
                </p>
                <p style={{
                  fontSize: '28px',
                  fontWeight: '500',
                  color: '#633806',
                }}>
                  {moves}
                </p>
              </div>
              <div style={{
                background: '#E1F5EE',
                borderRadius: '12px',
                padding: '16px',
              }}>
                <p style={{
                  fontSize: '12px',
                  color: '#085041',
                  marginBottom: '4px',
                }}>
                  Time taken
                </p>
                <p style={{
                  fontSize: '28px',
                  fontWeight: '500',
                  color: '#085041',
                }}>
                  {timeTaken}s
                </p>
              </div>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}>
              <button
                onClick={() => initGame(childGrade)}
                style={{
                  padding: '14px',
                  background: '#7F77DD',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  cursor: 'pointer',
                }}>
                Play again
              </button>
              <button
                onClick={() => router.push('/child/dashboard')}
                style={{
                  padding: '14px',
                  background: 'transparent',
                  color: '#7F77DD',
                  border: '0.5px solid #7F77DD',
                  borderRadius: '10px',
                  fontSize: '15px',
                  cursor: 'pointer',
                }}>
                Back to dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}