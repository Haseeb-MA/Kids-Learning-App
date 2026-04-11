export default function Footer() {
  return (
    <footer style={{
      background: '#26215C',
      padding: '20px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '10px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '6px',
          background: '#7F77DD',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ color: '#fff', fontSize: '14px' }}>★</span>
        </div>
        <span style={{ color: '#AFA9EC', fontSize: '14px' }}>BrightMinds</span>
      </div>

      <span style={{ fontSize: '12px', color: '#AFA9EC' }}>
        © 2026 BrightMinds · All rights reserved
      </span>

      <div style={{ display: 'flex', gap: '20px' }}>
        {['Privacy', 'Terms', 'Contact'].map((link) => (
          <a key={link} href="#" style={{
            fontSize: '12px',
            color: '#AFA9EC',
            textDecoration: 'none',
          }}>
            {link}
          </a>
        ))}
      </div>
    </footer>
  )
}