'use client'

import Link from 'next/link'

export default function Navbar() {
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '14px 40px',
      background: '#ffffff',
      borderBottom: '0.5px solid #e5e3db',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '34px',
          height: '34px',
          borderRadius: '8px',
          background: '#7F77DD',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ color: '#fff', fontSize: '18px' }}>★</span>
        </div>
        <span style={{ fontSize: '18px', fontWeight: '500', color: '#2C2C2A' }}>
          BrightMinds
        </span>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <Link href="/login">
          <button style={{
            padding: '8px 20px',
            border: '0.5px solid #888780',
            borderRadius: '8px',
            fontSize: '14px',
            background: 'transparent',
            color: '#2C2C2A',
          }}>
            Log in
          </button>
        </Link>
        <Link href="/signup">
          <button style={{
            padding: '8px 20px',
            border: '0.5px solid #534AB7',
            borderRadius: '8px',
            fontSize: '14px',
            background: '#7F77DD',
            color: '#ffffff',
          }}>
            Sign up free
          </button>
        </Link>
      </div>
    </nav>
  )
}