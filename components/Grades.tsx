export default function Grades() {
  const stats = [
    { value: 'Grades 1–10', label: 'All school years covered', icon: '🎓' },
    { value: '3 Subjects', label: 'Maths, English & Science', icon: '📚' },
    { value: '50+ Topics', label: 'Across all grades', icon: '📝' },
    { value: 'AI Helper', label: 'Homework hints on demand', icon: '🤖' },
    { value: '4 Games', label: 'Brain breaks between lessons', icon: '🎮' },
  ]

  return (
    <section style={{
      background: '#ffffff',
      borderTop: '0.5px solid #e5e3db',
      borderBottom: '0.5px solid #e5e3db',
      padding: '0 40px',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}>
        {stats.map((stat, index) => (
          <div key={stat.value} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '24px 40px',
            borderRight: index < stats.length - 1 ? '0.5px solid #e5e3db' : 'none',
          }}>
            <span style={{ fontSize: '24px' }}>{stat.icon}</span>
            <div>
              <p style={{
                fontSize: '15px',
                fontWeight: '500',
                color: '#26215C',
                margin: '0 0 2px',
              }}>
                {stat.value}
              </p>
              <p style={{
                fontSize: '12px',
                color: '#888780',
                margin: 0,
              }}>
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
