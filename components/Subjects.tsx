const subjects = [
  {
    icon: '➕',
    name: 'Mathematics',
    topics: 'Addition, algebra, geometry +14',
    bg: '#EAF3DE',
  },
  {
    icon: '📖',
    name: 'English',
    topics: 'Reading, writing, grammar +10',
    bg: '#E6F1FB',
  },
  {
    icon: '🔬',
    name: 'Science',
    topics: 'Biology, physics, chemistry +12',
    bg: '#FAEEDA',
  },
  {
    icon: '🤖',
    name: 'AI homework helper',
    topics: 'Guided hints, not answers',
    bg: '#FBEAF0',
  },
]

export default function Subjects() {
  return (
    <section style={{ padding: '48px 40px 24px' }}>
      <h2 style={{
        fontSize: '22px',
        fontWeight: '500',
        color: '#2C2C2A',
        marginBottom: '6px',
      }}>
        Subjects covered
      </h2>
      <p style={{
        fontSize: '14px',
        color: '#888780',
        marginBottom: '20px',
      }}>
        Content automatically adjusts to your child's grade level
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
      }}>
        {subjects.map((subject) => (
          <div key={subject.name} style={{
            background: '#ffffff',
            border: '0.5px solid #e5e3db',
            borderRadius: '12px',
            padding: '18px',
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: subject.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              marginBottom: '10px',
            }}>
              {subject.icon}
            </div>
            <p style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#2C2C2A',
              marginBottom: '4px',
            }}>
              {subject.name}
            </p>
            <p style={{
              fontSize: '12px',
              color: '#888780',
            }}>
              {subject.topics}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}