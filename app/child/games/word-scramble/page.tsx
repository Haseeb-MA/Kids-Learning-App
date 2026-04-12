'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const WORD_SETS: Record<string, string[]> = {
  '1': ['CAT', 'DOG', 'SUN', 'HAT', 'RUN', 'BIG', 'RED', 'FUN'],
  '2': ['FROG', 'CAKE', 'JUMP', 'RAIN', 'BIRD', 'FISH', 'PLAY', 'BLUE'],
  '3': ['BRAVE', 'CLOUD', 'PLANT', 'SMILE', 'TRAIN', 'GRASS', 'LIGHT', 'STONE'],
  '4': ['PLANET', 'BRIDGE', 'CASTLE', 'FOREST', 'WINTER', 'FLOWER', 'GARDEN', 'SCHOOL'],
  '5': ['SCIENCE', 'CAPITAL', 'DOLPHIN', 'ECLIPSE', 'FREEDOM', 'GRAVITY', 'HISTORY', 'JOURNEY'],
  '6': ['ASTRONAUT', 'DEMOCRACY', 'ECOSYSTEM', 'GEOMETRIC', 'HURRICANE', 'INVENTION', 'KNOWLEDGE'],
  '7': ['ATMOSPHERE', 'CHROMOSOME', 'HYPOTHESIS', 'METABOLISM', 'PHILOSOPHY', 'REVOLUTION'],
  '8': ['ACCELERATION', 'BIODIVERSITY', 'CIVILIZATION', 'DECOMPOSITION', 'ELECTROMAGNETIC'],
  '9': ['PHOTOSYNTHESIS', 'THERMODYNAMICS', 'DIFFERENTIATION', 'ELECTROMAGNETIC'],
  '10': ['PHOTOSYNTHESIS', 'THERMODYNAMICS', 'DIFFERENTIATION', 'ELECTROMAGNETIC'],
}

const scrambleWord = (word: string): string => {
  const arr = word.split('')
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.join('') === word ? scrambleWord(word) : arr.join('')
}

export default function WordScramble() {
  const router = useRouter()
  const [words, setWords] = useState<string[]>([])
  const [current, setCurrent] = useState(0)
  const [scrambled, setScrambled] = useState('')
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [timerActive, setTimerActive] = useState(false)
  const [childGrade, setChildGrade] = useState('1')

  useEffect(() => {
    document.title = 'Word-Scramble · BrightMinds'
    const grade = localStorage.getItem('childGrade') || '1'
    setChildGrade(grade)
    initGame(grade)
  }, [])

  useEffect(() => {
    if (!timerActive) return
    if (timeLeft === 0) {
      handleNext()
      return
    }
    const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000)
    return () => clearTimeout(timer)
  }, [timeLeft, timerActive])

  const initGame = (grade: string) => {
    const gradeKey = Object.keys(WORD_SETS).includes(grade) ? grade : '1'
    const wordList = [...WORD_SETS[gradeKey]]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)
    setWords(wordList)
    setCurrent(0)
    setScrambled(scrambleWord(wordList[0]))
    setInput('')
    setFeedback(null)
    setScore(0)
    setGameOver(false)
    setTimeLeft(30)
    setTimerActive(true)
  }

  const handleCheck = () => {
    if (input.toUpperCase() === words[current]) {
      setFeedback('correct')
      setScore(prev => prev + 1)
      setTimerActive(false)
    } else {
      setFeedback('wrong')
    }
  }

  const handleNext = () => {
    if (current < words.length - 1) {
      const next = current + 1
      setCurrent(next)
      setScrambled(scrambleWord(words[next]))
      setInput('')
      setFeedback(null)
      setTimeLeft(30)
      setTimerActive(true)
    } else {
      setTimerActive(false)
      setGameOver(true)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !feedback) handleCheck()
    if (e.key === 'Enter' && feedback === 'correct') handleNext()
  }

  const getTimerColor = () => {
    if (timeLeft > 15) return '#085041'
    if (timeLeft > 7) return '#854F0B'
    return '#A32D2D'
  }

  const getTimerBg = () => {
    if (timeLeft > 15) return '#E1F5EE'
    if (timeLeft > 7) return '#FAEEDA'
    return '#FCEBEB'
  }

  if (words.length === 0) return null

  return (
    <div style={{ minHeight: '100vh', background: '#f5f4f0' }}>
      <nav style={{
        background: '#E6F1FB',
        padding: '14px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '0.5px solid #B5D4F4',
      }}>
        <button
          onClick={() => router.push('/child/dashboard')}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#0C447C',
            fontSize: '14px',
          }}>
          ← Back
        </button>
        <span style={{
          fontSize: '16px',
          fontWeight: '500',
          color: '#0C447C',
        }}>
          🔤 Word scramble
        </span>
        <div style={{ fontSize: '13px', color: '#185FA5' }}>
          {current + 1}/{words.length}
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
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
            }}>
              <div style={{
                background: getTimerBg(),
                borderRadius: '10px',
                padding: '10px 20px',
                textAlign: 'center',
              }}>
                <p style={{
                  fontSize: '11px',
                  color: getTimerColor(),
                  marginBottom: '2px',
                }}>
                  Time left
                </p>
                <p style={{
                  fontSize: '24px',
                  fontWeight: '500',
                  color: getTimerColor(),
                }}>
                  {timeLeft}s
                </p>
              </div>
              <div style={{
                background: '#E6F1FB',
                borderRadius: '10px',
                padding: '10px 20px',
                textAlign: 'center',
              }}>
                <p style={{
                  fontSize: '11px',
                  color: '#185FA5',
                  marginBottom: '2px',
                }}>
                  Score
                </p>
                <p style={{
                  fontSize: '24px',
                  fontWeight: '500',
                  color: '#0C447C',
                }}>
                  {score}
                </p>
              </div>
            </div>

            <div style={{
              background: '#E6F1FB',
              borderRadius: '16px',
              padding: '40px',
              textAlign: 'center',
              marginBottom: '24px',
            }}>
              <p style={{
                fontSize: '13px',
                color: '#185FA5',
                marginBottom: '12px',
              }}>
                Unscramble this word:
              </p>
              <h2 style={{
                fontSize: '36px',
                fontWeight: '500',
                color: '#042C53',
                letterSpacing: '8px',
              }}>
                {scrambled}
              </h2>
            </div>

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
                ✓ Correct! The word was {words[current]} 🎉
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
                ✗ Not quite — try again!
              </div>
            )}

            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value.toUpperCase())
                setFeedback(null)
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type the word..."
              disabled={feedback === 'correct'}
              autoFocus
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
                letterSpacing: '4px',
                textTransform: 'uppercase',
              }}
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              {feedback !== 'correct' ? (
                <button
                  onClick={handleCheck}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: '#378ADD',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '15px',
                    cursor: 'pointer',
                  }}>
                  Check
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: '#378ADD',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '15px',
                    cursor: 'pointer',
                  }}>
                  {current < words.length - 1 ? 'Next word →' : 'See results →'}
                </button>
              )}
              <button
                onClick={handleNext}
                style={{
                  padding: '14px 20px',
                  background: 'transparent',
                  color: '#378ADD',
                  border: '0.5px solid #378ADD',
                  borderRadius: '10px',
                  fontSize: '15px',
                  cursor: 'pointer',
                }}>
                Skip
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>
              {score >= 4 ? '🏆' : '💪'}
            </div>
            <h1 style={{
              fontSize: '26px',
              fontWeight: '500',
              color: '#26215C',
              marginBottom: '8px',
            }}>
              Game over!
            </h1>
            <div style={{
              background: '#E6F1FB',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
            }}>
              <p style={{
                fontSize: '40px',
                fontWeight: '500',
                color: '#042C53',
                marginBottom: '4px',
              }}>
                {score}/{words.length}
              </p>
              <p style={{ fontSize: '14px', color: '#185FA5' }}>
                {score === words.length
                  ? 'Perfect! You are a word master!'
                  : score >= 3
                  ? 'Great job! Keep practising!'
                  : 'Good try! Have another go!'}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => initGame(childGrade)}
                style={{
                  padding: '14px',
                  background: '#378ADD',
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
                  color: '#378ADD',
                  border: '0.5px solid #378ADD',
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