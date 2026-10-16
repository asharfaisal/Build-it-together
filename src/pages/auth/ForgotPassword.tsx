import React, { useState } from "react"
import {
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { useApp } from "../../context/AppContext"

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const { setPage, showToast } = useApp()

  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await resetPassword(email.trim())
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
      showToast("Password reset email sent! Check your inbox.", "success")
    }
  }

  const handleBackToLogin = () => {
    setPage("login")
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{
              background: "rgba(25,184,143,0.1)",
              border: "1px solid rgba(25,184,143,0.2)",
            }}
          >
            <CheckCircle2 size={32} style={{ color: "#19b88f" }} />
          </div>
          <h2
            className="text-xl font-bold mb-2"
            style={{
              fontFamily: "Plus Jakarta Sans",
              color: "var(--foreground)",
            }}
          >
            Check your email
          </h2>
          <p
            className="text-sm mb-6"
            style={{ color: "var(--muted-foreground)" }}
          >
            We've sent a password reset link to <strong>{email}</strong>
          </p>
          <button
            onClick={handleBackToLogin}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold"
            style={{
              background: "#19b88f",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Back to Sign In
          </button>
        </div>
      </div>
    )
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
              Reset your password
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
          <button
            onClick={handleBackToLogin}
            className="mb-4 p-1 rounded-lg hover:bg-white/5 transition-colors"
            style={{ color: "var(--muted-foreground)" }}
            aria-label="Back to login"
          >
            <ArrowLeft size={20} />
          </button>

          <h2
            className="text-xl font-bold mb-2"
            style={{
              fontFamily: "Plus Jakarta Sans",
              color: "var(--foreground)",
            }}
          >
            Forgot password?
          </h2>
          <p
            className="text-sm mb-6"
            style={{ color: "var(--muted-foreground)" }}
          >
            Enter your email and we'll send you a link to reset your password.
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
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
              style={{
                background: "#19b88f",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Sending...
                </span>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Remember your password?{" "}
              <button
                onClick={handleBackToLogin}
                className="font-semibold"
                style={{
                  color: "#19b88f",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
