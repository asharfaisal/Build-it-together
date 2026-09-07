import React, { useState } from 'react'
import { Page, useApp } from '../context/AppContext'

const primaryNav: { id: Page; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Home', icon: '⊞' },
  { id: 'study', label: 'Study', icon: '📖' },
  { id: 'workout', label: 'Workout', icon: '💪' },
  { id: 'tasks', label: 'Tasks', icon: '✓' },
  { id: 'coach', label: 'AI', icon: '✦' },
]

const allNavItems: { id: Page; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
  { id: 'study', label: 'Study & Timers', icon: '📖' },
  { id: 'workout', label: 'Workout Tracker', icon: '💪' },
  { id: 'tasks', label: 'Tasks & Planning', icon: '✓' },
  { id: 'calendar', label: 'Calendar & Schedule', icon: '⊡' },
  { id: 'analytics', label: 'Analytics & Insights', icon: '↗' },
  { id: 'coach', label: 'AI Coach & Review', icon: '✦' },
  { id: 'settings', label: 'Settings & Data', icon: '⚙' },
]

export default function MobileNav() {
  const { page, setPage, focusTimer } = useApp()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      {/* Full mobile menu drawer */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 flex flex-col justify-end"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="w-full rounded-t-3xl p-6 flex flex-col gap-4 animate-in slide-in-from-bottom-5 duration-200"
            style={{
              background: 'var(--card)',
              borderTop: '1px solid var(--border)',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="text-sm font-700" style={{ fontFamily: 'Plus Jakarta Sans', color: 'var(--foreground)' }}>
                LifeTrack Navigation
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs cursor-pointer"
                style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', border: 'none' }}
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {allNavItems.map((item) => {
                const active = page === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setPage(item.id)
                      setDrawerOpen(false)
                    }}
                    className="flex items-center gap-2.5 p-3 rounded-2xl text-left transition-all cursor-pointer"
                    style={{
                      background: active ? 'rgba(25, 184, 143, 0.15)' : 'var(--muted)',
                      border: `1px solid ${active ? '#19b88f' : 'transparent'}`,
                      color: active ? '#19b88f' : 'var(--foreground)',
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{item.icon}</span>
                    <span className="text-xs font-600 truncate flex-1">{item.label}</span>
                    {item.id === 'study' && focusTimer.isActive && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Persistent bottom bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 flex items-center z-40"
        style={{
          background: 'var(--sidebar-bg)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingBottom: 'env(safe-area-inset-bottom, 8px)',
        }}
      >
        {primaryNav.map((item) => {
          const active = page === item.id
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className="flex-1 flex flex-col items-center gap-1 py-2.5 outline-none relative cursor-pointer"
              style={{
                background: 'none',
                border: 'none',
                color: active ? '#19b88f' : '#6b7a8d',
              }}
            >
              <div className="relative">
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                {item.id === 'study' && focusTimer.isActive && (
                  <span className="absolute -top-0.5 -right-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>
              <span style={{ fontSize: '10px', fontWeight: active ? 600 : 400 }}>{item.label}</span>
            </button>
          )
        })}

        {/* More/Menu button */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex-1 flex flex-col items-center gap-1 py-2.5 outline-none cursor-pointer"
          style={{
            background: 'none',
            border: 'none',
            color: page === 'calendar' || page === 'analytics' || page === 'settings' ? '#19b88f' : '#6b7a8d',
          }}
        >
          <span style={{ fontSize: '16px' }}>☰</span>
          <span style={{ fontSize: '10px', fontWeight: page === 'calendar' || page === 'analytics' || page === 'settings' ? 600 : 400 }}>
            More
          </span>
        </button>
      </nav>
    </>
  )
}
