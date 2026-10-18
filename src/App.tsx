import React, { Suspense, lazy } from "react"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { AppProvider, useApp } from "./context/AppContext"
import Sidebar from "./components/Sidebar"
import MobileNav from "./components/MobileNav"

// Lazy load pages for code splitting
const Dashboard = lazy(() => import("./pages/Dashboard"))
const Study = lazy(() => import("./pages/Study"))
const Workout = lazy(() => import("./pages/Workout"))
const Tasks = lazy(() => import("./pages/Tasks"))
const Calendar = lazy(() => import("./pages/Calendar"))
const Analytics = lazy(() => import("./pages/Analytics"))
const AICoach = lazy(() => import("./pages/AICoach"))
const Settings = lazy(() => import("./pages/Settings"))

// Auth pages
const Login = lazy(() => import("./pages/auth/Login"))
const Register = lazy(() => import("./pages/auth/Register"))
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"))
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"))
const VerifyEmail = lazy(() => import("./pages/auth/VerifyEmail"))

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="w-10 h-10 rounded-full border-3 border-emerald-500 border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          Loading...
        </p>
      </div>
    </div>
  )
}

function AppContent() {
  const { page, isDark, colorTheme } = useApp()

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <Dashboard />
      case "study":
        return <Study />
      case "workout":
        return <Workout />
      case "tasks":
        return <Tasks />
      case "calendar":
        return <Calendar />
      case "analytics":
        return <Analytics />
      case "coach":
        return <AICoach />
      case "settings":
        return <Settings />
      case "login":
        return <Login />
      case "register":
        return <Register />
      case "forgot-password":
        return <ForgotPassword />
      case "reset-password":
        return <ResetPassword />
      case "verify-email":
        return <VerifyEmail />
      default:
        return <Dashboard />
    }
  }

  const themeClass = colorTheme !== "default" ? `theme-${colorTheme}` : ""

  // Show auth pages without sidebar/nav
  const isAuthPage = [
    "login",
    "register",
    "forgot-password",
    "reset-password",
    "verify-email",
  ].includes(page)

  return (
    <div
      className={`${isDark ? "dark" : ""} ${themeClass}`}
      style={{ minHeight: "100vh", width: "100%", position: "relative" }}
    >
      {/* Decorative Non-blocking Theme Layers */}
      {colorTheme === "spiderman" && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed top-0 right-8 z-30 flex flex-col items-center spider-sway"
          style={{ opacity: isDark ? 0.85 : 0.7 }}
        >
          {/* Thread */}
          <div className="w-[1.5px] h-20 bg-gradient-to-b from-transparent via-slate-400 to-red-600" />
          {/* Original Spider Vector */}
          <svg width="28" height="32" viewBox="0 0 28 32" fill="none">
            {/* Abdomen & Thorax */}
            <ellipse
              cx="14"
              cy="18"
              rx="5.5"
              ry="7"
              fill="#e62429"
              stroke="#111"
              strokeWidth="1"
            />
            <ellipse
              cx="14"
              cy="9"
              rx="3.5"
              ry="3.5"
              fill="#1d4ed8"
              stroke="#111"
              strokeWidth="1"
            />
            {/* Eyes */}
            <path
              d="M12.5 8L13.5 9.5"
              stroke="#fff"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M15.5 8L14.5 9.5"
              stroke="#fff"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            {/* Spider Legs */}
            <path
              d="M12 9 C8 6, 4 9, 3 14"
              stroke="#111"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <path
              d="M16 9 C20 6, 24 9, 25 14"
              stroke="#111"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <path
              d="M11 16 C6 14, 3 18, 2 22"
              stroke="#111"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <path
              d="M17 16 C22 14, 25 18, 26 22"
              stroke="#111"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <path
              d="M12 21 C7 22, 5 26, 4 30"
              stroke="#111"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <path
              d="M16 21 C21 22, 23 26, 24 30"
              stroke="#111"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}

      {colorTheme === "hellokitty" && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed top-3 right-6 z-20 opacity-60"
        >
          {/* Original Bow Motif SVG */}
          <svg width="34" height="26" viewBox="0 0 34 26" fill="none">
            <ellipse
              cx="17"
              cy="13"
              rx="4.5"
              ry="4.5"
              fill="#ff4d88"
              stroke="#ff2d55"
              strokeWidth="1.2"
            />
            <path
              d="M13 13 C8 7, 2 8, 3 15 C4 20, 10 18, 13 14 Z"
              fill="#ff75a0"
              stroke="#ff2d55"
              strokeWidth="1.2"
            />
            <path
              d="M21 13 C26 7, 32 8, 31 15 C30 20, 24 18, 21 14 Z"
              fill="#ff75a0"
              stroke="#ff2d55"
              strokeWidth="1.2"
            />
          </svg>
        </div>
      )}

      {colorTheme === "school" && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 opacity-[0.03] dark:opacity-[0.015]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(transparent, transparent 27px, #2563eb 28px)",
          }}
        />
      )}

      {colorTheme === "ancient" && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 opacity-[0.025] dark:opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 50%, #d4af37 1px, transparent 1px), radial-gradient(circle at 0% 0%, #d4af37 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      )}

      {isAuthPage ? (
        // Auth pages - full screen centered
        <Suspense fallback={<LoadingFallback />}>
          <div className="min-h-screen flex items-center justify-center p-4">
            <div
              style={{
                background: "var(--background)",
                color: "var(--foreground)",
                width: "100%",
              }}
            >
              {renderPage()}
            </div>
          </div>
        </Suspense>
      ) : (
        // Main app with sidebar and navigation
        <div
          className="flex min-h-screen w-full transition-colors duration-200 relative z-10"
          style={{
            background: "var(--background)",
            color: "var(--foreground)",
          }}
        >
          {/* Desktop Sidebar */}
          <div className="hidden md:flex">
            <Sidebar />
          </div>

          {/* Main Content Area */}
          <main
            className="flex-1 overflow-y-auto scroll-thin w-full"
            style={{ minHeight: "100vh", paddingBottom: "90px" }}
          >
            <div className="px-4 py-5 sm:px-6 sm:py-7 md:px-8 md:py-7 max-w-full">
              <Suspense fallback={<LoadingFallback />}>{renderPage()}</Suspense>
            </div>
          </main>

          {/* Mobile Navigation */}
          <MobileNav />
        </div>
      )}
    </div>
  )
}

function ProtectedApp() {
  const { user, loading } = useAuth()
  const { setPage } = useApp()

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--background)" }}
      >
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-3 border-emerald-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Restoring session...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    // Redirect to login page when not authenticated
    setPage("login")
    return <AppContent />
  }

  return <AppContent />
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <ProtectedApp />
      </AppProvider>
    </AuthProvider>
  )
}
