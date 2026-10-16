import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react"
import { supabase } from "../lib/supabase"
import type { User, Session, AuthError } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  error: AuthError | null
  signUp: (
    email: string,
    password: string,
    name?: string,
  ) => Promise<{ error: AuthError | null }>
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>
  resendVerification: (email: string) => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)

  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession()
        if (mounted) {
          setSession(initialSession)
          setUser(initialSession?.user ?? null)
          setLoading(false)
        }
      } catch (err) {
        console.warn("Could not retrieve Supabase session:", err)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) {
        setSession(newSession)
        setUser(newSession?.user ?? null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = useCallback(
    async (email: string, password: string, name?: string) => {
      setError(null)
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || email.split("@")[0],
            avatar: (name || email.split("@")[0]).charAt(0).toUpperCase(),
          },
        },
      })
      if (error) setError(error)
      return { error }
    },
    [],
  )

  const signIn = useCallback(async (email: string, password: string) => {
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) setError(error)
    return { error }
  }, [])

  const signOut = useCallback(async () => {
    setError(null)
    const { error } = await supabase.auth.signOut()
    if (error) setError(error)
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) setError(error)
    return { error }
  }, [])

  const updatePassword = useCallback(async (password: string) => {
    setError(null)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setError(error)
    return { error }
  }, [])

  const resendVerification = useCallback(async (email: string) => {
    setError(null)
    const { error } = await supabase.auth.resend({ type: "signup", email })
    if (error) setError(error)
    return { error }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        error,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        resendVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
