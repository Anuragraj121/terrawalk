import { useState, useEffect, useCallback } from 'react'
import LeafletMap from '../components/LeafletMap'
import SessionSummaryModal from '../components/SessionSummaryModal'
import CreatePostModal from '../components/CreatePostModal'
import { useLocationStore } from '../stores/locationStore'
import { useAuthStore } from '../stores/authStore'
import { connectSocket, getSocket, disconnectSocket } from '../utils/socket'
import { getCellKey, getCellPolygon } from '../utils/grid'

const API = import.meta.env.VITE_API_URL

interface TerritoryCell {
  cell_key: string
  colour: string
  polygon: [number, number][]
}

export default function MapScreen() {
  const { lat, lng, watching, start } = useLocationStore()
  const { token, user } = useAuthStore()
  const [sessionActive, setSessionActive] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [cells, setCells] = useState<TerritoryCell[]>([])
  const [claimedCount, setClaimedCount] = useState(0)
  const [summary, setSummary] = useState<any>(null)
  const [showPost, setShowPost] = useState(false)
  const [lastSessionId, setLastSessionId] = useState<string | null>(null)

  useEffect(() => { start() }, [start])

  useEffect(() => {
    if (!token) return
    const sock = connectSocket(token)
    sock.on('cell-claimed', (data: any) => {
      setCells((prev) => {
        if (prev.some((c) => c.cell_key === data.cell_key)) return prev
        return [...prev, { cell_key: data.cell_key, colour: data.colour, polygon: getCellPolygon(data.lat, data.lng) }]
      })
    })
    sock.on('cell-stolen', (data: any) => {
      setCells((prev) => prev.map((c) => c.cell_key === data.cell_key ? { ...c, colour: data.colour } : c))
    })
    return () => { disconnectSocket() }
  }, [token])

  useEffect(() => {
    if (!sessionActive || lat === null || lng === null) return
    const sock = getSocket()
    if (sock) sock.emit('location-update', { lat, lng })
  }, [lat, lng, sessionActive])

  const toggle = useCallback(async () => {
    if (sessionActive) {
      getSocket()?.emit('session-end')
      if (sessionId && token) {
        try {
          const res = await fetch(`${API}/sessions/end/${sessionId}`, {
            method: 'POST', headers: { Authorization: `Bearer ${token}` },
          })
          const json = await res.json()
          if (json.data) setSummary(json.data)
          setLastSessionId(sessionId)
        } catch (e) { console.error(e) }
      }
      setSessionActive(false)
      setSessionId(null)
    } else {
      if (!watching) start()
      if (!token) return
      try {
        const res = await fetch(`${API}/sessions/start`, {
          method: 'POST', headers: { Authorization: `Bearer ${token}` },
        })
        const json = await res.json()
        if (json.error) {
          if (json.error.code === 'UNAUTHORIZED') {
            localStorage.removeItem('token')
            window.location.reload()
          }
          return
        }
        const id = json.data.id
        setSessionId(id)
        setSessionActive(true)
        setClaimedCount(0)
        getSocket()?.emit('session-start', id)
      } catch (e) {
        console.error('Failed to start session', e)
      }
    }
  }, [sessionActive, watching, start, token, sessionId])

  useEffect(() => {
    if (!token || !user) return
    const sock = getSocket()
    if (!sock) return
    const handler = (data: any) => {
      if (data.owner_id === user.id) setClaimedCount((c) => c + 1)
    }
    sock.on('cell-claimed', handler)
    sock.on('cell-stolen', handler)
    return () => { sock.off('cell-claimed', handler); sock.off('cell-stolen', handler) }
  }, [token, user])

  return (
    <div className="relative h-full">
      <LeafletMap cells={cells} />

      {/* Active session stats panel */}
      {sessionActive && (
        <div className="absolute top-4 left-4 right-16 z-[1000]">
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl px-4 py-3 border border-slate-700/50 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">Live Session</span>
            </div>
            <div className="flex gap-4 mt-2">
              <div>
                <div className="text-2xl font-black text-white">{claimedCount}</div>
                <div className="text-[10px] text-slate-400 uppercase">Cells</div>
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-400">{claimedCount} km²</div>
                <div className="text-[10px] text-slate-400 uppercase">Territory</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Locate button */}
      <button
        onClick={() => {
          if (lat !== null && lng !== null) {
            const leafletMap = (window as any)._terrawalkMap
            if (leafletMap) leafletMap.setView([lat, lng], 17)
          }
        }}
        className="absolute top-4 right-4 z-[1000] bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl w-11 h-11 flex items-center justify-center shadow-xl active:scale-95 transition"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-400">
          <circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4m10-10h-4M6 12H2"/>
        </svg>
      </button>

      {/* Start/Stop button */}
      {token && (
        <div className="absolute bottom-20 left-0 right-0 flex justify-center z-[1000]">
          <button
            onClick={toggle}
            className={`group relative px-8 py-4 rounded-2xl font-bold text-white shadow-2xl transition-all active:scale-95 ${
              sessionActive
                ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/25'
                : 'bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-emerald-500/30'
            }`}
          >
            {sessionActive ? (
              <span className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
                End Walk
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
                Start Walk
              </span>
            )}
          </button>
        </div>
      )}

      {summary && <SessionSummaryModal summary={summary} onClose={() => { setSummary(null); setShowPost(true) }} />}

      {showPost && lastSessionId && summary && (
        <CreatePostModal
          sessionId={lastSessionId}
          stats={{ cells_claimed: summary.cells_claimed, distance_m: summary.distance_m, duration_s: summary.duration_s }}
          onDone={() => setShowPost(false)}
          onSkip={() => setShowPost(false)}
        />
      )}
    </div>
  )
}
