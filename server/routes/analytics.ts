import type { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'

interface ReportRequest {
  dimensions?: { name: string }[]
  metrics: { name: string }[]
  dateRanges: { startDate: string; endDate: string }[]
  limit?: number
  dimensionFilter?: object
}

interface GA4ReportResponse {
  rows?: { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] }[]
  error?: { status: string; message: string }
}

interface RealtimeReportRequest {
  dimensions?: { name: string }[]
  metrics: { name: string }[]
  dimensionFilter?: object
}

async function runReport(propertyId: string, accessToken: string, body: ReportRequest): Promise<GA4ReportResponse> {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )
  return res.json() as Promise<GA4ReportResponse>
}

async function runRealtimeReport(propertyId: string, accessToken: string, body: RealtimeReportRequest): Promise<GA4ReportResponse> {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )
  return res.json() as Promise<GA4ReportResponse>
}

function parseRows(data: GA4ReportResponse) {
  return (data.rows || []).map((row) => ({
    dimension: row.dimensionValues?.[0]?.value || '',
    value: Number(row.metricValues?.[0]?.value || 0),
  }))
}

function pageFilter(path: string) {
  return {
    filter: {
      fieldName: 'pagePath',
      stringFilter: { matchType: 'CONTAINS', value: path, caseSensitive: false },
    },
  }
}

function eventFilter(eventName: string) {
  return {
    filter: {
      fieldName: 'eventName',
      stringFilter: { matchType: 'EXACT', value: eventName, caseSensitive: false },
    },
  }
}

function labelFilter(label: string) {
  return {
    filter: {
      fieldName: 'customEvent:event_label',
      stringFilter: { matchType: 'CONTAINS', value: label, caseSensitive: false },
    },
  }
}

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

export async function analyticsHandler(req: Request, res: Response) {
  const { startDate, endDate, pageType } = req.body as {
    startDate: string; endDate: string; pageType: 'events' | 'virtual-events' | 'event-dashboard'
  }

  const propertyId = process.env.GA4_PROPERTY_ID
  let refreshToken = process.env.GA4_REFRESH_TOKEN
  try {
    const tokenPath = path.join(process.cwd(), '.ga4_token.json')
    if (fs.existsSync(tokenPath)) {
      const data = JSON.parse(fs.readFileSync(tokenPath, 'utf8'))
      if (data.refresh_token) refreshToken = data.refresh_token
    }
  } catch (err) {}

  const isMockMode = !propertyId || !refreshToken || refreshToken === 'paste-your-refresh-token-here'

  if (isMockMode) {
    // Generate mock data for visualization purposes
    const kpis = {
      sessions: Math.floor(Math.random() * 5000) + 10000,
      pageViews: Math.floor(Math.random() * 15000) + 30000,
      avgSessionDuration: Math.floor(Math.random() * 60) + 120,
      realtimeUsers: Math.floor(Math.random() * 50) + 10,
      totalUsers24h: Math.floor(Math.random() * 500) + 1000
    }
    const countries = [
      { country: 'Sri Lanka', views: 45000, percentage: 45 },
      { country: 'United States', views: 25000, percentage: 25 },
      { country: 'United Kingdom', views: 15000, percentage: 15 },
      { country: 'Australia', views: 10000, percentage: 10 },
      { country: 'Canada', views: 5000, percentage: 5 }
    ]
    const cities = [
      { city: 'Colombo', views: 30000, percentage: 30 },
      { city: 'New York', views: 15000, percentage: 15 },
      { city: 'London', views: 10000, percentage: 10 },
      { city: 'Sydney', views: 8000, percentage: 8 },
      { city: 'Toronto', views: 5000, percentage: 5 }
    ]
    const sources = [
      { name: 'google', sessions: 8000 },
      { name: '(direct)', sessions: 5000 },
      { name: 'facebook', sessions: 3000 }
    ]
    const mediums = [
      { name: 'organic', sessions: 7000 },
      { name: '(none)', sessions: 5000 },
      { name: 'social', sessions: 3000 }
    ]
    const registerNowCount = Math.floor(Math.random() * 100) + 50
    const registerNowSources = [
      { name: 'facebook', sessions: Math.floor(registerNowCount * 0.5) },
      { name: 'google', sessions: Math.floor(registerNowCount * 0.3) },
      { name: '(direct)', sessions: Math.floor(registerNowCount * 0.2) }
    ]
    const callNowCount = pageType === 'events' ? Math.floor(Math.random() * 50) + 20 : undefined

    return res.json({ kpis, countries, cities, sources, mediums, registerNowCount, registerNowSources, callNowCount })
  }

  try {
    const access_token = await getAccessTokenFromRefreshToken(refreshToken!)

  // Base filter for the events page (matches both 'event/' and 'events/')
  const isEventsPage = pageType === 'events'
  const pFilter = isEventsPage 
    ? {
        orGroup: {
          expressions: [
            pageFilter('/event/'),
            pageFilter('/events/')
          ]
        }
      }
    : pageType === 'event-dashboard'
      ? {
          filter: {
            fieldName: 'pagePathPlusQueryString',
            stringFilter: { matchType: 'CONTAINS', value: 'events', caseSensitive: false },
          },
        }
      : pageFilter('/events-virtual')
    
  const dateRange = { startDate, endDate }

    const reports = await Promise.all([
      // 1. Main KPIs — sessions, pageViews, avgSessionDuration
      runReport(propertyId, access_token, {
        dimensions: pageType === 'event-dashboard' ? [{ name: 'pagePathPlusQueryString' }] : undefined,
        metrics: pageType === 'event-dashboard' ? [{ name: 'screenPageViews' }] : [
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'averageSessionDuration' },
        ],
        dateRanges: [dateRange],
        dimensionFilter: pFilter,
      }),
      // 2. Countries — views (screenPageViews)
      runReport(propertyId, access_token, {
        dimensions: pageType === 'event-dashboard' ? [{ name: 'country' }, { name: 'pagePathPlusQueryString' }] : [{ name: 'country' }],
        metrics: [{ name: 'screenPageViews' }],
        dateRanges: [dateRange],
        limit: pageType === 'event-dashboard' ? 10000 : 15,
        dimensionFilter: pFilter,
      }),
      // 3. Cities
      runReport(propertyId, access_token, {
        dimensions: [{ name: 'city' }],
        metrics: [{ name: 'screenPageViews' }],
        dateRanges: [dateRange],
        limit: 15,
        dimensionFilter: pFilter,
      }),
      // 4. By Source — sessions
      runReport(propertyId, access_token, {
        dimensions: [{ name: 'sessionSource' }],
        metrics: [{ name: 'sessions' }],
        dateRanges: [dateRange],
        limit: 10,
        dimensionFilter: pFilter,
      }),
      // 5. By Medium — sessions
      runReport(propertyId, access_token, {
        dimensions: [{ name: 'sessionMedium' }],
        metrics: [{ name: 'sessions' }],
        dateRanges: [dateRange],
        limit: 10,
        dimensionFilter: pFilter,
      }),
      // 6. Register Now submissions — eventName=submit, label=2026_register_online_expo
      runReport(propertyId, access_token, {
        dimensions: [{ name: 'sessionSource' }],
        metrics: [{ name: 'eventCount' }],
        dateRanges: [dateRange],
        dimensionFilter: {
          andGroup: {
            expressions: [
              pFilter,
              eventFilter('submit'),
              labelFilter('2026_register_online_expo'),
            ],
          },
        },
      }),
      // 7. Call Now clicks — eventName=click, label=2026_expo_tel (events page only)
      isEventsPage ? runReport(propertyId, access_token, {
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }],
        dateRanges: [dateRange],
        dimensionFilter: {
          andGroup: {
            expressions: [
              pFilter,
              eventFilter('click'),
              labelFilter('2026_expo_tel'),
            ],
          },
        },
      }) : Promise.resolve({ rows: [] }),
      // 8. Users in last 24h
      runReport(propertyId, access_token, {
        metrics: [{ name: 'totalUsers' }],
        dateRanges: [{ startDate: '1daysAgo', endDate: 'today' }],
        dimensionFilter: {
          filter: {
            fieldName: 'pagePath',
            stringFilter: { matchType: 'CONTAINS', value: 'events-virtual', caseSensitive: false },
          },
        },
      }),
      // 9. Realtime Users (Last 30m)
      runRealtimeReport(propertyId, access_token, {
        metrics: [{ name: 'activeUsers' }],
        dimensionFilter: {
          filter: {
            fieldName: 'pagePath',
            stringFilter: { matchType: 'CONTAINS', value: 'events-virtual', caseSensitive: false },
          },
        },
      }),
    ])

    const [mainMetrics, countries, cities, sources, mediums, registerNow, callNow, users24h, realtime] = reports

    if (mainMetrics.error?.status === 'UNAUTHENTICATED' || mainMetrics.error?.status === 'PERMISSION_DENIED') {
      res.status(401).json({ needsAuth: true }); return
    }

    // Users (24h and Realtime)
    const totalUsers24h = Number(users24h.rows?.[0]?.metricValues?.[0]?.value || 0)
    const realtimeUsers = Number(realtime.rows?.[0]?.metricValues?.[0]?.value || 0)

    // KPIs
    let kpiSessions = 0
    let kpiPageViews = 0
    let kpiAvgDuration = 0

    if (pageType === 'event-dashboard') {
      kpiPageViews = (mainMetrics.rows || []).reduce((sum, row) => sum + Number(row.metricValues?.[0]?.value || 0), 0)
    } else {
      const kpiRow = mainMetrics.rows?.[0]?.metricValues || []
      kpiSessions = Number(kpiRow[0]?.value || 0)
      kpiPageViews = Number(kpiRow[1]?.value || 0)
      kpiAvgDuration = Number(kpiRow[2]?.value || 0)
    }

    const kpis = {
      sessions: kpiSessions,
      pageViews: kpiPageViews,
      avgSessionDuration: kpiAvgDuration,
      realtimeUsers,
      totalUsers24h
    }

    // Countries
    let countryData = []
    if (pageType === 'event-dashboard') {
      const mapped = new Map<string, number>()
      for(const row of (countries.rows || [])) {
        const c = row.dimensionValues?.[0]?.value || ''
        const v = Number(row.metricValues?.[0]?.value || 0)
        mapped.set(c, (mapped.get(c) || 0) + v)
      }
      const countryRows = Array.from(mapped.entries()).map(([dimension, value]) => ({ dimension, value }))
      countryRows.sort((a,b) => b.value - a.value)
      const topRows = countryRows.slice(0, 15)
      const totalCountryViews = topRows.reduce((sum, r) => sum + r.value, 0)
      countryData = topRows.map(r => ({
        country: r.dimension,
        views: r.value,
        percentage: totalCountryViews > 0 ? Math.round((r.value / totalCountryViews) * 100) : 0,
      }))
    } else {
      const countryRows = parseRows(countries)
      const totalCountryViews = countryRows.reduce((s, r) => s + r.value, 0)
      countryData = countryRows.map((r) => ({
        country: r.dimension,
        views: r.value,
        percentage: totalCountryViews > 0 ? Math.round((r.value / totalCountryViews) * 100) : 0,
      }))
    }

    // Cities
    const cityRows = parseRows(cities)
    const totalCityViews = cityRows.reduce((s, r) => s + r.value, 0)
    const cityData = cityRows.map((r) => ({
      city: r.dimension,
      views: r.value,
      percentage: totalCityViews > 0 ? Math.round((r.value / totalCityViews) * 100) : 0,
    }))

    // Sources
    const sourceData = parseRows(sources).map((r) => ({ name: r.dimension || '(direct)', sessions: r.value }))
    const mediumData = parseRows(mediums).map((r) => ({ name: r.dimension || '(none)', sessions: r.value }))

    // Event counts
    const registerNowCount = (registerNow.rows || []).reduce((s, r) => s + Number(r.metricValues?.[0]?.value || 0), 0)
    const rawRegisterNowSources = parseRows(registerNow).map(r => {
      let name = (r.dimension || '(direct)').toLowerCase()
      if (name.includes('facebook')) name = 'facebook'
      if (name.includes('instagram')) name = 'instagram'
      return { name, sessions: r.value }
    })
    
    const aggregatedSources: Record<string, number> = {}
    for (const source of rawRegisterNowSources) {
      aggregatedSources[source.name] = (aggregatedSources[source.name] || 0) + source.sessions
    }
    
    const registerNowSources = Object.entries(aggregatedSources)
      .map(([name, sessions]) => ({ name, sessions }))
      .sort((a, b) => b.sessions - a.sessions)
    const callNowCount = isEventsPage
      ? (callNow.rows || []).reduce((s, r) => s + Number(r.metricValues?.[0]?.value || 0), 0)
      : undefined

    res.json({ kpis, countries: countryData, cities: cityData, sources: sourceData, mediums: mediumData, registerNowCount, registerNowSources, callNowCount })
  } catch (err) {
    console.error('Analytics error:', err)
    res.status(500).json({ error: 'Failed to fetch analytics data' })
  }
}
