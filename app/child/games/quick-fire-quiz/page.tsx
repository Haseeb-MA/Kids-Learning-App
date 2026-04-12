'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Question {
  question: string
  options: string[]
  correct: number
}

const QUESTIONS: Record<string, Question[]> = {
  '1': [
    { question: 'What is 2 + 2?', options: ['3', '4', '5', '6'], correct: 1 },
    { question: 'What is 5 - 3?', options: ['1', '3', '2', '4'], correct: 2 },
    { question: 'How many legs does a cat have?', options: ['2', '6', '8', '4'], correct: 3 },
    { question: 'What colour is the sky?', options: ['Red', 'Blue', 'Green', 'Yellow'], correct: 1 },
    { question: 'What is 1 + 1?', options: ['3', '1', '2', '4'], correct: 2 },
    { question: 'How many days in a week?', options: ['5', '6', '8', '7'], correct: 3 },
  ],
  '2': [
    { question: 'What is 3 × 4?', options: ['10', '14', '12', '7'], correct: 2 },
    { question: 'What is 15 - 8?', options: ['6', '8', '9', '7'], correct: 3 },
    { question: 'How many months in a year?', options: ['10', '11', '12', '13'], correct: 2 },
    { question: 'What is 6 + 7?', options: ['11', '14', '12', '13'], correct: 3 },
    { question: 'How many sides does a triangle have?', options: ['4', '2', '3', '5'], correct: 2 },
    { question: 'What is 4 × 3?', options: ['14', '10', '12', '7'], correct: 2 },
  ],
  '3': [
    { question: 'What is 7 × 8?', options: ['54', '63', '56', '48'], correct: 2 },
    { question: 'What is half of 100?', options: ['25', '75', '40', '50'], correct: 3 },
    { question: 'What planet is closest to the Sun?', options: ['Venus', 'Earth', 'Mercury', 'Mars'], correct: 2 },
    { question: 'What is 9 × 6?', options: ['56', '54', '48', '63'], correct: 1 },
    { question: 'How many centimetres in a metre?', options: ['10', '1000', '100', '50'], correct: 2 },
    { question: 'What is 144 ÷ 12?', options: ['11', '13', '14', '12'], correct: 3 },
  ],
  '4': [
    { question: 'What is 15% of 200?', options: ['25', '20', '35', '30'], correct: 3 },
    { question: 'What is the largest planet?', options: ['Saturn', 'Neptune', 'Uranus', 'Jupiter'], correct: 3 },
    { question: 'What is 12²?', options: ['144', '124', '132', '148'], correct: 0 },
    { question: 'How many sides does a hexagon have?', options: ['5', '8', '7', '6'], correct: 3 },
    { question: 'What is 25% of 80?', options: ['15', '25', '20', '30'], correct: 2 },
    { question: 'What gas do plants absorb?', options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'], correct: 2 },
  ],
}

const getQuestionsForGrade = (grade: number): Question[] => {
  const key = grade <= 2 ? '1' : grade <= 3 ? '2' : grade <= 5 ? '3' : '4'
  return [...QUESTIONS[key]].sort(() => Math.random() - 0.5)
}

export default function QuickFireQuiz() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [gameOver, setGameOver] = useState(false)
  const [answered, setAnswered] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [childGrade, setChildGrade] = useState(1)

  useEffect(() => {
    const grade = parseInt(localStorage.getItem('childGrade') || '1')
    setChildGrade(grade)
    setQuestions(getQuestionsForGrade(grade))
  }, [])

  useEffect(() => {
    if (gameOver || questions.length === 0) return
    if (timeLeft === 0) {
      setGameOver(true)
      return
    }
    const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000)
    return () => clearTimeout(timer)
  }, [timeLeft, gameOver, questions])

  const handleAnswer = (index: number) => {
    if (answered) return
    setSelected(index)
    setAnswered(true)
    if (index === questions[current].correct) {
      setScore(prev => prev + 1)
    }
    setTimeout(() => {
      if (current < questions.length - 1) {
        setCurrent(prev => prev + 1)
        setAnswered(false)
        setSelected(null)
      } else {
        setGameOver(true)
      }
    }, 600)
  }

  const handleRestart = () => {
    setQuestions(getQuestionsForGrade(childGrade))
    setCurrent(0)
    setScore(0)
    setTimeLeft(60)
    setGameOver(false)
    setAnswered(false)
    setSelected(null)
  }

  const getTimerColor = () => {
    if (timeLeft > 30) return '#085041'
    if (timeLeft > 10) return '#854F0B'
    return '#A32D2D'
  }

  const getTimerBg = () => {
    if (timeLeft > 30) return '#E1F5EE'
    if (timeLeft > 10) return '#FAEEDA'
    return '#FCEBEB'
  }

  const getOptionStyle = (index: number) => {
    if (!answered) return {
      background: '#ffffff',
      border: '0.5px solid #D3D1C7',
      color: '#2C2C2A',
    }
    if (index === questions[current].correct) return {
      background: '#E1F5EE',
      border: '0.5px solid #9FE1CB',
      color: '#085041',
    }
    if (index === selected) return {
      background: '#FCEBEB',
      border: '0.5px solid #F09595',
      color: '#A32D2D',
    }
    return {
      background: '#ffffff',
      border: '0.5px solid #D3D1C7',
      color: '#888780',
    }
  }

  if (questions.length === 0) return null

  return (
    <div style={{ minHeight: '100vh', background: '#f5f4f0' }}>
      <nav style={{
        background: '#FBEAF0',
        padding: '14px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '0.5px solid #F4C0D1',
      }}>
        <button
          onClick={() => router.push('/child/dashboard')}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#72243E',
            fontSize: '14px',
          }}>
          ← Back
        </button>
        <span style={{
          fontSize: '16px',
          fontWeight: '500',
          color: '#72243E',
        }}>
          ⚡ Quick fire quiz
        </span>
        <div style={{
          background: getTimerBg(),
          borderRadius: '8px',
          padding: '4px 12px',
          fontSize: '14px',
          fontWeight: '500',
          color: getTimerColor(),
        }}>
          {timeLeft}s
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
                background: '#FBEAF0',
                borderRadius: '10px',
                padding: '10px 20px',
                textAlign: 'center',
              }}>
                <p style={{
                  fontSize: '11px',
                  color: '#993556',
                  marginBottom: '2px',
                }}>
                  Score
                </p>
                <p style={{
                  fontSize: '24px',
                  fontWeight: '500',
                  color: '#72243E',
                }}>
                  {score}
                </p>
              </div>
              <div style={{
                background: '#FBEAF0',
                borderRadius: '10px',
                padding: '10px 20px',
                textAlign: 'center',
              }}>
                <p style={{
                  fontSize: '11px',
                  color: '#993556',
                  marginBottom: '2px',
                }}>
                  Question
                </p>
                <p style={{
                  fontSize: '24px',
                  fontWeight: '500',
                  color: '#72243E',
                }}>
                  {current + 1}/{questions.length}
                </p>
              </div>
            </div>

            <div style={{
              background: '#FBEAF0',
              borderRadius: '16px',
              padding: '28px',
              textAlign: 'center',
              marginBottom: '20px',
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '500',
                color: '#4B1528',
                lineHeight: '1.4',
              }}>
                {questions[current].question}
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
            }}>
              {questions[current].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    fontSize: '15px',
                    cursor: answered ? 'default' : 'pointer',
                    transition: 'all 0.15s',
                    fontWeight: '500',
                    ...getOptionStyle(index),
                  }}>
                  {option}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>
              {score >= 5 ? '🏆' : score >= 3 ? '⭐' : '💪'}
            </div>
            <h1 style={{
              fontSize: '26px',
              fontWeight: '500',
              color: '#26215C',
              marginBottom: '8px',
            }}>
              {timeLeft === 0 ? 'Time\'s up!' : 'Quiz complete!'}
            </h1>
            <div style={{
              background: '#FBEAF0',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
            }}>
              <p style={{
                fontSize: '40px',
                fontWeight: '500',
                color: '#4B1528',
                marginBottom: '4px',
              }}>
                {score} points
              </p>
              <p style={{ fontSize: '14px', color: '#993556' }}>
                {score >= 5
                  ? 'Outstanding! You are on fire!'
                  : score >= 3
                  ? 'Great effort! Keep going!'
                  : 'Good try! Practice makes perfect!'}
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleRestart}
                style={{
                  padding: '14px',
                  background: '#D4537E',
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
                  color: '#D4537E',
                  border: '0.5px solid #D4537E',
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