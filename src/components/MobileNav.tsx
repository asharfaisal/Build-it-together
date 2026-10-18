import React, { useState } from "react"
import {
  LayoutDashboard,
  BookOpen,
  Dumbbell,
  CheckSquare,
  Sparkles,
  Calendar as CalendarIcon,
  TrendingUp,
  Settings as SettingsIcon,
  Menu,
  X,
} from "lucide-react"
import { Page, useApp } from "../context/AppContext"

const primaryNav: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Home", icon: <LayoutDashboard size={20} /> },
  { id: "study", label: "Study", icon: <BookOpen size={20} /> },
  { id: "workout", label: "Workout", icon: <Dumbbell size={20} /> },
  { id: "tasks", label: "Tasks", icon: <CheckSquare size={20} /> },
  { id: "coach", label: "AI Coach", icon: <Sparkles size={20} /> },
]

const allNavItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
  { id: "study", label: "Study & Timers", icon: <BookOpen size={20} /> },
  { id: "workout", label: "Workout Tracker", icon: <Dumbbell size={20} /> },
  { id: "tasks", label: "Tasks & Planning", icon: <CheckSquare size={20} /> },
  {
    id: "calendar",
    label: "Calendar & Schedule",
    icon: <CalendarIcon size={20} />,
  },
  {
    id: "analytics",
    label: "Analytics & Insights",
    icon: <TrendingUp size={20} />,
  },
  { id: "coach", label: "AI Coach & Review", icon: <Sparkles size={20} /> },
  {
    id: "settings",
    label: "Settings & Data",
    icon: <SettingsIcon size={20} />,
  },
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
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="w-full rounded-t-3xl p-6 flex flex-col gap-4 animate-in slide-in-from-bottom-5 duration-200"
            style={{
              background: "var(--card)",
              borderTop: "1px solid var(--border)",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between pb-2 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <div
                className="text-sm font-bold"
                style={{ color: "var(--foreground)" }}
              >
                LifeTrack Navigation
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer min-h-[44px] min-w-[44px] focus-visible:ring-2 focus-visible:ring-emerald-400"
                style={{
                  background: "var(--muted)",
                  color: "var(--muted-foreground)",
                  border: "none",
                }}
                aria-label="Close menu"
              >
                <X size={18} />
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
                    className="flex items-center gap-2.5 p-3 rounded-2xl text-left transition-all cursor-pointer min-h-[48px] focus-visible:ring-2 focus-visible:ring-emerald-400"
                    style={{
                      background: active
                        ? "rgba(25, 184, 143, 0.15)"
                        : "var(--muted)",
                      border: `1px solid ${
                        active ? "var(--primary)" : "transparent"
                      }`,
                      color: active ? "var(--primary)" : "var(--foreground)",
                    }}
                    aria-label={item.label}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span className="text-xs font-semibold truncate flex-1">
                      {item.label}
                    </span>
                    {item.id === "study" && focusTimer.isActive && (
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
          background: "var(--sidebar-bg)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingBottom: "env(safe-area-inset-bottom, 8px)",
        }}
        aria-label="Mobile Bottom Navigation"
      >
        {primaryNav.map((item) => {
          const active = page === item.id
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2 outline-none relative cursor-pointer min-h-[48px] focus-visible:ring-2 focus-visible:ring-emerald-400"
              style={{
                background: "none",
                border: "none",
                color: active ? "var(--primary)" : "#6b7a8d",
              }}
              aria-label={item.label}
            >
              <div className="relative flex items-center justify-center">
                <span>{item.icon}</span>
                {item.id === "study" && focusTimer.isActive && (
                  <span className="absolute -top-0.5 -right-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>
              <span
                style={{ fontSize: "10px", fontWeight: active ? 600 : 400 }}
              >
                {item.label}
              </span>
            </button>
          )
        })}

        {/* More/Menu button */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex-1 flex flex-col items-center justify-center gap-1 py-2 outline-none cursor-pointer min-h-[48px] focus-visible:ring-2 focus-visible:ring-emerald-400"
          style={{
            background: "none",
            border: "none",
            color:
              page === "calendar" || page === "analytics" || page === "settings"
                ? "var(--primary)"
                : "#6b7a8d",
          }}
          aria-label="More navigation items"
        >
          <Menu size={20} />
          <span
            style={{
              fontSize: "10px",
              fontWeight:
                page === "calendar" ||
                page === "analytics" ||
                page === "settings"
                  ? 600
                  : 400,
            }}
          >
            More
          </span>
        </button>
      </nav>
    </>
  )
}
