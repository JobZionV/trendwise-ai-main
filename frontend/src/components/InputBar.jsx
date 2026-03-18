import { useRef } from 'react'

const S = {
  area: {
    padding: '12px 24px 16px',
    flexShrink: 0,
    borderTop: '1px solid var(--border)',
    background: 'rgba(7,11,20,.82)',
    backdropFilter: 'blur(12px)',
  },
  wrapper: {
    display: 'flex', gap: 10, alignItems: 'flex-end',
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 13,
    padding: '10px 12px',
    transition: 'border-color .2s, box-shadow .2s',
  },
  textarea: {
    flex: 1,
    background: 'transparent',
    border: 'none', outline: 'none',
    color: 'var(--text-primary)',
    fontSize: 14, lineHeight: 1.6,
    resize: 'none',
    minHeight: 22, maxHeight: 130,
    caretColor: 'var(--cyan)',
  },
  actions: { display: 'flex', alignItems: 'center', gap: 8 },
  charCount: {
    fontFamily: 'var(--mono)', fontSize: 10,
    color: 'var(--text-muted)',
  },
  sendBtn: (disabled) => ({
    width: 34, height: 34,
    background:    disabled ? 'var(--bg-3)' : 'linear-gradient(135deg, var(--cyan), #4299e1)',
    border: 'none', borderRadius: 9,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--bg-0)',
    opacity: disabled ? 0.45 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    boxShadow: disabled ? 'none' : '0 0 10px rgba(99,179,237,.28)',
    flexShrink: 0,
    transition: 'transform .18s, box-shadow .18s',
    fontSize: 14,
  }),
  hint: {
    display: 'flex', alignItems: 'center', gap: 14,
    marginTop: 7, padding: '0 2px',
  },
  hintItem: {
    fontFamily: 'var(--mono)', fontSize: 10,
    color: 'var(--text-muted)',
    display: 'flex', alignItems: 'center', gap: 5,
  },
}

export default function InputBar({ onSubmit, disabled, value, onChange }) {
  const wrapRef   = useRef(null)
  const textaRef  = useRef(null)

  const handleInput = (e) => {
    const ta = e.target
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 130) + 'px'
    onChange(ta.value)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
  }

  const submit = () => {
    if (!disabled && value.trim()) {
      onSubmit(value.trim())
      if (textaRef.current) {
        textaRef.current.style.height = 'auto'
      }
    }
  }

  return (
    <div style={S.area}>
      <div
        ref={wrapRef}
        style={S.wrapper}
        onFocus={() => { wrapRef.current.style.borderColor = 'rgba(99,179,237,.48)'; wrapRef.current.style.boxShadow = '0 0 0 3px rgba(99,179,237,.07)' }}
        onBlur={() =>  { wrapRef.current.style.borderColor = 'var(--border)'; wrapRef.current.style.boxShadow = 'none' }}
      >
        <textarea
          ref={textaRef}
          rows={1}
          value={value}
          style={S.textarea}
          placeholder="Paste a tweet, headline, or any text to analyze..."
          onChange={handleInput}
          onKeyDown={handleKey}
        />
        <div style={S.actions}>
          <span style={S.charCount}>{value.length}</span>
          <button
            style={S.sendBtn(disabled || !value.trim())}
            onClick={submit}
            disabled={disabled || !value.trim()}
            title="Analyze"
          >
            ➤
          </button>
        </div>
      </div>
      <div style={S.hint}>
        <span style={S.hintItem}><kbd>Enter</kbd> to analyze</span>
        <span style={S.hintItem}><kbd>Shift+Enter</kbd> for new line</span>
      </div>
    </div>
  )
}