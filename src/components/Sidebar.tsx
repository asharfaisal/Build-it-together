import React, { useState } from "react"
import {
  LayoutDashboard,
  BookOpen,
  Dumbbell,
  CheckSquare,
  Calendar as CalendarIcon,
  TrendingUp,
  Sparkles,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Palette,
  LogOut,
} from "lucide-react"
import { Page, useApp } from "../context/AppContext"
import { useAuth } from "../contexts/AuthContext"
import { ThemeName } from "../types"

const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { id: "study", label: "Study", icon: <BookOpen size={18} /> },
  { id: "workout", label: "Workout", icon: <Dumbbell size={18} /> },
  { id: "tasks", label: "Tasks", icon: <CheckSquare size={18} /> },
  { id: "calendar", label: "Calendar", icon: <CalendarIcon size={18} /> },
  { id: "analytics", label: "Analytics", icon: <TrendingUp size={18} /> },
  { id: "coach", label: "AI Coach", icon: <Sparkles size={18} /> },
]

const themeList: { id: ThemeName; label: string; dotColor: string }[] = [
  { id: "default", label: "Emerald Default", dotColor: "#19b88f" },
  { id: "hellokitty", label: "Hello Kitty", dotColor: "#ff4d88" },
  { id: "spiderman", label: "Spider-Man", dotColor: "#e62429" },
  { id: "ancient", label: "Black Ancient", dotColor: "#d4af37" },
  { id: "school", label: "School Notebook", dotColor: "#2563eb" },
  { id: "library", label: "Library & Wood", dotColor: "#2e604a" },
]

export default function Sidebar() {
  const {
    page,
    setPage,
    isDark,
    toggleTheme,
    userProfile,
    focusTimer,
    colorTheme,
    setColorTheme,
  } = useApp()
  const { signOut } = useAuth()
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)

  const fmtMinSec = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
  }

  return (
    <aside
      style={{
        background: "var(--sidebar-bg)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
      className="flex flex-col w-56 min-h-screen shrink-0 py-5 px-3 select-none"
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-2 mb-8 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-lg"
        onClick={() => setPage("dashboard")}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setPage("dashboard")}
        aria-label="LifeTrack Home"
      >
        <div
          style={{
            background: "linear-gradient(135deg, #19b88f 0%, #0e9a78 100%)",
          }}
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
            style={{ color: "#e8edf2" }}
            className="text-sm font-bold leading-none"
          >
            LifeTrack
          </div>
          <div
            className="text-xs font-semibold"
            style={{ color: "var(--primary)" }}
          >
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
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left w-full transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              style={{
                background: active ? "rgba(25, 184, 143, 0.12)" : "transparent",
                color: active ? "var(--primary)" : "var(--sidebar-text)",
                fontSize: "13.5px",
                fontWeight: active ? 600 : 400,
                cursor: "pointer",
                border: "none",
              }}
              onMouseEnter={(e) => {
                if (!active)
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "rgba(255,255,255,0.04)"
              }}
              onMouseLeave={(e) => {
                if (!active)
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "transparent"
              }}
            >
              <span
                className="shrink-0 flex items-center justify-center"
                style={{
                  color: active ? "var(--primary)" : "#6b7a8d",
                }}
              >
                {item.icon}
              </span>
              <span className="flex-1 truncate">{item.label}</span>

              {item.id === "study" && focusTimer.isActive && (
                <span
                  className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-semibold"
                  style={{
                    background: focusTimer.isPaused
                      ? "rgba(245,158,11,0.2)"
                      : "rgba(25,184,143,0.2)",
                    color: focusTimer.isPaused ? "#f59e0b" : "var(--primary)",
                    fontSize: "10px",
                    fontFamily: "JetBrains Mono",
                  }}
                >
                  {focusTimer.isPaused ? "⏸" : "⚡"}{" "}
                  {fmtMinSec(focusTimer.seconds)}
                </span>
              )}

              {item.id === "coach" && !focusTimer.isActive && (
                <span
                  className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-semibold"
                  style={{
                    background: "rgba(25,184,143,0.18)",
                    color: "var(--primary)",
                    fontSize: "10px",
                  }}
                >
                  AI
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom controls */}
      <div
        className="flex flex-col gap-1 mt-4 border-t pt-4 relative"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        {/* Theme Quick Switcher Menu */}
        {themeMenuOpen && (
          <div
            className="absolute bottom-36 left-0 right-0 p-2.5 rounded-2xl shadow-xl z-50 flex flex-col gap-1 animate-in fade-in zoom-in-95"
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="text-xs font-semibold px-2 py-1 text-muted-foreground">
              Select Theme
            </div>
            {themeList.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setColorTheme(t.id)
                  setThemeMenuOpen(false)
                }}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer border-none"
                style={{
                  background:
                    colorTheme === t.id ? "var(--muted)" : "transparent",
                  color:
                    colorTheme === t.id
                      ? "var(--foreground)"
                      : "var(--muted-foreground)",
                  fontWeight: colorTheme === t.id ? 600 : 400,
                }}
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: t.dotColor }}
                />
                <span className="truncate">{t.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Theme Switcher Button */}
        <button
          onClick={() => setThemeMenuOpen((prev) => !prev)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left w-full transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          style={{
            background: "transparent",
            color: "var(--sidebar-text)",
            fontSize: "13.5px",
            cursor: "pointer",
            border: "none",
          }}
          title="Quick Theme Selector"
          aria-label="Change Color Theme"
        >
          <span
            style={{ color: "#6b7a8d" }}
            className="shrink-0 flex items-center justify-center"
          >
            <Palette size={18} />
          </span>
          <span className="capitalize truncate flex-1">
            Theme: {colorTheme}
          </span>
        </button>

        {/* Settings button */}
        <button
          onClick={() => setPage("settings")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left w-full transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          style={{
            background:
              page === "settings" ? "rgba(25,184,143,0.12)" : "transparent",
            color:
              page === "settings" ? "var(--primary)" : "var(--sidebar-text)",
            fontSize: "13.5px",
            fontWeight: page === "settings" ? 600 : 400,
            cursor: "pointer",
            border: "none",
          }}
          aria-label="Settings"
        >
          <span
            style={{ color: "#6b7a8d" }}
            className="shrink-0 flex items-center justify-center"
          >
            <SettingsIcon size={18} />
          </span>
          <span>Settings</span>
        </button>

        {/* Dark/Light toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left w-full transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          style={{
            background: "transparent",
            color: "var(--sidebar-text)",
            fontSize: "13.5px",
            cursor: "pointer",
            border: "none",
          }}
          title="Toggle Dark / Light mode"
          aria-label="Toggle Dark or Light mode"
        >
          <span
            style={{ color: "#6b7a8d" }}
            className="shrink-0 flex items-center justify-center"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </span>
          <span>{isDark ? "Light mode" : "Dark mode"}</span>
        </button>

        {/* Profile */}
        <div
          onClick={() => setPage("settings")}
          className="flex items-center gap-3 px-3 py-2.5 mt-1 rounded-xl cursor-pointer hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setPage("settings")}
          aria-label={`User profile for ${userProfile.name}`}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{
              background: "linear-gradient(135deg, #19b88f, #5b8def)",
              color: "#fff",
            }}
          >
            {userProfile.avatar || userProfile.name.charAt(0) || "M"}
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="text-xs font-medium truncate"
              style={{ color: "#c4cdd6" }}
            >
              {userProfile.name}
            </div>
            <div
              className="text-xs font-semibold"
              style={{ color: "var(--primary)", fontSize: "10.5px" }}
            >
              {userProfile.tier}
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left w-full transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          style={{
            background: "transparent",
            color: "var(--sidebar-text)",
            fontSize: "13.5px",
            cursor: "pointer",
            border: "none",
          }}
          title="Sign out"
          aria-label="Sign out"
        >
          <span style={{ color: "#6b7a8d" }} className="shrink-0 flex items-center justify-center">
            <LogOut size={18} />
          </span>
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
