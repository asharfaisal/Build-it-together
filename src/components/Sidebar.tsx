import React from 'react'
import { Page, useApp } from '../context/AppContext'

const navItems: { id: Page; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
  { id: 'study', label: 'Study', icon: '📖' },
  { id: 'workout', label: 'Workout', icon: '💪' },
  { id: 'tasks', label: 'Tasks', icon: '✓' },
  { id: 'calendar', label: 'Calendar', icon: '⊡' },
  { id: 'analytics', label: 'Analytics', icon: '↗' },
  { id: 'coach', label: 'AI Coach', icon: '✦' },
]

export default function Sidebar() {
  const { page, setPage, isDark, toggleTheme, userProfile } = useApp()

  return (
    <aside
      style={{
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
      className="flex flex-col w-56 min-h-screen shrink-0 py-5 px-3 select-none"
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-2 mb-8 cursor-pointer"
        onClick={() => setPage('dashboard')}
      >
        <div
          style={{ background: 'linear-gradient(135deg, #19b88f 0%, #0e9a78 100%)' }}
          className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M2 12 L5 8 L8 10 L11 5 L14 7"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="14" cy="7" r="1.5" fill="white" />
          </svg>
        </div>
        <div>
          <div
            style={{ fontFamily: 'Plus Jakarta Sans', color: '#e8edf2' }}
            className="text-sm font-700 leading-none"
          >
            LifeTrack
          </div>
          <div className="text-xs" style={{ color: '#19b88f', fontWeight: 600 }}>
            AI
          </div>
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex flex-col gap-1 flex-1" aria-label="Main Navigation">
        {navItems.map((item) => {
          const active = page === item.id
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left w-full transition-all duration-150"
              style={{
                background: active ? 'rgba(25, 184, 143, 0.12)' : 'transparent',
                color: active ? '#19b88f' : '#8b99aa',
                fontFamily: 'Inter',
                fontSize: '13.5px',
                fontWeight: active ? 600 : 400,
                cursor: 'pointer',
                border: 'none',
              }}
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              }}
            >
              <span
                style={{
                  fontSize: '15px',
                  width: '18px',
                  textAlign: 'center',
                  color: active ? '#19b88f' : '#6b7a8d',
                  fontStyle: 'normal',
                }}
              >
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.id === 'coach' && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(25,184,143,0.18)', color: '#19b88f', fontSize: '10px', fontWeight: 600 }}
                >
                  AI
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom controls */}
      <div className="flex flex-col gap-1 mt-4 border-t pt-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => setPage('settings')}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left w-full transition-all duration-150"
          style={{
            background: page === 'settings' ? 'rgba(25,184,143,0.12)' : 'transparent',
            color: page === 'settings' ? '#19b88f' : '#8b99aa',
            fontSize: '13.5px',
            fontWeight: page === 'settings' ? 600 : 400,
            cursor: 'pointer',
            border: 'none',
          }}
          onMouseEnter={(e) => {
            if (page !== 'settings') (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'
          }}
          onMouseLeave={(e) => {
            if (page !== 'settings') (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
          }}
        >
          <span style={{ fontSize: '15px', width: '18px', textAlign: 'center', color: '#6b7a8d' }}>⚙</span>
          <span>Settings</span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left w-full transition-all duration-150"
          style={{
            background: 'transparent',
            color: '#8b99aa',
            fontSize: '13.5px',
            cursor: 'pointer',
            border: 'none',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
          }}
          title="Toggle Dark / Light mode"
        >
          <span style={{ fontSize: '15px', width: '18px', textAlign: 'center', color: '#6b7a8d' }}>
            {isDark ? '☀️' : '🌙'}
          </span>
          <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
        </button>

        {/* Profile */}
        <div
          onClick={() => setPage('settings')}
          className="flex items-center gap-3 px-3 py-2.5 mt-1 rounded-xl cursor-pointer hover:bg-white/5 transition-colors"
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-700 shrink-0"
            style={{
              background: 'linear-gradient(135deg, #19b88f, #5b8def)',
              color: '#fff',
              fontFamily: 'Plus Jakarta Sans',
            }}
          >
            {userProfile.avatar || userProfile.name.charAt(0) || 'M'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-500 truncate" style={{ color: '#c4cdd6' }}>
              {userProfile.name}
            </div>
            <div className="text-xs font-600" style={{ color: '#19b88f', fontSize: '10.5px' }}>
              {userProfile.tier}
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
