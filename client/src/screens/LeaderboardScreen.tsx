import { useEffect, useState } from 'react'
import { useAuthStore } from '../stores/authStore'

const API = import.meta.env.VITE_API_URL

interface LeaderEntry {
  id: string
  username: string
  colour: string
  total_cells: number
}

export default function LeaderboardScreen() {
  const { user } = useAuthStore()
  const [entries, setEntries] = useState<LeaderEntry[]>([])

  useEffect(() => {
    const load = () => {
      fetch(`${API}/leaderboard`).then((r) => r.json()).then((json) => {
        if (json.data) setEntries(json.data)
      })
    }
    load()
    const interval = setInterval(load, 60000)
    return () => clearInterval(interval)
  }, [])

  const top3 = entries.slice(0, 3)
  const rest = entries.slice(3)

  return (
    <div className="h-full pb-20 overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-950">
      <div className="px-4 pt-6">
        <h1 className="text-2xl font-black text-center text-white">Leaderboard</h1>
        <p className="text-center text-slate-400 text-sm mt-1">Top territory holders</p>
      </div>

      {/* Podium */}
      {top3.length > 0 && (
        <div className="flex items-end justify-center gap-3 px-4 mt-6 mb-6">
          {/* 2nd place */}
          {top3[1] && (
            <PodiumCard rank={2} entry={top3[1]} isMe={top3[1].id === user?.id} height="h-24" />
          )}
          {/* 1st place */}
          {top3[0] && (
            <PodiumCard rank={1} entry={top3[0]} isMe={top3[0].id === user?.id} height="h-32" />
          )}
          {/* 3rd place */}
          {top3[2] && (
            <PodiumCard rank={3} entry={top3[2]} isMe={top3[2].id === user?.id} height="h-20" />
          )}
        </div>
      )}

      {/* Rest of list */}
      <div className="px-4 space-y-2">
        {rest.map((entry, i) => (
          <div
            key={entry.id}
            className={`flex items-center gap-3 p-3.5 rounded-xl transition ${
              entry.id === user?.id
                ? 'bg-emerald-500/10 border border-emerald-500/30'
                : 'bg-slate-800/60 border border-slate-700/30'
            }`}
          >
            <span className="w-8 text-center text-sm font-bold text-slate-500">{i + 4}</span>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-inner"
              style={{ backgroundColor: entry.colour }}>
              {entry.username[0].toUpperCase()}
            </div>
            <span className="flex-1 font-semibold text-white truncate">{entry.username}</span>
            <div className="text-right">
              <span className="text-emerald-400 font-bold">{entry.total_cells}</span>
              <span className="text-slate-500 text-xs ml-1">km²</span>
            </div>
          </div>
        ))}
        {entries.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p className="text-4xl mb-2">🏃</p>
            <p>No players yet. Be the first!</p>
          </div>
        )}
      </div>
    </div>
  )
}

function PodiumCard({ rank, entry, isMe, height }: { rank: number; entry: LeaderEntry; isMe: boolean; height: string }) {
  const medals = ['🥇', '🥈', '🥉']
  return (
    <div className={`flex-1 flex flex-col items-center`}>
      <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white mb-2 ring-2 ring-offset-2 ring-offset-slate-900 shadow-lg"
        style={{ backgroundColor: entry.colour }}>
        {entry.username[0].toUpperCase()}
      </div>
      <span className="text-xs font-semibold text-white truncate max-w-full">{entry.username}</span>
      <span className="text-[10px] text-emerald-400 font-bold">{entry.total_cells} km²</span>
      <div className={`w-full ${height} mt-2 rounded-t-xl flex items-start justify-center pt-2 ${
        rank === 1 ? 'bg-gradient-to-b from-yellow-500/30 to-yellow-600/10 border border-yellow-500/30' :
        rank === 2 ? 'bg-gradient-to-b from-slate-400/20 to-slate-500/10 border border-slate-400/30' :
        'bg-gradient-to-b from-amber-700/20 to-amber-800/10 border border-amber-700/30'
      }`}>
        <span className="text-2xl">{medals[rank - 1]}</span>
      </div>
    </div>
  )
}
