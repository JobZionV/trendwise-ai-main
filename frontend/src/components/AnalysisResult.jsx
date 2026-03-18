import ReactMarkdown from 'react-markdown'

/* ── Helpers ── */
const sentimentStyle = (s) => {
  if (s === 'Positive') return { color: 'var(--green)', textShadow: '0 0 16px rgba(104,211,145,.45)' }
  if (s === 'Negative') return { color: 'var(--red)',   textShadow: '0 0 16px rgba(252,129,129,.45)' }
  return                       { color: 'var(--cyan)',  textShadow: '0 0 16px rgba(99,179,237,.45)' }
}
const fillColor = (s) => {
  if (s === 'Positive') return 'linear-gradient(90deg, var(--green), #9ae6b4)'
  if (s === 'Negative') return 'linear-gradient(90deg, var(--red), #feb2b2)'
  return 'linear-gradient(90deg, var(--cyan), var(--cyan-bright))'
}
const sourceStyle = (src) => {
  if (src === 'NewsAPI') return { background:'var(--cyan-dim)',   color:'var(--cyan)',   border:'1px solid rgba(99,179,237,.22)' }
  if (src === 'Reddit')  return { background:'var(--amber-dim)',  color:'var(--amber)',  border:'1px solid rgba(246,173,85,.22)' }
  return                        { background:'var(--purple-dim)', color:'var(--purple)', border:'1px solid rgba(196,181,253,.22)' }
}

/* ── Shared card style ── */
const card = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 13,
  backdropFilter: 'blur(8px)',
  overflow: 'hidden',
}

/* ── Sub-components ── */
function QueryBubble({ text }) {
  return (
    <div style={{ display:'flex', justifyContent:'flex-end', marginBottom: 18 }}>
      <div style={{
        maxWidth: '68%',
        background: 'linear-gradient(135deg,#1e3a5f,#1a2e4a)',
        border: '1px solid rgba(99,179,237,.22)',
        borderRadius: '16px 16px 4px 16px',
        padding: '12px 16px',
        fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6,
        boxShadow: '0 4px 20px rgba(0,0,0,.28)',
        wordBreak: 'break-word',
      }}>
        {text}
      </div>
    </div>
  )
}

function Avatar() {
  return (
    <div style={{
      width: 34, height: 34,
      background: 'linear-gradient(135deg, var(--cyan), #4299e1)',
      borderRadius: 9,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700,
      color: 'var(--bg-0)', flexShrink: 0,
      boxShadow: '0 0 12px rgba(99,179,237,.28)',
    }}>TW</div>
  )
}

/* ── Loading state ── */
const STEPS = [
  'Layer 1 · Preprocessing & tokenization',
  'Sentiment model inference (DistilBERT)',
  'Topic classification & entity extraction',
  'Layer 2 · NewsAPI + Reddit + VectorDB retrieval',
  'Cross-encoder reranking',
  'Layer 3 · Synthesis',
]

export function LoadingResult({ text, step }) {
  return (
    <div style={{ animation: 'slideUp .38s ease' }}>
      <QueryBubble text={text} />
      <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
        <Avatar />
        <div style={{
          ...card, flex:1,
          display:'flex', alignItems:'flex-start', gap:14,
          padding: '18px 20px',
        }}>
          <div style={{
            width:18, height:18, flexShrink:0, marginTop:2,
            border:'2px solid var(--bg-3)',
            borderTopColor:'var(--cyan)',
            borderRadius:'50%',
            animation:'spin .75s linear infinite',
          }} />
          <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{
                fontFamily: 'var(--mono)', fontSize: 11,
                color: i < step ? 'var(--green)' : i === step ? 'var(--cyan)' : 'var(--text-muted)',
                transition: 'color .25s',
              }}>
                {i < step ? '✓' : i === step ? '▸' : '◦'} {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Error state ── */
export function ErrorResult({ text }) {
  return (
    <div style={{ animation: 'slideUp .35s ease' }}>
      <QueryBubble text={text} />
      <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
        <Avatar />
        <div style={{
          ...card, flex:1,
          border:'1px solid rgba(252,129,129,.22)',
          display:'flex', gap:14, alignItems:'flex-start',
          padding:'20px 22px',
        }}>
          <div style={{
            width:34, height:34,
            background:'var(--red-dim)',
            border:'1px solid rgba(252,129,129,.28)',
            borderRadius:9,
            display:'flex', alignItems:'center', justifyContent:'center',
            flexShrink:0, fontSize:16,
          }}>⚠</div>
          <div>
            <div style={{ fontFamily:'var(--mono)', fontSize:13, fontWeight:700, color:'var(--red)', marginBottom:6 }}>
              Model Backend Not Connected
            </div>
            <div style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.7 }}>
              Set <code style={{ fontFamily:'var(--mono)', fontSize:11, background:'var(--bg-3)', border:'1px solid var(--border)', padding:'1px 7px', borderRadius:4, color:'var(--cyan-bright)' }}>API_URL</code> in <code style={{ fontFamily:'var(--mono)', fontSize:11, background:'var(--bg-3)', border:'1px solid var(--border)', padding:'1px 7px', borderRadius:4, color:'var(--cyan-bright)' }}>src/api.js</code> to your FastAPI server.
              <br /><br />
              Then run: <code style={{ fontFamily:'var(--mono)', fontSize:11, background:'var(--bg-3)', border:'1px solid var(--border)', padding:'1px 7px', borderRadius:4, color:'var(--cyan-bright)' }}>uvicorn app:app --host 0.0.0.0 --port 8000</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Signal cards ── */
function SignalCards({ data }) {
  const pct = Math.round(data.sentiment.confidence_score * 100)
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12 }}>

      {/* Sentiment */}
      <div style={{ ...card, padding:'13px 15px' }}>
        <div style={{ fontFamily:'var(--mono)', fontSize:9, fontWeight:700, letterSpacing:'.15em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:8 }}>
          Sentiment
        </div>
        <div style={{ fontFamily:'var(--mono)', fontSize:17, fontWeight:700, ...sentimentStyle(data.sentiment.label) }}>
          {data.sentiment.label}
        </div>
        <div style={{ height:3, background:'var(--bg-3)', borderRadius:2, overflow:'hidden', marginTop:8 }}>
          <div style={{
            height:'100%', borderRadius:2,
            background: fillColor(data.sentiment.label),
            width: pct + '%',
            transition: 'width .9s cubic-bezier(.4,0,.2,1)',
          }} />
        </div>
        <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--text-muted)', marginTop:4 }}>
          {pct}% confidence
        </div>
      </div>

      {/* Topic */}
      <div style={{ ...card, padding:'13px 15px' }}>
        <div style={{ fontFamily:'var(--mono)', fontSize:9, fontWeight:700, letterSpacing:'.15em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:8 }}>
          Topic
        </div>
        <span style={{
          display:'inline-flex', alignItems:'center',
          padding:'4px 12px',
          background:'var(--amber-dim)', border:'1px solid rgba(246,173,85,.28)',
          borderRadius:20,
          fontFamily:'var(--mono)', fontSize:13, fontWeight:700, color:'var(--amber)',
          marginTop:2,
        }}>
          {data.topics[0]}
        </span>
      </div>

      {/* Entities */}
      <div style={{ ...card, padding:'13px 15px' }}>
        <div style={{ fontFamily:'var(--mono)', fontSize:9, fontWeight:700, letterSpacing:'.15em', textTransform:'uppercase', color:'var(--text-muted)', marginBottom:8 }}>
          Entities
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:4 }}>
          {data.entities.length
            ? data.entities.map(e => (
                <span key={e} style={{
                  padding:'3px 9px',
                  background:'var(--purple-dim)', border:'1px solid rgba(196,181,253,.28)',
                  borderRadius:6,
                  fontFamily:'var(--mono)', fontSize:11, color:'var(--purple)',
                }}>{e}</span>
              ))
            : <span style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--text-muted)' }}>None detected</span>
          }
        </div>
      </div>
    </div>
  )
}

/* ── Evidence section ── */
function EvidenceSection({ evidence }) {
  return (
    <div style={card}>
      <div style={{
        display:'flex', alignItems:'center', gap:10,
        padding:'12px 16px', borderBottom:'1px solid var(--border)',
        background:'rgba(255,255,255,.018)',
      }}>
        <div style={{ fontFamily:'var(--mono)', fontSize:10, fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase', color:'var(--text-secondary)', flex:1 }}>
          ⚡ Evidence Retrieval · Layer 2
        </div>
        <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--text-muted)' }}>
          {evidence.length} sources · reranked
        </div>
      </div>
      {evidence.length === 0
        ? <div style={{ padding:'14px 16px', fontSize:13, color:'var(--text-muted)' }}>No evidence retrieved.</div>
        : evidence.map((ev, i) => (
            <div key={i} style={{
              padding:'13px 16px', display:'flex', gap:12, alignItems:'flex-start',
              borderBottom: i < evidence.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <span style={{
                flexShrink:0, padding:'3px 8px', borderRadius:5,
                fontFamily:'var(--mono)', fontSize:9, fontWeight:700,
                letterSpacing:'.07em', textTransform:'uppercase',
                marginTop:2, ...sourceStyle(ev.source),
              }}>
                {ev.source}
              </span>
              <div style={{ flex:1, fontSize:13, color:'var(--text-secondary)', lineHeight:1.55, wordBreak:'break-word' }}>
                {ev.content}
              </div>
              <div style={{ flexShrink:0, fontFamily:'var(--mono)', fontSize:10, color:'var(--text-muted)', textAlign:'right', whiteSpace:'nowrap' }}>
                #{i + 1}
                {ev.rerank_score != null && (
                  <span style={{ display:'block', fontSize:12, color:'var(--cyan)', fontWeight:700 }}>
                    {Number(ev.rerank_score).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          ))
      }
    </div>
  )
}

/* ── Synthesis section ── */
function SynthesisSection({ synthesis }) {
  if (!synthesis) return null
  return (
    <div style={{ ...card, borderColor:'rgba(196,181,253,.2)' }}>
      <div style={{
        display:'flex', alignItems:'center', gap:10,
        padding:'12px 16px', borderBottom:'1px solid rgba(196,181,253,.15)',
        background:'rgba(128,90,213,.06)',
      }}>
        <div style={{ fontFamily:'var(--mono)', fontSize:10, fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase', color:'var(--purple)', flex:1 }}>
          ✦ Synthesis · Layer 3
        </div>
      </div>
      <div style={{ padding:'16px 18px', fontSize:13.5, color:'var(--text-secondary)', lineHeight:1.8 }}>
        <ReactMarkdown
          components={{
            strong: ({ children }) => (
              <strong style={{ color:'var(--text-primary)', fontWeight:600 }}>{children}</strong>
            ),
            p: ({ children }) => <p style={{ marginBottom:10 }}>{children}</p>,
          }}
        >
          {synthesis}
        </ReactMarkdown>
      </div>
    </div>
  )
}

/* ── Main result ── */
export default function AnalysisResult({ data }) {
  return (
    <div style={{ animation:'slideUp .38s ease' }}>
      <QueryBubble text={data.original_input} />
      <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
        <Avatar />
        <div style={{ flex:1, display:'flex', flexDirection:'column', gap:14, minWidth:0 }}>
          <SignalCards data={data} />
          <EvidenceSection evidence={data.evidence} />
          <SynthesisSection synthesis={data.synthesis} />
        </div>
      </div>
    </div>
  )
}