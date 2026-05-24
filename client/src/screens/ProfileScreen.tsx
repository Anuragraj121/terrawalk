import { useEffect, useState } from 'react'
import { useAuthStore } from '../stores/authStore'

const API = import.meta.env.VITE_API_URL

interface Stats {
  username: string
  colour: string
  total_cells: number
  total_sessions: string
  total_distance_m: string
  total_claimed: string
  total_stolen: string
  created_at: string
}

export default function ProfileScreen() {
  const { user, token, logout } = useAuthStore()
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    if (!user || !token) return
    fetch(`${API}/users/${user.id}/stats`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((json) => { if (json.data) setStats(json.data) })
  }, [user, token])

  if (!stats) return <div className="h-full flex items-center justify-center pb-16 text-slate-400">Loading...</div>

  return (
    <div className="h-full pb-20 overflow-y-auto bg-slate-950">
      {/* Gradient header */}
      <div className="relative h-44 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600 flex flex-col items-center justify-end pb-14">
        <div className="absolute -bottom-10 w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-xl ring-4 ring-slate-950"
          style={{ backgroundColor: stats.colour }}>
          {stats.username[0].toUpperCase()}
        </div>
      </div>

      <div className="px-6 pt-14 max-w-sm mx-auto">
        <h1 className="text-xl font-black text-white text-center">{stats.username}</h1>
        <p className="text-slate-400 text-sm text-center mt-1">
          Member since {new Date(stats.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
        </p>

        {/* Territory highlight */}
        <div className="mt-6 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-5 text-center">
          <div className="text-4xl font-black text-emerald-400">{stats.total_cells}</div>
          <div className="text-sm text-slate-400 mt-1">Total Territory (km²)</div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <StatCard icon="🏃" label="Sessions" value={stats.total_sessions} />
          <StatCard icon="📏" label="Distance" value={`${(Number(stats.total_distance_m) / 1000).toFixed(1)} km`} />
          <StatCard icon="🟩" label="Claimed" value={stats.total_claimed} />
          <StatCard icon="⚔️" label="Stolen" value={stats.total_stolen} />
        </div>

        {/* Logout */}
        <button onClick={logout}
          className="w-full mt-8 py-3.5 rounded-xl bg-slate-800 border border-slate-700/50 text-slate-300 font-medium hover:bg-slate-700 transition active:scale-[0.98]">
          Sign Out
        </button>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="bg-slate-800/60 border border-slate-700/30 rounded-xl p-4 text-center">
      <div className="text-lg mb-1">{icon}</div>
      <div className="text-lg font-bold text-white">{value}</div>
      <div className="text-[11px] text-slate-400 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  )
}
