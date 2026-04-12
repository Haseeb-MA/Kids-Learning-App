'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Puzzle {
  question: string
  answer: number
  hint: string
}

const generatePuzzles = (grade: number): Puzzle[] => {
  if (grade <= 2) {
    return [
      { question: '5 + 3 = ?', answer: 8, hint: 'Count on your fingers' },
      { question: '9 - 4 = ?', answer: 5, hint: 'Start at 9 and count back 4' },
      { question: '3 + 7 = ?', answer: 10, hint: 'What makes 10?' },
      { question: '8 - 5 = ?', answer: 3, hint: 'How many are left?' },
      { question: '4 + 6 = ?', answer: 10, hint: 'Count them together' },
    ]
  } else if (grade <= 4) {
    return [
      { question: '6 × 7 = ?', answer: 42, hint: 'Think of your 6 times table' },
      { question: '48 ÷ 6 = ?', answer: 8, hint: 'How many 6s make 48?' },
      { question: '9 × 8 = ?', answer: 72, hint: 'Try 10×8 then subtract 8' },
      { question: '63 ÷ 7 = ?', answer: 9, hint: 'Think of your 7 times table' },
      { question: '7 × 6 = ?', answer: 42, hint: 'Skip count in 7s' },
    ]
  } else if (grade <= 6) {
    return [
      { question: '15% of 80 = ?', answer: 12, hint: '10% first then add 5%' },
      { question: '24 × 15 = ?', answer: 360, hint: 'Break it into 24×10 + 24×5' },
      { question: '144 ÷ 12 = ?', answer: 12, hint: 'What times 12 makes 144?' },
      { question: '25% of 120 = ?', answer: 30, hint: 'Divide by 4' },
      { question: '17 × 8 = ?', answer: 136, hint: 'Try 20×8 then subtract 3×8' },
    ]
  } else {
    return [
      { question: 'x + 15 = 23, x = ?', answer: 8, hint: 'Subtract 15 from both sides' },
      { question: '3x = 27, x = ?', answer: 9, hint: 'Divide both sides by 3' },
      { question: '2x + 4 = 18, x = ?', answer: 7, hint: 'First subtract 4 from both sides' },
      { question: 'x² = 64, x = ?', answer: 8, hint: 'What number times itself equals 64?' },
      { question: '5x - 10 = 25, x = ?', answer: 7, hint: 'Add 10 to both sides first' },
    ]
  }
}

export default function MathsPuzzles() {
  const router = useRouter()
  const [puzzles, setPuzzles] = useState<Puzzle[]>([])
  const [current, setCurrent] = useState(0)
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [showHint, setShowHint] = useState(false)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [childGrade, setChildGrade] = useState(1)

  useEffect(() => {
 document.title = 'Maths puzzles · BrightMinds'
    const grade = parseInt(localStorage.getItem('childGrade') || '1')
    setChildGrade(grade)
    setPuzzles(generatePuzzles(grade))
  }, [])

  const handleCheck = () => {
    const userAnswer = parseInt(input.trim())
    if (isNaN(userAnswer)) return

    if (userAnswer === puzzles[current].answer) {
      setFeedback('correct')
      setScore(prev => prev + 1)
    } else {
      setFeedback('wrong')
    }
  }

  const handleNext = () => {
    if (current < puzzles.length - 1) {
      setCurrent(prev => prev + 1)
      setInput('')
      setFeedback(null)
      setShowHint(false)
    } else {
      setGameOver(true)
    }
  }

  const handleRestart = () => {
    setPuzzles(generatePuzzles(childGrade))
    setCurrent(0)
    setInput('')
    setFeedback(null)
    setShowHint(false)
    setScore(0)
    setGameOver(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !feedback) handleCheck()
  }

  if (puzzles.length === 0) return null

  return (
    <div style={{ minHeight: '100vh', background: '#f5f4f0' }}>
      <nav style={{
        background: '#EAF3DE',
        padding: '14px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '0.5px solid #C0DD97',
      }}>
        <button
          onClick={() => router.push('/child/dashboard')}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#27500A',
            fontSize: '14px',
          }}>
          ← Back
        </button>
        <span style={{
          fontSize: '16px',
          fontWeight: '500',
          color: '#27500A',
        }}>
          🧩 Maths puzzles
        </span>
        <div style={{ fontSize: '13px', color: '#3B6D11' }}>
          {current + 1}/{puzzles.length}
        </div>
      </nav>

      <div style={{
        maxWidth: '480px',
        margin: '0 auto',
        padding: '40px 20px',
      }}>
        {!gameOver ? (
          <>
            <div style={{
              background: '#EAF3DE',
              borderRadius: '16px',
              padding: '40px',
              textAlign: 'center',
              marginBottom: '24px',
            }}>
              <p style={{
                fontSize: '13px',
                color: '#3B6D11',
                marginBottom: '12px',
              }}>
                Puzzle {current + 1}
              </p>
              <h2 style={{
                fontSize: '36px',
                fontWeight: '500',
                color: '#173404',
              }}>
                {puzzles[current].question}
              </h2>
            </div>

            {showHint && (
              <div style={{
                background: '#FAEEDA',
                border: '0.5px solid #FAC775',
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: '16px',
                fontSize: '14px',
                color: '#633806',
              }}>
                💡 Hint: {puzzles[current].hint}
              </div>
            )}

            {feedback === 'correct' && (
              <div style={{
                background: '#E1F5EE',
                border: '0.5px solid #9FE1CB',
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: '16px',
                fontSize: '14px',
                color: '#085041',
              }}>
                ✓ Correct! Well done! 🎉
              </div>
            )}

            {feedback === 'wrong' && (
              <div style={{
                background: '#FCEBEB',
                border: '0.5px solid #F09595',
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: '16px',
                fontSize: '14px',
                color: '#A32D2D',
              }}>
                ✗ Not quite — try again or use a hint!
              </div>
            )}

            <input
              type="number"
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                setFeedback(null)
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer..."
              disabled={feedback === 'correct'}
              style={{
                width: '100%',
                padding: '14px',
                border: '0.5px solid #D3D1C7',
                borderRadius: '10px',
                fontSize: '18px',
                outline: 'none',
                textAlign: 'center',
                marginBottom: '12px',
                boxSizing: 'border-box',
              }}
            />

            <div style={{
              display: 'flex',
              gap: '10px',
              marginBottom: '12px',
            }}>
              {feedback !== 'correct' && (
                <button
                  onClick={handleCheck}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: '#639922',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '15px',
                    cursor: 'pointer',
                  }}>
                  Check answer
                </button>
              )}
              {feedback === 'correct' && (
                <button
                  onClick={handleNext}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: '#639922',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '15px',
                    cursor: 'pointer',
                  }}>
                  {current < puzzles.length - 1 ? 'Next puzzle →' : 'See results →'}
                </button>
              )}
              {!showHint && feedback !== 'correct' && (
                <button
                  onClick={() => setShowHint(true)}
                  style={{
                    padding: '14px 20px',
                    background: 'transparent',
                    color: '#639922',
                    border: '0.5px solid #639922',
                    borderRadius: '10px',
                    fontSize: '15px',
                    cursor: 'pointer',
                  }}>
                  💡 Hint
                </button>
              )}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>
              {score === puzzles.length ? '🏆' : '💪'}
            </div>
            <h1 style={{
              fontSize: '26px',
              fontWeight: '500',
              color: '#26215C',
              marginBottom: '8px',
            }}>
              Puzzles complete!
            </h1>
            <div style={{
              background: '#EAF3DE',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
            }}>
              <p style={{
                fontSize: '40px',
                fontWeight: '500',
                color: '#173404',
                marginBottom: '4px',
              }}>
                {score}/{puzzles.length}
              </p>
              <p style={{ fontSize: '14px', color: '#3B6D11' }}>
                {score === puzzles.length
                  ? 'Perfect score! Amazing!'
                  : score >= 3
                  ? 'Great effort! Keep practising!'
                  : 'Good try! Have another go!'}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleRestart}
                style={{
                  padding: '14px',
                  background: '#639922',
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
                  color: '#639922',
                  border: '0.5px solid #639922',
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