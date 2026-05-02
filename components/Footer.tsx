export default function Footer() {
  const columns = [
    {
      heading: 'Subjects',
      links: [
        { label: 'Mathematics', href: '/login' },
        { label: 'English', href: '/login' },
        { label: 'Science', href: '/login' },
        { label: 'AI homework help', href: '/login' },
      ],
    },
    {
      heading: 'Grades',
      links: [
        { label: 'Grade 1 – 3', href: '/login' },
        { label: 'Grade 4 – 6', href: '/login' },
        { label: 'Grade 7 – 8', href: '/login' },
        { label: 'Grade 9 – 10', href: '/login' },
      ],
    },
    {
      heading: 'Company',
      links: [
        { label: 'Contact', href: '/contact' },
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
      ],
    },
    {
      heading: 'Account',
      links: [
        { label: 'Sign up free', href: '/signup' },
        { label: 'Log in', href: '/login' },
        { label: 'Student login', href: '/child-login' },
      ],
    },
  ]

  return (
    <footer style={{
      background: '#26215C',
      padding: '56px 40px 32px',
    }}>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '40px',
        marginBottom: '48px',
      }}>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '6px',
              background: '#7F77DD',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontSize: '15px' }}>★</span>
            </div>
            <span style={{ color: '#ffffff', fontSize: '15px', fontWeight: '500' }}>BrightMinds</span>
          </div>
          <p style={{
            fontSize: '13px',
            color: '#6B6494',
            lineHeight: '1.6',
            margin: 0,
            maxWidth: '180px',
          }}>
            Learning made fun for Grade 1 to Grade 10.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.heading}>
            <p style={{
              fontSize: '12px',
              fontWeight: '500',
              color: '#ffffff',
              marginBottom: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              {col.heading}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {col.links.map((link) => (
                <a key={link.label} href={link.href} style={{
                  fontSize: '13px',
                  color: '#AFA9EC',
                  textDecoration: 'none',
                }}>
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        ))}

      </div>

      <div style={{
        borderTop: '0.5px solid #3D3572',
        paddingTop: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '10px',
      }}>
        <span style={{ fontSize: '12px', color: '#6B6494' }}>
          © 2026 BrightMinds · All rights reserved
        </span>
        <div style={{ display: 'flex', gap: '20px' }}>
          {[
            { label: 'Privacy', href: '/privacy' },
            { label: 'Terms', href: '/terms' },
            { label: 'Contact', href: '/contact' },
          ].map((link) => (
            <a key={link.label} href={link.href} style={{
              fontSize: '12px',
              color: '#6B6494',
              textDecoration: 'none',
            }}>
              {link.label}
            </a>
          ))}
        </div>
      </div>

    </footer>
  )
}
