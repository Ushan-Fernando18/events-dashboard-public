import type { Request, Response } from 'express'

// ─── Helpers ────────────────────────────────────────────────────────────────

interface GA4Row {
  dimensionValues?: { value: string }[]
  metricValues?: { value: string }[]
}

interface GA4Response {
  rows?: GA4Row[]
  error?: { status: string; message: string; code?: number }
}

/** Use the stored refresh token to get a short-lived access token */
async function getAccessTokenFromRefreshToken(refreshToken: string): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: 'refresh_token',
    }),
  })
  const data = await res.json() as { access_token?: string; error?: string }
  if (!data.access_token) throw new Error(`Token refresh failed: ${JSON.stringify(data)}`)
  return data.access_token
}

async function runGA4Report(propertyId: string, token: string, body: object): Promise<GA4Response> {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  )
  return res.json() as Promise<GA4Response>
}

async function runGA4RealtimeReport(propertyId: string, token: string, body: object): Promise<GA4Response> {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  )
  return res.json() as Promise<GA4Response>
}

function parseRows(data: GA4Response) {
  return (data.rows || []).map(row => ({
    dimension: row.dimensionValues?.[0]?.value || '',
    value: Number(row.metricValues?.[0]?.value || 0),
  }))
}

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function publicStatsHandler(req: Request, res: Response) {
  // 1. Validate the secret access key
  const accessKey = req.headers['x-access-key'] as string | undefined
  const secretKey = process.env.PUBLIC_DASHBOARD_KEY
  if (!secretKey || !accessKey || accessKey !== secretKey) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  // 2. Validate required env vars
  const propertyId = process.env.GA4_PROPERTY_ID
  const refreshToken = process.env.GA4_REFRESH_TOKEN
  if (!propertyId || !refreshToken) {
    res.status(500).json({ error: 'Server not configured for public stats. GA4_REFRESH_TOKEN is missing.' })
    return
  }

  try {
    // 3. Exchange refresh token → fresh access token
    const token = await getAccessTokenFromRefreshToken(refreshToken)

    const virtualFilter = {
      filter: {
        fieldName: 'pagePath',
        stringFilter: { matchType: 'CONTAINS', value: 'events-virtual', caseSensitive: false },
      },
    }

    // Date range: last 72 hours
    const end = new Date()
    const start = new Date()
    start.setHours(start.getHours() - 72)
    const fmt = (d: Date) => d.toISOString().split('T')[0]
    const dateRange = { startDate: fmt(start), endDate: fmt(end) }

    // 4. Run all GA4 reports in parallel
    const [mainMetrics, countries, users24h, realtime] = await Promise.all([
      runGA4Report(propertyId, token, {
        metrics: [{ name: 'screenPageViews' }, { name: 'sessions' }],
        dateRanges: [dateRange],
        dimensionFilter: virtualFilter,
      }),
      runGA4Report(propertyId, token, {
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'screenPageViews' }],
        dateRanges: [dateRange],
        limit: 20,
        dimensionFilter: virtualFilter,
      }),
      runGA4Report(propertyId, token, {
        metrics: [{ name: 'totalUsers' }],
        dateRanges: [{ startDate: '1daysAgo', endDate: 'today' }],
        dimensionFilter: virtualFilter,
      }),
      runGA4RealtimeReport(propertyId, token, {
        metrics: [{ name: 'activeUsers' }],
        dimensionFilter: virtualFilter,
      }),
    ])

    // 5. Check for auth errors from GA4 (e.g. revoked token)
    if (
      mainMetrics.error?.status === 'UNAUTHENTICATED' ||
      mainMetrics.error?.status === 'PERMISSION_DENIED'
    ) {
      res.status(401).json({ error: 'GA4 token is invalid or revoked. Please update GA4_REFRESH_TOKEN.' })
      return
    }

    // 6. Shape the response
    const kpiRow = mainMetrics.rows?.[0]?.metricValues || []
    const pageViews = Number(kpiRow[0]?.value || 0)
    const sessions = Number(kpiRow[1]?.value || 0)
    const totalUsers24h = Number(users24h.rows?.[0]?.metricValues?.[0]?.value || 0)
    const realtimeUsers = Number(realtime.rows?.[0]?.metricValues?.[0]?.value || 0)

    const countryRows = parseRows(countries)
    const totalViews = countryRows.reduce((s, r) => s + r.value, 0)
    const countryData = countryRows.map(r => ({
      country: r.dimension,
      views: r.value,
      percentage: totalViews > 0 ? Math.round((r.value / totalViews) * 100) : 0,
    }))

    res.json({
      kpis: { pageViews, sessions, realtimeUsers, totalUsers24h, avgSessionDuration: 0 },
      countries: countryData,
      cities: [],
      sources: [],
      mediums: [],
      registerNowCount: 0,
      registerNowSources: [],
    })
  } catch (err) {
    console.error('Public stats error:', err)
    res.status(500).json({ error: 'Failed to fetch public stats' })
  }
}
