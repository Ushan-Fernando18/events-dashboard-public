import { useNavigate, useLocation } from 'react-router-dom'
import { Monitor, LayoutDashboard } from 'lucide-react'

export default function DashboardSwitcher() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const isEventDashboard = location.pathname === '/event'

  return (
    <button
      onClick={() => navigate(isEventDashboard ? '/' : '/event')}
      className="fixed bottom-4 right-4 z-50 p-2 rounded-full bg-transparent hover:bg-white/5 text-muted-foreground hover:text-white transition-all duration-300 group flex items-center gap-2"
      title={`Switch to ${isEventDashboard ? 'Internal Dashboard' : 'Event Dashboard'}`}
    >
      {isEventDashboard ? (
        <>
          <LayoutDashboard className="h-5 w-5 opacity-50 group-hover:opacity-100 transition-opacity" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap opacity-0 group-hover:opacity-100 font-medium tracking-wide text-xs">
            Internal Dashboard
          </span>
        </>
      ) : (
        <>
          <Monitor className="h-5 w-5 opacity-50 group-hover:opacity-100 transition-opacity" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap opacity-0 group-hover:opacity-100 font-medium tracking-wide text-xs">
            Event Dashboard
          </span>
        </>
      )}
    </button>
  )
}
