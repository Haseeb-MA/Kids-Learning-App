export default function Grades() {
  const grades = [
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'
  ]

  return (
    <section style={{
      padding: '20px 40px',
      background: '#F1EFE8',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexWrap: 'wrap',
      }}>
        <span style={{
          fontSize: '13px',
          color: '#888780',
          marginRight: '4px',
        }}>
          Grades covered:
        </span>
        {grades.map((grade) => (
          <span key={grade} style={{
            background: '#ffffff',
            border: '0.5px solid #D3D1C7',
            borderRadius: '20px',
            padding: '4px 12px',
            fontSize: '12px',
            color: '#444441',
          }}>
            {grade}
          </span>
        ))}
      </div>
    </section>
  )
}