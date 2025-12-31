import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { User } from '../types'

export type SignupResult = {
  data?: any
  error?: { message?: string }
}

export type LoginResult = {
  data?: any
  error?: { message?: string }
}

export type UseAuthReturn = {
  user: User | null
  session: any | null
  loading: boolean
  error: string | null
  signup: (name: string, email: string, password: string) => Promise<SignupResult>
  login: (email: string, password: string) => Promise<LoginResult>
  logout: () => Promise<void>
  getSession: () => Promise<any>
}

export default function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // initialize session and user
    let mounted = true
    ;(async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (!mounted) return
        setSession(data?.session ?? null)
        setUser((data?.session?.user as any) ?? null)
      } catch (err) {
        console.error('getSession error', err)
      }
    })()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, payload) => {
      setSession(payload.session ?? null)
      setUser((payload.session?.user as any) ?? null)
    })

    return () => {
      mounted = false
      listener?.subscription?.unsubscribe?.()
    }
  }, [])

  const signup = useCallback(async (name: string, email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      // sign up with metadata (name)
      // supabase-js v2 allows options with user metadata
      const { data, error } = await supabase.auth.signUp({ email, password }, { data: { name } as any })
      if (error) {
        setError(error.message)
        return { error }
      }
      // If sign up returned a session, set user/session
      if (data?.session) {
        setSession(data.session)
        setUser(data.session.user as any)
      }
      return { data }
    } catch (err: any) {
      const msg = err?.message ?? 'Signup failed'
      setError(msg)
      return { error: { message: msg } }
    } finally {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        return { error }
      }
      if (data?.session) {
        setSession(data.session)
        setUser(data.session.user as any)
      }
      return { data }
    } catch (err: any) {
      const msg = err?.message ?? 'Login failed'
      setError(msg)
      return { error: { message: msg } }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await supabase.auth.signOut()
      setSession(null)
      setUser(null)
    } catch (err: any) {
      console.error('logout error', err)
      setError(err?.message ?? 'Logout failed')
    } finally {
      setLoading(false)
    }
  }, [])

  const getSession = useCallback(async () => {
    const { data } = await supabase.auth.getSession()
    setSession(data?.session ?? null)
    setUser((data?.session?.user as any) ?? null)
    return data
  }, [])

  return { user, session, loading, error, signup, login, logout, getSession }
}
