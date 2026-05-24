import { create } from 'zustand'

const API = import.meta.env.VITE_API_URL

interface AuthState {
  token: string | null
  user: { id: string; username: string; colour: string } | null
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),

  login: async (email, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const json = await res.json()
    if (json.error) throw new Error(json.error.message)
    localStorage.setItem('token', json.data.tokens.access)
    localStorage.setItem('user', JSON.stringify(json.data.user))
    set({ token: json.data.tokens.access, user: json.data.user })
  },

  register: async (username, email, password) => {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    })
    const json = await res.json()
    if (json.error) throw new Error(json.error.message)
    localStorage.setItem('token', json.data.tokens.access)
    localStorage.setItem('user', JSON.stringify(json.data.user))
    set({ token: json.data.tokens.access, user: json.data.user })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ token: null, user: null })
  },
}))
