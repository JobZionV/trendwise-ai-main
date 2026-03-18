import { useState, useEffect, useCallback } from 'react'
import Background from './components/Background'
import Sidebar from './components/Sidebar'
import TopBar from './components/TopBar'
import Welcome from './components/Welcome'
import InputBar from './components/InputBar'
import AnalysisResult, { LoadingResult, ErrorResult } from './components/AnalysisResult'
import { analyzeText, fetchHistory, deleteHistory, checkHealth } from './api'

// Loading step count — matches STEPS array in AnalysisResult
const TOTAL_STEPS = 6

export default function App() {
  // ── State ──────────────────────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [history, setHistory] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [inputText, setInputText] = useState('')
  const [connected, setConnected] = useState(false)

  // view: 'welcome' | 'loading' | 'result' | 'error'
  const [view, setView] = useState('welcome')
  const [currentText, setCurrentText] = useState('')   // text being/being-analyzed
  const [loadingStep, setLoadingStep] = useState(0)
  const [resultData, setResultData] = useState(null)

  // ── Health check on mount + every 30s ─────────────────────
  useEffect(() => {
    const check = async () => setConnected(await checkHealth())
    check()
    const id = setInterval(check, 30_000)
    return () => clearInterval(id)
  }, [])

  // ── Load history from MongoDB on mount ─────────────────────
  useEffect(() => {
    fetchHistory()
      .then(data => setHistory(data))
      .catch(() => { })   // silently fail if backend not connected
  }, [])

  // ── Step animator ──────────────────────────────────────────
  const animateSteps = useCallback(() => {
    setLoadingStep(0)
    let s = 0
    const iv = setInterval(() => {
      s++
      setLoadingStep(s)
      if (s >= TOTAL_STEPS) clearInterval(iv)
    }, 400)
    return () => clearInterval(iv)
  }, [])

  // ── Submit handler ─────────────────────────────────────────
  const handleSubmit = useCallback(async (text) => {
    setCurrentText(text)
    setView('loading')
    setInputText('')
    setActiveId(null)
    const stop = animateSteps()

    try {
      const data = await analyzeText(text)

      // Normalise shape
      const result = {
        _id: data._id,
        original_input: data.signals.original_input,
        sentiment: data.signals.sentiment,
        topics: data.signals.topics,
        entities: data.signals.entities,
        evidence: data.evidence,
        synthesis: data.synthesis,
        text: data.signals.original_input.slice(0, 80),
        topic: data.signals.topics[0],
        created_at: data.created_at || new Date().toISOString(),
      }

      setResultData(result)
      setActiveId(result._id)
      setView('result')

      // Prepend to sidebar history
      setHistory(prev => [result, ...prev.filter(h => h._id !== result._id)])

    } catch {
      stop()
      setView('error')
    }
  }, [animateSteps])

  // // ── Load history item ──────────────────────────────────────
  // const handleSelect = (item) => {
  //   setActiveId(item._id)
  //   setResultData(item)
  //   setCurrentText(item.original_input || item.text)
  //   setView('result')
  // }
  // ── Load history item ──────────────────────────────────────
  const handleSelect = (item) => {
    // Normalize the history item to match the shape AnalysisResult expects
    const normalizedItem = {
      _id: item._id,
      original_input: item.signals?.original_input || item.text,
      sentiment: item.signals?.sentiment || item.sentiment,
      topics: item.signals?.topics || [item.topic],
      entities: item.signals?.entities || [],
      evidence: item.evidence || [],
      synthesis: item.synthesis || '',
      text: item.text,
      topic: item.topic,
      created_at: item.created_at,
    };

    setActiveId(normalizedItem._id)
    setResultData(normalizedItem)
    setCurrentText(normalizedItem.original_input)
    setView('result')
  }


  // ── Delete history item ────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await deleteHistory(id)
    } catch { }
    setHistory(prev => prev.filter(h => h._id !== id))
    if (activeId === id) {
      setActiveId(null)
      setView('welcome')
    }
  }

  // ── New analysis ───────────────────────────────────────────
  const handleNew = () => {
    setActiveId(null)
    setView('welcome')
    setInputText('')
  }

  // ── Example click ──────────────────────────────────────────
  const handleExample = (text) => {
    setInputText(text)
    handleSubmit(text)
  }

  // ── Render content area ────────────────────────────────────
  const renderContent = () => {
    switch (view) {
      case 'welcome': return <Welcome onExample={handleExample} />
      case 'loading': return <LoadingResult text={currentText} step={loadingStep} />
      case 'result': return resultData ? <AnalysisResult data={resultData} /> : <Welcome onExample={handleExample} />
      case 'error': return <ErrorResult text={currentText} />
      default: return <Welcome onExample={handleExample} />
    }
  }

  // ── Layout ─────────────────────────────────────────────────
  return (
    <>
      <Background />

      {/* Floating toggle when sidebar is closed */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          title="Open Sidebar"
          style={{
            position: 'fixed', top: 14, left: 14, zIndex: 200,
            width: 36, height: 36,
            background: 'var(--bg-2)',
            border: '1px solid var(--border)',
            borderRadius: 9,
            color: 'var(--text-secondary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
            transition: 'background .2s, box-shadow .2s',
            boxShadow: '0 0 10px rgba(99,179,237,.1)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-3)'; e.currentTarget.style.boxShadow = '0 0 14px rgba(99,179,237,.25)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-2)'; e.currentTarget.style.boxShadow = '0 0 10px rgba(99,179,237,.1)' }}
        >
          ☰
        </button>
      )}

      <div style={{ display: 'flex', height: '100vh', position: 'relative', zIndex: 1 }}>

        {/* Sidebar */}
        <Sidebar
          open={sidebarOpen}
          onToggle={() => setSidebarOpen(v => !v)}
          onNew={handleNew}
          history={history}
          activeId={activeId}
          onSelect={handleSelect}
          onDelete={handleDelete}
          connected={connected}
        />

        {/* Main */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          overflow: 'hidden', minWidth: 0,
          background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99,179,237,.05) 0%, transparent 65%)',
        }}>
          <TopBar
            onToggle={() => setSidebarOpen(v => !v)}
            connected={connected}
          />

          {/* Content */}
          <div style={{
            flex: 1, overflowY: 'auto',
            padding: '28px 36px',
            display: 'flex', flexDirection: 'column',
            gap: 24,
          }}>
            {renderContent()}
          </div>

          {/* Input */}
          <InputBar
            value={inputText}
            onChange={setInputText}
            onSubmit={handleSubmit}
            disabled={view === 'loading'}
          />
        </div>

      </div>
    </>
  )
}