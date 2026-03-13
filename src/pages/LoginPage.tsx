import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { BarChart3, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const error = new URLSearchParams(window.location.search).get('error')

  useEffect(() => {
    if (isAuthenticated()) navigate('/', { replace: true })
  }, [isAuthenticated, navigate])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Gradient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'hsl(221 83% 63%)' }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{ background: 'hsl(262 83% 70%)' }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="glass rounded-2xl p-8 shadow-2xl animate-fade-in">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'linear-gradient(135deg, hsl(221 83% 63%), hsl(262 83% 70%))' }}
            >
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">GA4 Analytics</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Sign in to view your dashboard
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Sign in failed. Please try again.</span>
            </div>
          )}

          {/* Sign in button */}
          <button
            onClick={login}
            className="w-full flex items-center justify-center gap-3 rounded-xl px-6 py-3.5 font-medium transition-all duration-200 hover:opacity-90 active:scale-[0.98] text-white"
            style={{ background: 'linear-gradient(135deg, hsl(221 83% 63%), hsl(262 83% 70%))' }}
          >
            {/* Google icon */}
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff" opacity=".9"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff" opacity=".9"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff" opacity=".9"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff" opacity=".9"/>
            </svg>
            Sign in with Google
          </button>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Only users with access to the GA4 property can sign in.
          </p>
        </div>
      </div>
    </div>
  )
}
