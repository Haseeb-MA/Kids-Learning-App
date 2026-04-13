
'use client'

import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ContactPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('General enquiry')
  const [message, setMessage] = useState('')
 const [submitted, setSubmitted] = useState(false)
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')


  useEffect(() => {
    document.title = 'Contact us · BrightMinds'
  }, [])

  const handleSubmit = async () => {
  if (!name || !email || !message) return
  setLoading(true)

  const { error } = await supabase
    .from('contact_messages')
    .insert({
      name,
      email,
      subject,
      message,
    })

  if (error) {
    setError('Something went wrong. Please try again.')
    setLoading(false)
    return
  }

  setSubmitted(true)
  setLoading(false)
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
            onClick={() => router.push('/')}
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

      <div style={{
        maxWidth: '560px',
        margin: '0 auto',
        padding: '48px 40px',
      }}>
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✉️</div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '500',
              color: '#26215C',
              marginBottom: '10px',
            }}>
              Message sent!
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#888780',
              marginBottom: '28px',
              lineHeight: '1.6',
            }}>
              Thanks for getting in touch. We'll get back to you as soon as possible.
            </p>
            <button
              onClick={() => router.push('/')}
              style={{
                padding: '12px 24px',
                background: '#7F77DD',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer',
              }}>
              Back to home
            </button>
          </div>
        ) : (
          <>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '500',
              color: '#26215C',
              marginBottom: '8px',
            }}>
              Contact us
            </h1>
            <p style={{
              fontSize: '14px',
              color: '#888780',
              marginBottom: '32px',
            }}>
              Have a question or feedback? We'd love to hear from you.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '16px',
            }}>
              <div>
                <label style={{
                  fontSize: '13px',
                  color: '#444441',
                  display: 'block',
                  marginBottom: '6px',
                }}>
                  Your name
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '0.5px solid #D3D1C7',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{
                  fontSize: '13px',
                  color: '#444441',
                  display: 'block',
                  marginBottom: '6px',
                }}>
                  Email address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '0.5px solid #D3D1C7',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                fontSize: '13px',
                color: '#444441',
                display: 'block',
                marginBottom: '6px',
              }}>
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '0.5px solid #D3D1C7',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  background: '#fff',
                  boxSizing: 'border-box',
                }}>
                <option>General enquiry</option>
                <option>Technical issue</option>
                <option>Account help</option>
                <option>Content feedback</option>
                <option>Privacy concern</option>
                <option>Other</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                fontSize: '13px',
                color: '#444441',
                display: 'block',
                marginBottom: '6px',
              }}>
                Message
              </label>
              <textarea
                placeholder="Write your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
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
            </div>

            {error && (
  <div style={{
    background: '#FCEBEB',
    border: '0.5px solid #F09595',
    borderRadius: '8px',
    padding: '10px 14px',
    marginBottom: '16px',
    fontSize: '13px',
    color: '#A32D2D',
  }}>
    {error}
  </div>
)}

  <button
  onClick={handleSubmit}
  disabled={!name || !email || !message || loading}
  style={{
    width: '100%',
    padding: '12px',
    background: !name || !email || !message || loading
      ? '#AFA9EC' : '#7F77DD',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    cursor: !name || !email || !message || loading
      ? 'not-allowed' : 'pointer',
  }}>
  {loading ? 'Sending...' : 'Send message'}
</button>
            <div style={{
              marginTop: '32px',
              paddingTop: '24px',
              borderTop: '0.5px solid #e5e3db',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
            }}>
              {[
                {
                  icon: '📧',
                  label: 'Email',
                  value: 'hello@brightminds.app',
                },
                {
                  icon: '⏱️',
                  label: 'Response time',
                  value: 'Within 24 hours',
                },
              ].map(item => (
                <div key={item.label} style={{
                  background: '#ffffff',
                  border: '0.5px solid #e5e3db',
                  borderRadius: '10px',
                  padding: '16px',
                }}>
                  <div style={{ fontSize: '20px', marginBottom: '6px' }}>
                    {item.icon}
                  </div>
                  <p style={{
                    fontSize: '12px',
                    color: '#888780',
                    margin: '0 0 2px',
                  }}>
                    {item.label}
                  </p>
                  <p style={{
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#2C2C2A',
                    margin: 0,
                  }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}