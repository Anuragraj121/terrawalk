import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'

export default function AuthScreen() {
  const { login, register } = useAuthStore()
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isLogin) await login(email, password)
      else await register(username, email, password)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col justify-between bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/20">
          <span className="text-4xl">🗺️</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white">TerraWalk</h1>
        <p className="text-emerald-400 font-semibold text-sm mt-1 tracking-widest uppercase">Run. Capture. Conquer.</p>
      </div>

      {/* Form */}
      <div className="bg-slate-800/80 backdrop-blur-xl rounded-t-3xl px-6 pt-8 pb-10 border-t border-slate-700/50">
        <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
          <h2 className="text-lg font-bold text-white text-center mb-2">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>

          {!isLogin && (
            <div className="relative">
              <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username"
                className="w-full px-4 py-3.5 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition" />
            </div>
          )}
          <div className="relative">
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email"
              className="w-full px-4 py-3.5 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition" />
          </div>
          <div className="relative">
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password"
              className="w-full px-4 py-3.5 rounded-xl bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition" />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2.5 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 font-bold text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all active:scale-[0.98] disabled:opacity-50">
            {loading ? '...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-slate-400 pt-2">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button type="button" onClick={() => { setIsLogin(!isLogin); setError('') }}
              className="text-emerald-400 font-semibold">
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </form>
      </div>
    </div>
  )
}
