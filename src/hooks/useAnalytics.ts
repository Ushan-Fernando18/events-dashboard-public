import { useQuery } from '@tanstack/react-query'

export type PageType = 'events' | 'virtual-events' | 'event-dashboard'

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
  return useQuery<AnalyticsData>({
    queryKey: ['analytics', startDate, endDate, pageType],
    queryFn: async () => {
      const res = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate, pageType }),
      })
      const data = await res.json() as AnalyticsData & { error?: string }
      if (!res.ok) throw new Error(data.error || 'Failed to fetch analytics')
      return data
    },
  })
}
