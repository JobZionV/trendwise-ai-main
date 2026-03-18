// ============================================================
// src/api.js  —  all backend calls live here
// 🔧 If you're NOT using Vite proxy, set the full URL:
//    export const API_BASE = "https://your-ngrok-url.ngrok-free.app"
// If using Vite dev server (npm run dev), leave it as empty string
// ============================================================
const API_BASE = ''

// ── Analyze text (Layers 1 + 2 + 3) ──────────────────────────
export async function analyzeText(text) {
  const res = await fetch(`${API_BASE}/api/analyze`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ text }),
  })
  if (!res.ok) throw new Error(`Server ${res.status}`)
  return res.json()
}

// ── Fetch full history from MongoDB ─────────────────────────
export async function fetchHistory() {
  const res = await fetch(`${API_BASE}/api/history`)
  if (!res.ok) throw new Error(`History fetch failed ${res.status}`)
  return res.json()   // returns array of analysis documents
}

// ── Delete one history item ──────────────────────────────────
export async function deleteHistory(id) {
  const res = await fetch(`${API_BASE}/api/history/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`Delete failed ${res.status}`)
  return res.json()
}

// ── Health check ─────────────────────────────────────────────
export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/api/health`, { signal: AbortSignal.timeout(4000) })
    return res.ok
  } catch {
    return false
  }
}