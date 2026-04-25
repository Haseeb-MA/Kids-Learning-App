'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

interface Profile {
  id: string
  email: string
  full_name: string
  role: string
  is_active: boolean
  created_at: string
}

interface Stats {
  totalParents: number
  totalChildren: number
  activeParents: number
  activeChildren: number
}

interface Message {
  id: string
  name: string
  email: string
  subject: string
  message: string
  is_read: boolean
  created_at: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [children, setChildren] = useState<any[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [stats, setStats] = useState<Stats>({
    totalParents: 0,
    totalChildren: 0,
    activeParents: 0,
    activeChildren: 0,
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'parents' | 'children' | 'messages'>('parents')
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Admin dashboard · BrightMinds'
    checkAdminAndLoad()
  }, [])

  const checkAdminAndLoad = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'admin') {
      router.push('/login')
      return
    }
    await loadData()
    setLoading(false)
  }

  const loadData = async () => {
    const { data: parents } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'parent')
      .order('created_at', { ascending: false })

    const { data: childrenData } = await supabase
  .from('children')
  .select('*, profiles(full_name, email)')
  .order('created_at', { ascending: false })

    const { data: messagesData } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })

    if (parents) {
      setProfiles(parents)
      setStats(prev => ({
        ...prev,
        totalParents: parents.length,
        activeParents: parents.filter(p => p.is_active).length,
      }))
    }

    if (childrenData) {
      setChildren(childrenData)
      setStats(prev => ({
        ...prev,
        totalChildren: childrenData.length,
        activeChildren: childrenData.filter((c: any) => c.is_active).length,
      }))
    }

    if (messagesData) setMessages(messagesData)
  }

  const toggleActive = async (id: string, currentStatus: boolean, table: string) => {
    await supabase
      .from(table)
      .update({ is_active: !currentStatus })
      .eq('id', id)
    await loadData()
  }

  const handleReadMessage = async (id: string, currentStatus: boolean) => {
    await supabase
      .from('contact_messages')
      .update({ is_read: !currentStatus })
      .eq('id', id)
    await loadData()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const unreadCount = messages.filter(m => !m.is_read).length

  const renderParentsTable = () => (
    <>
      <thead>
        <tr style={{ background: '#f5f4f0' }}>
          <th style={thStyle}>Name</th>
          <th style={thStyle}>Email</th>
          <th style={thStyle}>Joined</th>
          <th style={thStyle}>Status</th>
          <th style={thStyle}>Action</th>
        </tr>
      </thead>
      <tbody>
        {profiles.length === 0 ? (
          <tr>
            <td colSpan={5} style={{
              textAlign: 'center',
              padding: '40px',
              color: '#888780',
              fontSize: '14px',
            }}>
              No parents registered yet
            </td>
          </tr>
        ) : profiles.map((profile, index) => (
          <tr key={profile.id} style={{
            borderTop: index === 0 ? 'none' : '0.5px solid #e5e3db',
          }}>
            <td style={tdStyle}>{profile.full_name || '—'}</td>
            <td style={tdStyle}>{profile.email}</td>
            <td style={tdStyle}>
              {new Date(profile.created_at).toLocaleDateString()}
            </td>
            <td style={tdStyle}>
              <span style={{
                background: profile.is_active ? '#E1F5EE' : '#FCEBEB',
                color: profile.is_active ? '#085041' : '#A32D2D',
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '12px',
              }}>
                {profile.is_active ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td style={tdStyle}>
              <button
                onClick={() => toggleActive(profile.id, profile.is_active, 'profiles')}
                style={{
                  padding: '5px 12px',
                  border: '0.5px solid #D3D1C7',
                  borderRadius: '6px',
                  fontSize: '12px',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: profile.is_active ? '#A32D2D' : '#085041',
                }}>
                {profile.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </>
  )

  const renderChildrenTable = () => (
    <>
      <thead>
        <tr style={{ background: '#f5f4f0' }}>
          <th style={thStyle}>Name</th>
          <th style={thStyle}>Grade</th>
          <th style={thStyle}>Parent</th>
          <th style={thStyle}>Status</th>
          <th style={thStyle}>Action</th>
        </tr>
      </thead>
      <tbody>
        {children.length === 0 ? (
          <tr>
            <td colSpan={5} style={{
              textAlign: 'center',
              padding: '40px',
              color: '#888780',
              fontSize: '14px',
            }}>
              No children added yet
            </td>
          </tr>
        ) : children.map((child, index) => (
          <tr key={child.id} style={{
            borderTop: index === 0 ? 'none' : '0.5px solid #e5e3db',
          }}>
            <td style={tdStyle}>{child.full_name}</td>
            <td style={tdStyle}>
              <span style={{
                background: '#EEEDFE',
                color: '#534AB7',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '12px',
              }}>
                Grade {child.grade}
              </span>
            </td>
            <td style={tdStyle}>
  {child.profiles?.full_name || child.profiles?.email || '—'}
</td>
            <td style={tdStyle}>
              <span style={{
                background: child.is_active ? '#E1F5EE' : '#FCEBEB',
                color: child.is_active ? '#085041' : '#A32D2D',
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '12px',
              }}>
                {child.is_active ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td style={tdStyle}>
              <button
                onClick={() => toggleActive(child.id, child.is_active, 'children')}
                style={{
                  padding: '5px 12px',
                  border: '0.5px solid #D3D1C7',
                  borderRadius: '6px',
                  fontSize: '12px',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: child.is_active ? '#A32D2D' : '#085041',
                }}>
                {child.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </>
  )

  const renderMessagesTable = () => (
    <>
      <thead>
        <tr style={{ background: '#f5f4f0' }}>
          <th style={thStyle}>Name</th>
          <th style={thStyle}>Email</th>
          <th style={thStyle}>Subject</th>
          <th style={thStyle}>Date</th>
          <th style={thStyle}>Status</th>
          <th style={thStyle}>Action</th>
        </tr>
      </thead>
      <tbody>
        {messages.length === 0 ? (
          <tr>
            <td colSpan={6} style={{
              textAlign: 'center',
              padding: '40px',
              color: '#888780',
              fontSize: '14px',
            }}>
              No messages yet
            </td>
          </tr>
        ) : messages.map((msg, index) => (
          <React.Fragment key={msg.id}>
            <tr
              onClick={() => setExpandedMessage(
                expandedMessage === msg.id ? null : msg.id
              )}
              style={{
                borderTop: index === 0 ? 'none' : '0.5px solid #e5e3db',
                background: msg.is_read ? '#ffffff' : '#EEEDFE',
                cursor: 'pointer',
              }}>
              <td style={tdStyle}>{msg.name}</td>
              <td style={tdStyle}>{msg.email}</td>
              <td style={tdStyle}>{msg.subject}</td>
              <td style={tdStyle}>
                {new Date(msg.created_at).toLocaleDateString()}
              </td>
              <td style={tdStyle}>
                <span style={{
                  background: msg.is_read ? '#F1EFE8' : '#EEEDFE',
                  color: msg.is_read ? '#888780' : '#534AB7',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '12px',
                }}>
                  {msg.is_read ? 'Read' : 'New'}
                </span>
              </td>
              <td style={tdStyle}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setExpandedMessage(
                        expandedMessage === msg.id ? null : msg.id
                      )
                    }}
                    style={{
                      padding: '5px 12px',
                      border: '0.5px solid #AFA9EC',
                      borderRadius: '6px',
                      fontSize: '12px',
                      background: expandedMessage === msg.id
                        ? '#EEEDFE' : 'transparent',
                      cursor: 'pointer',
                      color: '#534AB7',
                    }}>
                    {expandedMessage === msg.id ? 'Hide' : 'Read'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleReadMessage(msg.id, msg.is_read)
                    }}
                    style={{
                      padding: '5px 12px',
                      border: '0.5px solid #D3D1C7',
                      borderRadius: '6px',
                      fontSize: '12px',
                      background: 'transparent',
                      cursor: 'pointer',
                      color: msg.is_read ? '#534AB7' : '#085041',
                    }}>
                    {msg.is_read ? 'Unread' : 'Mark read'}
                  </button>
                </div>
              </td>
            </tr>
            {expandedMessage === msg.id && (
              <tr style={{
                background: '#f5f4f0',
                borderTop: '0.5px solid #e5e3db',
              }}>
                <td colSpan={6} style={{ padding: '16px 20px' }}>
                  <div style={{
                    background: '#ffffff',
                    border: '0.5px solid #e5e3db',
                    borderRadius: '10px',
                    padding: '16px 20px',
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '12px',
                      flexWrap: 'wrap' as const,
                      gap: '8px',
                    }}>
                      <div>
                        <p style={{
                          fontSize: '13px',
                          fontWeight: '500',
                          color: '#2C2C2A',
                          margin: '0 0 2px',
                        }}>
                          From: {msg.name}
                        </p>
                        <p style={{
                          fontSize: '12px',
                          color: '#888780',
                          margin: 0,
                        }}>
                          {msg.email}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' as const }}>
                        <p style={{
                          fontSize: '12px',
                          color: '#888780',
                          margin: '0 0 2px',
                        }}>
                          {new Date(msg.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                        <p style={{
                          fontSize: '12px',
                          color: '#534AB7',
                          margin: 0,
                        }}>
                          {msg.subject}
                        </p>
                      </div>
                    </div>
                    <div style={{
                      borderTop: '0.5px solid #e5e3db',
                      paddingTop: '12px',
                      fontSize: '14px',
                      color: '#444441',
                      lineHeight: '1.7',
                      whiteSpace: 'pre-wrap' as const,
                    }}>
                      {msg.message}
                    </div>
                    <div style={{
                      marginTop: '12px',
                      paddingTop: '12px',
                      borderTop: '0.5px solid #e5e3db',
                    }}>
                      
                        <button
  onClick={() => {
    window.location.href = 'mailto:' + msg.email + '?subject=Re: ' + msg.subject
  }}
  style={{
    padding: '7px 16px',
    background: '#7F77DD',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    cursor: 'pointer',
  }}>
  Reply via email
</button>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </>
  )

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
          <span style={{ color: '#fff', fontSize: '16px', fontWeight: '500' }}>
            BrightMinds
          </span>
          <span style={{
            background: '#534AB7',
            color: '#CECBF6',
            fontSize: '11px',
            padding: '2px 8px',
            borderRadius: '20px',
            marginLeft: '4px',
          }}>
            Admin
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => router.push('/admin/content')}
            style={{
              padding: '7px 16px',
              background: '#7F77DD',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '13px',
              cursor: 'pointer',
            }}>
            Content manager
          </button>
          <button
            onClick={handleLogout}
            style={{
              padding: '7px 16px',
              background: 'transparent',
              border: '0.5px solid #534AB7',
              borderRadius: '8px',
              color: '#AFA9EC',
              fontSize: '13px',
              cursor: 'pointer',
            }}>
            Log out
          </button>
        </div>
      </nav>

      <div style={{ padding: '32px 40px' }}>

        <h1 style={{
          fontSize: '22px',
          fontWeight: '500',
          color: '#2C2C2A',
          marginBottom: '6px',
        }}>
          Admin dashboard
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#888780',
          marginBottom: '28px',
        }}>
          Manage parents, children and platform settings
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '12px',
          marginBottom: '32px',
        }}>
          {[
            { label: 'Total parents', value: stats.totalParents, bg: '#EEEDFE', color: '#26215C' },
            { label: 'Active parents', value: stats.activeParents, bg: '#E1F5EE', color: '#085041' },
            { label: 'Total children', value: stats.totalChildren, bg: '#E6F1FB', color: '#042C53' },
            { label: 'Active children', value: stats.activeChildren, bg: '#FAEEDA', color: '#412402' },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: stat.bg,
              borderRadius: '12px',
              padding: '20px',
            }}>
              <p style={{
                fontSize: '13px',
                color: stat.color,
                marginBottom: '8px',
                opacity: 0.7,
              }}>
                {stat.label}
              </p>
              <p style={{
                fontSize: '28px',
                fontWeight: '500',
                color: stat.color,
              }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div style={{
          display: 'flex',
          gap: '2px',
          marginBottom: '20px',
          background: '#e5e3db',
          borderRadius: '10px',
          padding: '3px',
          width: 'fit-content',
        }}>
          {(['parents', 'children', 'messages'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '13px',
                cursor: 'pointer',
                background: activeTab === tab ? '#ffffff' : 'transparent',
                color: activeTab === tab ? '#26215C' : '#888780',
                fontWeight: activeTab === tab ? '500' : '400',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'messages' && unreadCount > 0 && (
                <span style={{
                  background: '#7F77DD',
                  color: '#fff',
                  fontSize: '10px',
                  padding: '1px 6px',
                  borderRadius: '10px',
                }}>
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '0.5px solid #e5e3db',
          overflow: 'hidden',
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px',
          }}>
            {activeTab === 'parents' && renderParentsTable()}
            {activeTab === 'children' && renderChildrenTable()}
            {activeTab === 'messages' && renderMessagesTable()}
          </table>
        </div>

      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'left',
  fontSize: '12px',
  color: '#888780',
  fontWeight: '500',
}

const tdStyle: React.CSSProperties = {
  padding: '14px 16px',
  color: '#2C2C2A',
}