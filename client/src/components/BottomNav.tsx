import { NavLink } from 'react-router-dom'

const tabs = [
  {
    to: '/', label: 'Map',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#10b981' : '#64748b'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
      </svg>
    ),
  },
  {
    to: '/feed', label: 'Feed',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#10b981' : '#64748b'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12h16M4 6h16M4 18h10"/>
      </svg>
    ),
  },
  {
    to: '/leaderboard', label: 'Rank',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#10b981' : '#64748b'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
      </svg>
    ),
  },
  {
    to: '/profile', label: 'Profile',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#10b981' : '#64748b'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
      </svg>
    ),
  },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 flex justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] z-[1000]">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition ${isActive ? 'text-emerald-400' : 'text-slate-500'}`
          }
        >
          {({ isActive }) => (
            <>
              {t.icon(isActive)}
              <span className="text-[10px] font-medium">{t.label}</span>
              {isActive && <div className="w-1 h-1 rounded-full bg-emerald-400 mt-0.5" />}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
