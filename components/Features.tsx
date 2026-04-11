const features = [
  {
    icon: '👨‍👧',
    title: 'Multiple children',
    desc: 'Manage all your kids from one parent account',
    bg: '#EEEDFE',
  },
  {
    icon: '🏆',
    title: 'Points & badges',
    desc: 'Kids earn rewards as they complete lessons',
    bg: '#E1F5EE',
  },
  {
    icon: '📅',
    title: 'Set deadlines',
    desc: 'Assign completion dates per subject per child',
    bg: '#FAEEDA',
  },
  {
    icon: '📊',
    title: 'Progress reports',
    desc: 'Weekly summaries of strengths and gaps',
    bg: '#E6F1FB',
  },
]

export default function Features() {
  return (
    <section style={{ padding: '24px 40px 48px' }}>
      <h2 style={{
        fontSize: '22px',
        fontWeight: '500',
        color: '#2C2C2A',
        marginBottom: '6px',
      }}>
        Everything parents need
      </h2>
      <p style={{
        fontSize: '14px',
        color: '#888780',
        marginBottom: '20px',
      }}>
        Full control over your child's learning journey
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
      }}>
        {features.map((feature) => (
          <div key={feature.title} style={{
            background: '#ffffff',
            border: '0.5px solid #e5e3db',
            borderRadius: '12px',
            padding: '18px',
          }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: feature.bg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              marginBottom: '10px',
            }}>
              {feature.icon}
            </div>
            <p style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#2C2C2A',
              marginBottom: '4px',
            }}>
              {feature.title}
            </p>
            <p style={{
              fontSize: '12px',
              color: '#888780',
            }}>
              {feature.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}