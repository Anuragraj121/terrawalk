import { useState, useRef } from 'react'
import { useAuthStore } from '../stores/authStore'

const API = import.meta.env.VITE_API_URL

interface Props {
  sessionId: string
  stats: { cells_claimed: number; distance_m: number; duration_s: number }
  onDone: () => void
  onSkip: () => void
}

export default function CreatePostModal({ sessionId, stats, onDone, onSkip }: Props) {
  const { token } = useAuthStore()
  const [caption, setCaption] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handlePost = async () => {
    setPosting(true)
    const form = new FormData()
    form.append('session_id', sessionId)
    form.append('caption', caption)
    form.append('cells_claimed', String(stats.cells_claimed))
    form.append('distance_m', String(stats.distance_m))
    form.append('duration_s', String(stats.duration_s))
    if (photo) form.append('photo', photo)

    await fetch(`${API}/posts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    })
    setPosting(false)
    onDone()
  }

  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 rounded-t-3xl w-full max-w-lg p-6 border-t border-slate-700/50 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Share your walk</h2>
          <button onClick={onSkip} className="text-slate-400 text-sm">Skip</button>
        </div>

        {/* Stats preview */}
        <div className="flex gap-3 mb-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 text-center flex-1">
            <div className="text-lg font-bold text-emerald-400">{stats.cells_claimed}</div>
            <div className="text-[10px] text-slate-400">CELLS</div>
          </div>
          <div className="bg-slate-800 border border-slate-700/50 rounded-xl px-3 py-2 text-center flex-1">
            <div className="text-lg font-bold text-white">{(stats.distance_m / 1000).toFixed(2)}</div>
            <div className="text-[10px] text-slate-400">KM</div>
          </div>
          <div className="bg-slate-800 border border-slate-700/50 rounded-xl px-3 py-2 text-center flex-1">
            <div className="text-lg font-bold text-white">{Math.floor(stats.duration_s / 60)}m</div>
            <div className="text-[10px] text-slate-400">TIME</div>
          </div>
        </div>

        {/* Photo upload */}
        <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
        {preview ? (
          <div className="relative mb-4">
            <img src={preview} alt="" className="w-full aspect-[4/3] object-cover rounded-xl" />
            <button onClick={() => { setPhoto(null); setPreview(null) }}
              className="absolute top-2 right-2 bg-black/60 rounded-full w-7 h-7 flex items-center justify-center text-white text-sm">✕</button>
          </div>
        ) : (
          <button onClick={() => fileRef.current?.click()}
            className="w-full mb-4 py-8 rounded-xl border-2 border-dashed border-slate-700 text-slate-400 flex flex-col items-center gap-2 active:bg-slate-800 transition">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/>
            </svg>
            <span className="text-sm">Add a photo</span>
          </button>
        )}

        {/* Caption */}
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="How was your walk? 🏃"
          className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700/50 text-white placeholder-slate-500 resize-none h-20 focus:outline-none focus:border-emerald-500 transition mb-4"
        />

        {/* Post button */}
        <button onClick={handlePost} disabled={posting}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 font-bold text-white shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition disabled:opacity-50">
          {posting ? 'Posting...' : 'Share to Feed'}
        </button>
      </div>
    </div>
  )
}
