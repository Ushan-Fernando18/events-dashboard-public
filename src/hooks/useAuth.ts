import { useCallback } from 'react'

const STORAGE_KEY = 'ga4_auth'

interface AuthData {
  access_token: string
  refresh_token: string
  expires_at: number // unix timestamp ms
}

function getAuth(): AuthData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as AuthData) : null
  } catch {
    return null
  }
}

function setAuth(data: AuthData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function clearAuth() {
  localStorage.removeItem(STORAGE_KEY)
}

function isExpired(auth: AuthData): boolean {
  return Date.now() >= auth.expires_at - 60_000 // refresh 1 min early
}

export function useAuth() {
  const login = useCallback(() => {
    window.location.href = '/api/authorize'
  }, [])

  const logout = useCallback(() => {
    clearAuth()
    window.location.href = '/login'
  }, [])

  const saveTokens = useCallback(
    (access_token: string, refresh_token: string, expires_in: number) => {
      setAuth({
        access_token,
        refresh_token,
        expires_at: Date.now() + expires_in * 1000,
      })
    },
    []
  )

  const getValidToken = useCallback(async (): Promise<string | null> => {
    const auth = getAuth()
    if (!auth) return null

    if (!isExpired(auth)) return auth.access_token

    // Silently refresh
    try {
      const res = await fetch('/api/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: auth.refresh_token }),
      })
      if (!res.ok) {
        clearAuth()
        return null
      }
      const data = await res.json() as { access_token: string; expires_in: number }
      setAuth({
        access_token: data.access_token,
        refresh_token: auth.refresh_token,
        expires_at: Date.now() + data.expires_in * 1000,
      })
      return data.access_token
    } catch {
      clearAuth()
      return null
    }
  }, [])

  const isAuthenticated = useCallback((): boolean => {
    return getAuth() !== null
  }, [])

  return { login, logout, saveTokens, getValidToken, isAuthenticated }
}
