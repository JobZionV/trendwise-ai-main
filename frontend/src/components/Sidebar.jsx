import { useEffect, useRef } from 'react'

const S = {
  sidebar: (open) => ({
    width:     open ? 'var(--sidebar-width)' : '0',
    minWidth:  open ? 'var(--sidebar-width)' : '0',
    opacity:   open ? 1 : 0,
    pointerEvents: open ? 'all' : 'none',
    background:    'var(--bg-1)',
    borderRight:   '1px solid var(--border)',
    display:       'flex',
    flexDirection: 'column',
    overflow:      'hidden',
    flexShrink:    0,
    transition:    'width .28s cubic-bezier(.4,0,.2,1), min-width .28s cubic-bezier(.4,0,.2,1), opacity .28s ease',
    zIndex: 10,
  }),
  header: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 14px 14px',
    borderBottom: '1px solid var(--border)',
    flexShrink: 0,
  },
  logo: { display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: {
    width: 30, height: 30,
    background: 'linear-gradient(135deg, var(--cyan), #4299e1)',
    borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700,
    color: 'var(--bg-0)', flexShrink: 0,
    boxShadow: '0 0 14px rgba(99,179,237,.35)',
  },
  logoText: {
    fontFamily: 'var(--mono)', fontSize: 14, fontWeight: 700,
    color: 'var(--text-primary)', whiteSpace: 'nowrap',
  },
  actions: { display: 'flex', gap: 4 },
  iconBtn: {
    width: 30, height: 30,
    background: 'transparent',
    border: '1px solid transparent',
    borderRadius: 7,
    color: 'var(--text-muted)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background .18s, color .18s',
    fontSize: 14,
  },
  sectionLabel: {
    padding: '14px 16px 6px',
    fontFamily: 'var(--mono)', fontSize: 9, fontWeight: 700,
    letterSpacing: '.16em', color: 'var(--text-muted)',
    textTransform: 'uppercase', flexShrink: 0,
  },
  list: {
    flex: 1, overflowY: 'auto',
    padding: '4px 8px 12px',
  },
  empty: {
    padding: '10px 8px',
    fontFamily: 'var(--mono)', fontSize: 11,
    color: 'var(--text-muted)',
  },
  item: (active) => ({
    padding: '9px 10px',
    borderRadius: 8,
    marginBottom: 2,
    display: 'flex', alignItems: 'flex-start', gap: 8,
    border:     `1px solid ${active ? 'var(--border)' : 'transparent'}`,
    background:  active ? 'var(--cyan-dim)' : 'transparent',
    cursor: 'pointer',
    transition: 'background .15s',
  }),
  itemText: (active) => ({
    fontSize: 12, lineHeight: 1.45,
    color:    active ? 'var(--text-primary)' : 'var(--text-secondary)',
    overflow: 'hidden',
    display:  '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  }),
  itemMeta: {
    fontFamily: 'var(--mono)', fontSize: 9,
    color: 'var(--text-muted)', marginTop: 3,
  },
  deleteBtn: {
    marginLeft: 'auto',
    background: 'transparent', border: 'none',
    color: 'var(--text-muted)', fontSize: 12,
    opacity: 0, transition: 'opacity .15s',
    padding: '0 2px', borderRadius: 4,
    flexShrink: 0,
  },
  footer: {
    padding: '12px 14px',
    borderTop: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', gap: 10,
    flexShrink: 0,
  },
  badgeLabel: {
    fontFamily: 'var(--mono)', fontSize: 9,
    color: 'var(--text-muted)',
    textTransform: 'uppercase', letterSpacing: '.1em',
  },
  badgeName: {
    fontFamily: 'var(--mono)', fontSize: 11,
    color: 'var(--cyan-bright)', marginTop: 2,
  },
}

const dotColor = (s) => {
  if (s === 'Positive') return { background: 'var(--green)', boxShadow: '0 0 5px var(--green)' }
  if (s === 'Negative') return { background: 'var(--red)',   boxShadow: '0 0 5px var(--red)' }
  if (!s)               return { background: 'var(--text-muted)' }
  return { background: 'var(--cyan)', boxShadow: '0 0 5px var(--cyan)' }
}

export default function Sidebar({ open, onToggle, onNew, history, activeId, onSelect, onDelete, connected }) {
  const itemRefs = useRef({})

  // Show delete button on hover via JS (cleaner than CSS modules)
  const handleMouseEnter = (id) => {
    if (itemRefs.current[id]) {
      const btn = itemRefs.current[id].querySelector('.del-btn')
      if (btn) btn.style.opacity = '1'
    }
  }
  const handleMouseLeave = (id) => {
    if (itemRefs.current[id]) {
      const btn = itemRefs.current[id].querySelector('.del-btn')
      if (btn) btn.style.opacity = '0'
    }
  }

  return (
    <aside style={S.sidebar(open)}>

      {/* Header */}
      <div style={S.header}>
        <div style={S.logo}>
          <div style={S.logoIcon}>TW</div>
          <div style={S.logoText}>
            Trend<span style={{ color: 'var(--cyan)' }}>Wise</span>
          </div>
        </div>
        <div style={S.actions}>
          <button style={S.iconBtn} onClick={onNew} title="New Analysis"
            onMouseEnter={e => { e.currentTarget.style.background='var(--bg-3)'; e.currentTarget.style.color='var(--cyan-bright)' }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-muted)' }}>
            ＋
          </button>
          <button style={S.iconBtn} onClick={onToggle} title="Close Sidebar"
            onMouseEnter={e => { e.currentTarget.style.background='var(--bg-3)'; e.currentTarget.style.color='var(--cyan-bright)' }}
            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-muted)' }}>
            ✕
          </button>
        </div>
      </div>

      {/* Section Label */}
      <div style={S.sectionLabel}>Recent Analyses</div>

      {/* History List */}
      <div style={S.list}>
        {history.length === 0
          ? <div style={S.empty}>No analyses yet</div>
          : history.map(h => (
            <div
              key={h._id}
              ref={el => itemRefs.current[h._id] = el}
              style={S.item(h._id === activeId)}
              onClick={() => onSelect(h)}
              onMouseEnter={() => handleMouseEnter(h._id)}
              onMouseLeave={() => handleMouseLeave(h._id)}
            >
              {/* Sentiment dot */}
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                flexShrink: 0, marginTop: 5,
                ...dotColor(h.sentiment?.label),
              }} />

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={S.itemText(h._id === activeId)}>
                  {h.text}
                </div>
                <div style={S.itemMeta}>
                  {h.topic || '—'} · {new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* Delete */}
              <button
                className="del-btn"
                style={S.deleteBtn}
                title="Delete"
                onClick={e => { e.stopPropagation(); onDelete(h._id) }}
              >🗑</button>
            </div>
          ))
        }
      </div>

      {/* Footer */}
      <div style={S.footer}>
        <div style={{ flex: 1 }}>
          <div style={S.badgeLabel}>Active Model</div>
          <div style={S.badgeName}>DistilBERT · Layer 1+2+3</div>
        </div>
        <div style={{
          width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
          ...(connected
            ? { background: 'var(--green)', boxShadow: '0 0 6px var(--green)', animation: 'pulse 2s infinite' }
            : { background: 'var(--text-muted)' }),
        }} />
      </div>

    </aside>
  )
}