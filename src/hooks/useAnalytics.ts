import { useQuery } from '@tanstack/react-query'
import { useAuth } from './useAuth'

export type PageType = 'events' | 'virtual-events'

export interface AnalyticsData {
  kpis: { 
    sessions: number; 
    pageViews: number; 
    avgSessionDuration: number; 
    realtimeUsers: number;
    totalUsers24h: number;
  }
  countries: { country: string; views: number; percentage: number }[]
  cities: { city: string; views: number; percentage: number }[]
  sources: { name: string; sessions: number }[]
  mediums: { name: string; sessions: number }[]
  registerNowCount: number
  registerNowSources: { name: string; sessions: number }[]
  callNowCount?: number
}

export function useAnalytics(startDate: string, endDate: string, pageType: PageType) {
  const { getValidToken, logout } = useAuth()
  return useQuery<AnalyticsData>({
    queryKey: ['analytics', startDate, endDate, pageType],
    queryFn: async () => {
      const token = await getValidToken()
      if (!token) { logout(); throw new Error('Not authenticated') }
      const res = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate, access_token: token, pageType }),
      })
      const data = await res.json() as AnalyticsData & { needsAuth?: boolean; error?: string }
      if (data.needsAuth) { logout(); throw new Error('Session expired. Please sign in again.') }
      if (!res.ok) throw new Error(data.error || 'Failed to fetch analytics')
      return data
    },
  })
}
