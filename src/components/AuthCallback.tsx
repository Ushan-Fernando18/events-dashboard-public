import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const { saveTokens } = useAuth()
  const navigate = useNavigate()
  const processed = useRef(false)

  useEffect(() => {
    if (processed.current) return
    processed.current = true

    const params = new URLSearchParams(window.location.search)
    const success = params.get('ga_auth_success')
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const expiresIn = params.get('expires_in')

    if (success === 'true' && accessToken && refreshToken && expiresIn) {
      saveTokens(accessToken, refreshToken, parseInt(expiresIn))
      // Clean URL and go to dashboard
      window.history.replaceState({}, '', '/')
      navigate('/', { replace: true })
    } else {
      navigate('/login?error=auth_failed', { replace: true })
    }
  }, [saveTokens, navigate])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Completing sign in…</p>
      </div>
    </div>
  )
}
