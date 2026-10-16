import React, { useState } from "react"
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { useApp } from "../../context/AppContext"

export default function Login() {
  const { signIn, loading: authLoading } = useAuth()
  const { setPage, showToast } = useApp()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await signIn(email.trim(), password)
    if (error) {
      setError(error.message)
      setLoading(false)
    }
    // On success, AuthContext will update and app will redirect
  }

  const handleForgotPassword = () => {
    setPage("forgot-password")
  }

  const handleGoToRegister = () => {
    setPage("register")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #19b88f 0%, #0e9a78 100%)",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 12 L6 8 L9 10 L12 5 L15 7"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="15" cy="7" r="2" fill="white" />
            </svg>
          </div>
          <div>
            <h1
              className="text-2xl font-bold"
              style={{
                fontFamily: "Plus Jakarta Sans",
                color: "var(--foreground)",
              }}
            >
              LifeTrack AI
            </h1>
            <p className="text-xs" style={{ color: "var(--primary)" }}>
              Sign in to continue
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          <h2
            className="text-xl font-bold mb-2"
            style={{
              fontFamily: "Plus Jakarta Sans",
              color: "var(--foreground)",
            }}
          >
            Welcome back
          </h2>
          <p
            className="text-sm mb-6"
            style={{ color: "var(--muted-foreground)" }}
          >
            Sign in to access your productivity dashboard
          </p>

          {error && (
            <div
              className="mb-4 p-3 rounded-xl flex items-center gap-2 text-sm"
              style={{
                background: "rgba(228,91,91,0.1)",
                color: "#e45b5b",
                border: "1px solid rgba(228,91,91,0.2)",
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="text-xs font-semibold block mb-1"
                style={{ color: "var(--foreground)" }}
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-xs"
                  style={{ color: "var(--muted-foreground)" }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{
                    background: "var(--muted)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                  disabled={loading || authLoading}
                />
              </div>
            </div>

            <div>
              <label
                className="text-xs font-semibold block mb-1"
                style={{ color: "var(--foreground)" }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-xs"
                  style={{ color: "var(--muted-foreground)" }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-12 py-2.5 rounded-xl text-sm outline-none"
                  style={{
                    background: "var(--muted)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                  disabled={loading || authLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded"
                  style={{ accentColor: "#19b88f" }}
                />
                <span
                  className="text-xs"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Remember me
                </span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs font-semibold"
                style={{
                  color: "#19b88f",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || authLoading || !email || !password}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
              style={{
                background: "#19b88f",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              {loading || authLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Don't have an account?{" "}
              <button
                onClick={handleGoToRegister}
                className="font-semibold"
                style={{
                  color: "#19b88f",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Sign up
              </button>
            </p>
          </div>
        </div>

        {/* Demo notice */}
        <div
          className="mt-6 p-4 rounded-xl text-center text-xs"
          style={{
            background: "rgba(25,184,143,0.08)",
            border: "1px solid rgba(25,184,143,0.2)",
          }}
        >
          <p style={{ color: "#19b88f" }}>
            Demo mode: Use any email/password to test
          </p>
        </div>
      </div>
    </div>
  )
}
