import { useState, useEffect } from 'react'
import { RefreshCw, AlertCircle, Sun, Moon, MousePointerClick, Activity, Eye, Clock, PhoneCall } from 'lucide-react'
import { useAnalytics, type PageType } from '../hooks/useAnalytics'
import { formatNumber, formatDuration } from '../lib/formatters'
import StatCard from '../components/dashboard/KpiCard'
import CountriesTable from '../components/dashboard/CountriesTable'
import CitiesTable from '../components/dashboard/CitiesTable'
import { SourcesTable, MediumsTable, RegisterNowSourceTable } from '../components/dashboard/SourcesTable'
import DateRangePicker, { PRESETS, type DateRange } from '../components/dashboard/DateRangePicker'

const TABS: { id: PageType; label: string; url: string }[] = [
  { id: 'events', label: 'Events Page', url: 'lankapropertyweb.com/events/' },
  { id: 'virtual-events', label: 'Virtual Events Page', url: 'lankapropertyweb.com/events-virtual' },
]

function useTheme() {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') !== 'light')
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])
  return { dark, toggle: () => setDark(d => !d) }
}

export default function DashboardPage() {
  const { dark, toggle } = useTheme()
  const [activeTab, setActiveTab] = useState<PageType>('events')
  const [dateRange, setDateRange] = useState<DateRange>(PRESETS[2])

  const { data, isLoading, isError, error, refetch, isFetching } = useAnalytics(
    dateRange.startDate, dateRange.endDate, activeTab
  )

  const activeTabInfo = TABS.find(t => t.id === activeTab)!
  const isEventsPage = activeTab === 'events'

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="https://www.lankapropertyweb.com/images/logo/lpw_logo_v12.svg"
              alt="LankaPropertyWeb"
              className="h-8 w-auto shrink-0"
            />
            <div className="hidden sm:block">
              <h1 className="text-sm font-bold text-foreground leading-tight">Events Page</h1>
              <p className="text-[10px] text-muted-foreground">Statistics</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <button onClick={() => refetch()} disabled={isFetching}
              className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="Refresh">
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={toggle}
              className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="Toggle theme">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* ── Page Tabs ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex gap-1 p-1 rounded-xl bg-muted w-fit">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
          <span className="text-xs font-mono bg-muted px-2.5 py-1.5 rounded-lg text-muted-foreground">
            {activeTabInfo.url}
          </span>
        </div>

        {/* ── Loading ── */}
        {isLoading && (
          <div className="space-y-5 animate-pulse">
            <div className={`grid gap-4 ${isEventsPage ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-3'}`}>
              {[...Array(isEventsPage ? 4 : 3)].map((_, i) => <div key={i} className="rounded-xl h-28 bg-muted/50" />)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="rounded-xl h-64 bg-muted/50" />)}
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {isError && !isLoading && (
          <div className="glass-solid rounded-xl p-8 flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Failed to load analytics</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {error instanceof Error ? error.message : 'An unexpected error occurred'}
              </p>
            </div>
            <button onClick={() => refetch()}
              className="px-4 py-2 rounded-lg text-sm font-medium text-primary border border-primary/30 hover:bg-primary/10 transition-colors">
              Try again
            </button>
          </div>
        )}

        {/* ── Dashboard ── */}
        {data && !isLoading && (
          <>
            {/* KPI Cards */}
            <div className={`grid gap-4 ${isEventsPage ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3'}`}>
              <StatCard title="Sessions" value={formatNumber(data.kpis.sessions)} icon={Activity} accent />
              <StatCard title="Page Views" value={formatNumber(data.kpis.pageViews)} icon={Eye} />
              <StatCard title="Avg. Session Duration" value={formatDuration(data.kpis.avgSessionDuration)} icon={Clock} />
              {isEventsPage && (
                <>
                  <StatCard
                    title="Register Now Submissions"
                    value={formatNumber(data.registerNowCount)}
                    icon={MousePointerClick}
                  />
                </>
              )}
            </div>

            {/* Call Now card — Events page only, full width highlight */}
            {isEventsPage && data.callNowCount !== undefined && (
              <div className="inline-flex items-center gap-4 glass-solid rounded-xl p-4 border-l-4 border-primary">
                <div className="p-3 rounded-xl bg-primary/10">
                  <PhoneCall className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Call Now Button Clicks</p>
                  <p className="text-2xl font-bold text-foreground">{formatNumber(data.callNowCount)}</p>
                </div>
              </div>
            )}

            {/* Countries + Cities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.countries.length > 0
                ? <CountriesTable data={data.countries} />
                : <EmptyWidget title="Visitors by Country" />}
              {data.cities.length > 0
                ? <CitiesTable data={data.cities} />
                : <EmptyWidget title="Visitors by City" />}
            </div>

            {/* Source + Medium */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.sources.length > 0
                ? <SourcesTable data={data.sources} />
                : <EmptyWidget title="Events by Source" />}
              {data.mediums.length > 0
                ? <MediumsTable data={data.mediums} />
                : <EmptyWidget title="Events by Medium" />}
            </div>

            {/* Register Now Submissions by Source */}
            {isEventsPage && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.registerNowSources && data.registerNowSources.length > 0
                  ? <RegisterNowSourceTable data={data.registerNowSources} />
                  : <EmptyWidget title="Register Now by Source" />}
              </div>
            )}

            <p className="text-center text-xs text-muted-foreground pb-4">
              {activeTabInfo.label} · {dateRange.label.toLowerCase()} · {dateRange.startDate} → {dateRange.endDate}
            </p>
          </>
        )}
      </main>
    </div>
  )
}

function EmptyWidget({ title }: { title: string }) {
  return (
    <div className="glass-solid rounded-xl p-5 flex items-center justify-center min-h-[180px]">
      <p className="text-sm text-muted-foreground">{title} — no data for this period</p>
    </div>
  )
}
