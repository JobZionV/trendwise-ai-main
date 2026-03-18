const examples = [
  "Apple just dropped the M4 chip 🔥",
  "The new climate bill is a complete disaster",
  "Real Madrid wins Champions League again!",
  "Tesla stock crashes after earnings miss",
]

const S = {
  wrap: {
    flex: 1,
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    textAlign: 'center', gap: 16,
    padding: '40px 20px',
    animation: 'fadeIn .5s ease',
  },
  logo: {
    width: 68, height: 68,
    background: 'linear-gradient(135deg, var(--cyan) 0%, #4299e1 55%, #805ad5 100%)',
    borderRadius: 18,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--mono)', fontSize: 24, fontWeight: 700,
    color: 'var(--bg-0)',
    boxShadow: '0 0 40px rgba(99,179,237,.3), 0 0 80px rgba(99,179,237,.1)',
    marginBottom: 4,
  },
  h1: {
    fontFamily: 'var(--mono)', fontSize: 24, fontWeight: 700,
    color: 'var(--text-primary)',
  },
  p: {
    fontSize: 14, color: 'var(--text-secondary)',
    maxWidth: 420, lineHeight: 1.75,
  },
  chips: {
    display: 'flex', flexWrap: 'wrap', gap: 8,
    justifyContent: 'center', marginTop: 8,
  },
  chip: {
    padding: '8px 15px',
    background: 'var(--bg-3)',
    border: '1px solid var(--border)',
    borderRadius: 20,
    fontSize: 12, color: 'var(--text-secondary)',
    cursor: 'pointer', fontFamily: 'var(--mono)',
    transition: 'all .18s',
  },
}

export default function Welcome({ onExample }) {
  return (
    <div style={S.wrap}>
      <div style={S.logo}>TW</div>
      <h1 style={S.h1}>
        Trend<span style={{ color: 'var(--cyan)' }}>Wise</span> AI
      </h1>
      <p style={S.p}>
        Multi-layer sentiment analysis powered by DistilBERT + Gemini.
        Paste any tweet, headline, or text to get deep insights — sentiment,
        topic, entity extraction, live evidence &amp; AI synthesis.
      </p>
      <div style={S.chips}>
        {examples.map(ex => (
          <div
            key={ex}
            style={S.chip}
            onClick={() => onExample(ex)}
            onMouseEnter={e => {
              e.currentTarget.style.background   = 'var(--cyan-dim)'
              e.currentTarget.style.borderColor  = 'var(--cyan)'
              e.currentTarget.style.color        = 'var(--cyan-bright)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background   = 'var(--bg-3)'
              e.currentTarget.style.borderColor  = 'var(--border)'
              e.currentTarget.style.color        = 'var(--text-secondary)'
            }}
          >
            {ex}
          </div>
        ))}
      </div>
    </div>
  )
}