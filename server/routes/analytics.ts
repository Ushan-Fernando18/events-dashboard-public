import type { Request, Response } from 'express'

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

export async function analyticsHandler(req: Request, res: Response) {
  const { startDate, endDate, access_token, pageType } = req.body as {
    startDate: string; endDate: string; access_token: string; pageType: 'events' | 'virtual-events'
  }

  const propertyId = process.env.GA4_PROPERTY_ID
  if (!propertyId) { res.status(500).json({ error: 'GA4_PROPERTY_ID not configured' }); return }
  if (!access_token) { res.status(401).json({ needsAuth: true }); return }

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
    : pageFilter('/events-virtual')
    
  const dateRange = { startDate, endDate }

  try {
    const reports = await Promise.all([
      // 1. Main KPIs — sessions, pageViews, avgSessionDuration
      runReport(propertyId, access_token, {
        metrics: [
          { name: 'sessions' },
          { name: 'screenPageViews' },
          { name: 'averageSessionDuration' },
        ],
        dateRanges: [dateRange],
        dimensionFilter: pFilter,
      }),
      // 2. Countries — views (screenPageViews)
      runReport(propertyId, access_token, {
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'screenPageViews' }],
        dateRanges: [dateRange],
        limit: 10,
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
    const kpiRow = mainMetrics.rows?.[0]?.metricValues || []
    const kpis = {
      sessions: Number(kpiRow[0]?.value || 0),
      pageViews: Number(kpiRow[1]?.value || 0),
      avgSessionDuration: Number(kpiRow[2]?.value || 0),
      realtimeUsers,
      totalUsers24h
    }

    // Countries
    const countryRows = parseRows(countries)
    const totalCountryViews = countryRows.reduce((s, r) => s + r.value, 0)
    const countryData = countryRows.map((r) => ({
      country: r.dimension,
      views: r.value,
      percentage: totalCountryViews > 0 ? Math.round((r.value / totalCountryViews) * 100) : 0,
    }))

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
