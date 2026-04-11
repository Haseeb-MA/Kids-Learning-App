const games = [
  {
    icon: '🧩',
    name: 'Maths puzzles',
    desc: 'Solve fun number challenges',
    bg: '#EAF3DE',
    color: '#27500A',
    subColor: '#3B6D11',
  },
  {
    icon: '🔤',
    name: 'Word scramble',
    desc: 'Unscramble letters fast',
    bg: '#E6F1FB',
    color: '#0C447C',
    subColor: '#185FA5',
  },
  {
    icon: '🧠',
    name: 'Memory match',
    desc: 'Flip and match the cards',
    bg: '#FAEEDA',
    color: '#633806',
    subColor: '#854F0B',
  },
  {
    icon: '⚡',
    name: 'Quick fire quiz',
    desc: 'Answer fast, beat the clock',
    bg: '#FBEAF0',
    color: '#72243E',
    subColor: '#993556',
  },
]

export default function Games() {
  return (
    <section style={{ padding: '24px 40px' }}>
      <h2 style={{
        fontSize: '22px',
        fontWeight: '500',
        color: '#2C2C2A',
        marginBottom: '6px',
      }}>
        Brain break games
      </h2>
      <p style={{
        fontSize: '14px',
        color: '#888780',
        marginBottom: '20px',
      }}>
        When kids need a fun break between lessons
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
      }}>
        {games.map((game) => (
          <div key={game.name} style={{
            background: game.bg,
            borderRadius: '12px',
            padding: '18px',
            cursor: 'pointer',
          }}>
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>
              {game.icon}
            </div>
            <p style={{
              fontSize: '14px',
              fontWeight: '500',
              color: game.color,
              marginBottom: '4px',
            }}>
              {game.name}
            </p>
            <p style={{
              fontSize: '12px',
              color: game.subColor,
            }}>
              {game.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}