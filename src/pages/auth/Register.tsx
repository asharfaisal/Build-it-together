import React, { useState } from "react"
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { useApp } from "../../context/AppContext"

export default function Register() {
  const { signUp, loading: authLoading } = useAuth()
  const { setPage, showToast } = useApp()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)

    const { error } = await signUp(email.trim(), password, name.trim())
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      showToast(
        "Account created! Please check your email to verify.",
        "success",
      )
      setPage("verify-email")
    }
  }

  const handleGoToLogin = () => {
    setPage("login")
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
              Create your account
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
            Create account
          </h2>
          <p
            className="text-sm mb-6"
            style={{ color: "var(--muted-foreground)" }}
          >
            Start tracking your productivity journey
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
                Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-xs"
                  style={{ color: "var(--muted-foreground)" }}
                />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
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
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
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

            <div>
              <label
                className="text-xs font-semibold block mb-1"
                style={{ color: "var(--foreground)" }}
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-xs"
                  style={{ color: "var(--muted-foreground)" }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  required
                  className="w-full pl-9 pr-12 py-2.5 rounded-xl text-sm outline-none"
                  style={{
                    background: "var(--muted)",
                    border: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                  disabled={loading || authLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={
                loading ||
                authLoading ||
                !name ||
                !email ||
                !password ||
                !confirmPassword
              }
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
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
              Already have an account?{" "}
              <button
                onClick={handleGoToLogin}
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

        {/* Terms notice */}
        <div
          className="mt-4 p-4 rounded-xl text-center text-xs"
          style={{
            background: "var(--muted)",
            border: "1px solid var(--border)",
          }}
        >
          <p style={{ color: "var(--muted-foreground)" }}>
            By creating an account, you agree to our{" "}
            <span
              className="font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Terms of Service
            </span>{" "}
            and{" "}
            <span
              className="font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Privacy Policy
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
