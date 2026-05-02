export default function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Create a parent account',
      description: 'Sign up free and add your children. Each child gets their own profile with a grade level and a unique family login code.',
      bg: '#EEEDFE',
      color: '#534AB7',
    },
    {
      number: '2',
      title: 'Assign subjects and deadlines',
      description: 'Pick from Maths, English and Science topics matched to your child\'s grade. Set a deadline so they stay on track.',
      bg: '#E1F5EE',
      color: '#085041',
    },
    {
      number: '3',
      title: 'Kids learn, you track progress',
      description: 'Your child works through lessons, takes quizzes and earns badges. You see exactly where they\'re thriving and where they need help.',
      bg: '#FAEEDA',
      color: '#412402',
    },
  ]

  return (
    <section style={{
      padding: '40px 40px',
      background: '#f5f4f0',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{
            fontSize: '30px',
            fontWeight: '500',
            color: '#26215C',
            marginBottom: '10px',
          }}>
            How it works
          </h2>
          <p style={{
            fontSize: '15px',
            color: '#888780',
          }}>
            Up and running in under 5 minutes
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
        }}>
          {steps.map((step) => (
            <div key={step.number} style={{
              background: '#ffffff',
              border: '0.5px solid #e5e3db',
              borderRadius: '14px',
              padding: '32px 28px',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: step.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: '500',
                color: step.color,
                marginBottom: '20px',
              }}>
                {step.number}
              </div>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '500',
                color: '#2C2C2A',
                marginBottom: '10px',
              }}>
                {step.title}
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#888780',
                lineHeight: '1.65',
                margin: 0,
              }}>
                {step.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
