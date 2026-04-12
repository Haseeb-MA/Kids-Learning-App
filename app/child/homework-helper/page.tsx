'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUBJECTS = [
  'Mathematics',
  'English',
  'Science',
  'General',
]

export default function HomeworkHelper() {
  const router = useRouter()
  const [childName, setChildName] = useState('')
  const [childGrade, setChildGrade] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [subject, setSubject] = useState('General')
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const storedId = localStorage.getItem('childId')
    const storedName = localStorage.getItem('childName')
    const storedGrade = localStorage.getItem('childGrade')

    if (!storedId) {
      router.push('/child-login')
      return
    }

    setChildName(storedName || '')
    setChildGrade(storedGrade || '')

    setMessages([{
      role: 'assistant',
      content: `Hi ${storedName?.split(' ')[0]}! 👋 I am your homework helper. I won't give you the answers directly, but I will give you hints and help you figure it out yourself — that's how real learning works! What are you working on today?`,
    }])
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

const handleSend = async () => {
  if (!input.trim() || loading) return

  const userMessage = input.trim()
  setInput('')
  setError('')

  const newMessages = [
    ...messages,
    { role: 'user' as const, content: userMessage },
  ]
  setMessages(newMessages)
  setLoading(true)

  try {
    const response = await fetch('/api/homework-helper', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: userMessage,
        grade: childGrade,
        subject,
        messages: messages,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('API error:', errorData)
      setError('Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    const data = await response.json()

    if (data.error) {
      console.error('Data error:', data.error)
      setError('Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    setMessages([
      ...newMessages,
      { role: 'assistant' as const, content: data.reply },
    ])
  } catch (err) {
    console.error('Fetch error:', err)
    setError('Something went wrong. Please try again.')
  }

  setLoading(false)
}

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const quickPrompts = [
    'Can you give me a hint?',
    'Can you show me an example?',
    'I still don\'t understand',
    'Can you explain it differently?',
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f4f0',
      display: 'flex',
      flexDirection: 'column',
    }}>

      <nav style={{
        background: '#7F77DD',
        padding: '14px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
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
            Homework helper 🤖
          </span>
        </div>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={{
            padding: '6px 12px',
            borderRadius: '8px',
            border: '0.5px solid #AFA9EC',
            background: 'transparent',
            color: '#ffffff',
            fontSize: '13px',
            cursor: 'pointer',
          }}>
          {SUBJECTS.map(s => (
            <option
              key={s}
              value={s}
              style={{ color: '#2C2C2A', background: '#fff' }}>
              {s}
            </option>
          ))}
        </select>
      </nav>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px 40px',
        maxWidth: '720px',
        width: '100%',
        margin: '0 auto',
      }}>
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '16px',
            }}>
            {message.role === 'assistant' && (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#7F77DD',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                marginRight: '10px',
                flexShrink: 0,
                marginTop: '4px',
              }}>
                🤖
              </div>
            )}
            <div style={{
              maxWidth: '80%',
              padding: '12px 16px',
              borderRadius: message.role === 'user'
                ? '16px 4px 16px 16px'
                : '4px 16px 16px 16px',
              background: message.role === 'user' ? '#7F77DD' : '#ffffff',
              color: message.role === 'user' ? '#ffffff' : '#2C2C2A',
              fontSize: '14px',
              lineHeight: '1.6',
              border: message.role === 'assistant'
                ? '0.5px solid #e5e3db' : 'none',
            }}>
              {message.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#7F77DD',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
            }}>
              🤖
            </div>
            <div style={{
              background: '#ffffff',
              border: '0.5px solid #e5e3db',
              borderRadius: '4px 16px 16px 16px',
              padding: '12px 16px',
              fontSize: '14px',
              color: '#888780',
            }}>
              Thinking of a hint for you...
            </div>
          </div>
        )}

        {error && (
          <div style={{
            background: '#FCEBEB',
            border: '0.5px solid #F09595',
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '16px',
            fontSize: '13px',
            color: '#A32D2D',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div style={{
        background: '#ffffff',
        borderTop: '0.5px solid #e5e3db',
        padding: '16px 40px',
        flexShrink: 0,
      }}>
        <div style={{
          maxWidth: '720px',
          margin: '0 auto',
        }}>
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: '12px',
          }}>
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  setInput(prompt)
                }}
                style={{
                  padding: '5px 12px',
                  background: '#EEEDFE',
                  border: '0.5px solid #AFA9EC',
                  borderRadius: '20px',
                  fontSize: '12px',
                  color: '#534AB7',
                  cursor: 'pointer',
                }}>
                {prompt}
              </button>
            ))}
          </div>

          <div style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-end',
          }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your question here..."
              rows={2}
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '0.5px solid #D3D1C7',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
                lineHeight: '1.5',
              }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{
                padding: '10px 20px',
                background: loading || !input.trim() ? '#AFA9EC' : '#7F77DD',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                height: '44px',
                whiteSpace: 'nowrap',
              }}>
              Send →
            </button>
          </div>
          <p style={{
            fontSize: '11px',
            color: '#888780',
            marginTop: '8px',
            textAlign: 'center',
          }}>
            Press Enter to send · Shift + Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}