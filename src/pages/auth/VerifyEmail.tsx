import React, { useEffect, useState } from "react"
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Mail,
  RefreshCw,
} from "lucide-react"
import { supabase } from "../../lib/supabase"
import { useApp } from "../../context/AppContext"

export default function VerifyEmail() {
  const { setPage, showToast } = useApp()
  const [status, setStatus] =
    useState<"loading" | "success" | "error" | "idle">("loading")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [resending, setResending] = useState(false)

  useEffect(() => {
    const checkVerification = async () => {
      // Check URL for verification tokens
      const hash = window.location.hash
      const searchParams = new URLSearchParams(window.location.search)

      // Handle email verification link from Supabase
      if (searchParams.has("type") && searchParams.get("type") === "signup") {
        // The link was clicked, session should be established
        setStatus("success")
        showToast("Email verified! Welcome to LifeTrack AI.", "success")
        setTimeout(() => setPage("dashboard"), 1500)
        return
      }

      // If we have access token in hash, it's a magic link / verification
      if (hash.includes("access_token") || hash.includes("refresh_token")) {
        setStatus("success")
        showToast("Email verified! Welcome to LifeTrack AI.", "success")
        setTimeout(() => setPage("dashboard"), 1500)
        return
      }

      // No verification token found - show waiting state
      setStatus("idle")
    }

    checkVerification()
  }, [setPage, showToast])

  const handleResendVerification = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.user?.email) return

    setResending(true)
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: session.user.email,
    })

    if (error) {
      showToast("Failed to resend verification email", "error")
    } else {
      showToast("Verification email sent! Check your inbox.", "success")
    }
    setResending(false)
  }

  const handleGoToLogin = () => {
    setPage("login")
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse"
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
            Email Verified!
          </h2>
          <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Redirecting to dashboard...
          </p>
          <Loader2
            size={24}
            className="mx-auto mt-4 animate-spin"
            style={{ color: "#19b88f" }}
          />
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
              Verify your email
            </p>
          </div>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{
              background: "rgba(91,141,239,0.1)",
              border: "1px solid rgba(91,141,239,0.2)",
            }}
          >
            <Mail size={32} style={{ color: "#5b8def" }} />
          </div>

          <h2
            className="text-xl font-bold mb-2"
            style={{
              fontFamily: "Plus Jakarta Sans",
              color: "var(--foreground)",
            }}
          >
            {status === "error" ? "Verification Failed" : "Check your email"}
          </h2>

          {status === "error" ? (
            <p className="text-sm mb-6" style={{ color: "#e45b5b" }}>
              {errorMessage ||
                "The verification link is invalid or has expired."}
            </p>
          ) : (
            <p
              className="text-sm mb-6"
              style={{ color: "var(--muted-foreground)" }}
            >
              We've sent a verification link to your email address. Please check
              your inbox (and spam folder) and click the link to verify your
              account.
            </p>
          )}

          <div className="space-y-3">
            <button
              onClick={handleResendVerification}
              disabled={resending}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{
                background: "#19b88f",
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
            >
              {resending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  Resend Verification Email
                </>
              )}
            </button>

            <button
              onClick={handleGoToLogin}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold"
              style={{
                background: "var(--muted)",
                color: "var(--foreground)",
                border: "none",
                cursor: "pointer",
              }}
            >
              Back to Sign In
            </button>
          </div>

          {status === "error" && (
            <div
              className="mt-6 p-4 rounded-xl text-left text-sm"
              style={{
                background: "rgba(228,91,91,0.1)",
                border: "1px solid rgba(228,91,91,0.2)",
                color: "#e45b5b",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={16} />
                <span className="font-semibold">Need help?</span>
              </div>
              <ul className="space-y-1 text-xs">
                <li>• Make sure you clicked the link from the latest email</li>
                <li>• Verification links expire after 24 hours</li>
                <li>• Try requesting a new verification email above</li>
                <li>• Contact support if the issue persists</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
