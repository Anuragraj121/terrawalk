interface Summary {
  duration_s: number
  cells_claimed: number
  cells_stolen: number
  cells_lost: number
  distance_m: number
}

export default function SessionSummaryModal({ summary, onClose }: { summary: Summary; onClose: () => void }) {
  const mins = Math.floor(summary.duration_s / 60)
  const secs = Math.floor(summary.duration_s % 60)

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-6 w-full max-w-sm border border-slate-700/50 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-3 animate-bounce">🎉</div>
          <h2 className="text-2xl font-black text-white">Walk Complete!</h2>
          <p className="text-slate-400 text-sm mt-1">Great effort out there</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatBox icon="⏱" label="Duration" value={`${mins}m ${secs}s`} />
          <StatBox icon="📏" label="Distance" value={`${(summary.distance_m / 1000).toFixed(2)} km`} />
          <StatBox icon="🟩" label="Claimed" value={String(summary.cells_claimed)} highlight />
          <StatBox icon="⚔️" label="Stolen" value={String(summary.cells_stolen)} />
        </div>

        {/* Close button */}
        <button onClick={onClose}
          className="w-full mt-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 font-bold text-white shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition">
          Continue
        </button>
      </div>
    </div>
  )
}

function StatBox({ icon, label, value, highlight }: { icon: string; label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-4 text-center ${highlight ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-slate-700/30 border border-slate-700/50'}`}>
      <div className="text-lg">{icon}</div>
      <div className={`text-xl font-bold mt-1 ${highlight ? 'text-emerald-400' : 'text-white'}`}>{value}</div>
      <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  )
}
