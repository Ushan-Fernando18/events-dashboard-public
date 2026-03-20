import { useQuery } from '@tanstack/react-query'
import type { AnalyticsData } from './useAnalytics'

/**
 * Fetches public event-dashboard stats without requiring a Google login.
 * The `accessKey` is passed as a custom header so it never appears in the
 * response body or in browser network logs as a query param value.
 */
export function usePublicAnalytics(accessKey: string) {
  return useQuery<AnalyticsData>({
    queryKey: ['public-analytics', accessKey],
    queryFn: async () => {
      const res = await fetch('/api/public-stats', {
        headers: { 'x-access-key': accessKey },
      })
      const data = await res.json() as AnalyticsData & { error?: string }
      if (!res.ok) throw new Error(data.error || 'Failed to fetch public stats')
      return data
    },
    // Refresh every 2 minutes automatically
    refetchInterval: 2 * 60 * 1000,
    retry: 1,
  })
}
