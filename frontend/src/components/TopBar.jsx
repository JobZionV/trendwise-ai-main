const S = {
  bar: {
    height: 54,
    display: 'flex', alignItems: 'center',
    padding: '0 20px', gap: 12,
    borderBottom: '1px solid var(--border)',
    background: 'rgba(7,11,20,.65)',
    backdropFilter: 'blur(10px)',
    flexShrink: 0, zIndex: 5,
    position: 'relative',
  },
  menuBtn: {
    width: 30, height: 30,
    background: 'transparent',
    border: '1px solid transparent',
    borderRadius: 7,
    color: 'var(--text-muted)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, flexShrink: 0,
    transition: 'background .18s, color .18s',
  },
  title: {
    fontFamily: 'var(--mono)', fontSize: 12,
    color: 'var(--text-muted)', letterSpacing: '.05em',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  pill: (connected) => ({
    marginLeft: 'auto', flexShrink: 0,
    display: 'flex', alignItems: 'center', gap: 6,
    borderRadius: 20, padding: '4px 11px',
    fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700,
    letterSpacing: '.08em', textTransform: 'uppercase',
    border: '1px solid',
    whiteSpace: 'nowrap',
    ...(connected
      ? { background: 'var(--green-dim)', borderColor: 'rgba(104,211,145,.25)', color: 'var(--green)' }
      : { background: 'var(--bg-3)',      borderColor: 'var(--border)',         color: 'var(--text-muted)' }),
  }),
  dot: (connected) => ({
    width: 6, height: 6,
    borderRadius: '50%',
    background: 'currentColor',
    ...(connected ? { animation: 'pulse 2s infinite', boxShadow: '0 0 5px currentColor' } : {}),
  }),
}

export default function TopBar({ onToggle, connected }) {
  return (
    <div style={S.bar}>
      <button
        style={S.menuBtn}
        onClick={onToggle}
        title="Toggle Sidebar"
        onMouseEnter={e => { e.currentTarget.style.background='var(--bg-3)'; e.currentTarget.style.color='var(--cyan-bright)' }}
        onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-muted)' }}
      >
        ☰
      </button>
      <div style={S.title}>TrendWise AI · Sentiment &amp; Topic Analysis</div>
      <div style={S.pill(connected)}>
        <div style={S.dot(connected)} />
        {connected ? 'Models Ready' : 'Disconnected'}
      </div>
    </div>
  )
}