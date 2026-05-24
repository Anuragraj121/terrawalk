import { useEffect, useState } from 'react'
import { useAuthStore } from '../stores/authStore'

const API = import.meta.env.VITE_API_URL

interface Post {
  id: string
  username: string
  colour: string
  photo_url: string | null
  caption: string | null
  cells_claimed: number
  distance_m: number
  duration_s: number
  like_count: string
  liked_by_me: boolean
  created_at: string
}

export default function FeedScreen() {
  const { token } = useAuthStore()
  const [posts, setPosts] = useState<Post[]>([])

  useEffect(() => {
    if (!token) return
    fetch(`${API}/posts/feed`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((json) => { if (json.data) setPosts(json.data) })
  }, [token])

  const toggleLike = async (postId: string) => {
    const res = await fetch(`${API}/posts/${postId}/like`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` },
    })
    const json = await res.json()
    if (json.data) {
      setPosts((prev) => prev.map((p) => p.id === postId ? {
        ...p,
        liked_by_me: json.data.liked,
        like_count: String(Number(p.like_count) + (json.data.liked ? 1 : -1)),
      } : p))
    }
  }

  const timeAgo = (date: string) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000)
    if (mins < 60) return `${mins}m ago`
    if (mins < 1440) return `${Math.floor(mins / 60)}h ago`
    return `${Math.floor(mins / 1440)}d ago`
  }

  return (
    <div className="h-full pb-20 overflow-y-auto bg-slate-950">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-black text-white">Activity</h1>
        <p className="text-slate-400 text-sm mt-0.5">See what others are conquering</p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="text-4xl mb-3">🏃‍♂️</p>
          <p className="font-medium">No posts yet</p>
          <p className="text-sm mt-1">Complete a walk to share your journey!</p>
        </div>
      ) : (
        <div className="px-4 space-y-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-slate-800/60 border border-slate-700/30 rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 p-4 pb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: post.colour }}>
                  {post.username[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-white">{post.username}</span>
                  <p className="text-xs text-slate-400">{timeAgo(post.created_at)}</p>
                </div>
              </div>

              {/* Photo */}
              {post.photo_url && (
                <img src={post.photo_url} alt="" className="w-full aspect-[4/3] object-cover" />
              )}

              {/* Run stats card */}
              <div className="px-4 py-3">
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="text-emerald-400 font-bold">{post.cells_claimed}</span>
                    <span className="text-slate-400 ml-1">cells</span>
                  </div>
                  <div>
                    <span className="text-white font-bold">{(post.distance_m / 1000).toFixed(2)}</span>
                    <span className="text-slate-400 ml-1">km</span>
                  </div>
                  <div>
                    <span className="text-white font-bold">{Math.floor(post.duration_s / 60)}</span>
                    <span className="text-slate-400 ml-1">min</span>
                  </div>
                </div>

                {post.caption && (
                  <p className="text-slate-300 text-sm mt-2">{post.caption}</p>
                )}
              </div>

              {/* Like bar */}
              <div className="px-4 pb-3 flex items-center gap-2">
                <button onClick={() => toggleLike(post.id)} className="flex items-center gap-1.5 active:scale-95 transition">
                  <svg width="20" height="20" viewBox="0 0 24 24"
                    fill={post.liked_by_me ? '#f43f5e' : 'none'}
                    stroke={post.liked_by_me ? '#f43f5e' : '#64748b'} strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  <span className={`text-sm font-medium ${post.liked_by_me ? 'text-rose-400' : 'text-slate-400'}`}>
                    {post.like_count}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
