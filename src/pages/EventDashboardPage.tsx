import { useState, useEffect } from 'react'
import { Activity, Eye, RefreshCw } from 'lucide-react'
import { useAnalytics, type PageType } from '../hooks/useAnalytics'
import { formatNumber } from '../lib/formatters'
import StatCard from '../components/dashboard/KpiCard'
import CountriesTable from '../components/dashboard/CountriesTable'
import WorldMap from '../components/dashboard/WorldMap'

export default function EventDashboardPage() {
  const [activeTab] = useState<PageType>('virtual-events')
  const [activeView, setActiveView] = useState<'standard' | 'map'>('standard')
  
  // Date calculation (Hardcoded to last 48 hours)
  const getDates = () => {
    const end = new Date()
    const start = new Date()
    start.setHours(start.getHours() - 72) // 48h data usually spans 3 calendar days in GA4 for full coverage
    
    const formatDate = (d: Date) => d.toISOString().split('T')[0]
    return { startDate: formatDate(start), endDate: formatDate(end) }
  }

  const { startDate, endDate } = getDates()
  
  const { data, isLoading, isError, error, refetch, isFetching } = useAnalytics(
    startDate, endDate, activeTab
  )

  // Live time updater
  const [currentTime, setCurrentTime] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="h-screen w-full bg-gradient-to-br from-[#002686] via-[#0540ad] via-[#0543b6] via-[#450c55] to-[#9324b1] relative selection:bg-white/20 flex flex-col overflow-hidden">
      {/* ── Event Header ── */}
      <div className="w-full flex flex-col items-center justify-center pt-4 pb-4 shrink-0 relative z-10">
        <div className="flex items-center gap-2 mb-1 animate-fade-in">
          <img src="/lpwlogo11.png" alt="LankaPropertyWeb Logo" className="h-12 w-auto object-contain drop-shadow-2xl" />
        </div>
        <h1 className="text-2xl sm:text-4xl md:text-4xl font-black text-white tracking-tighter text-center uppercase drop-shadow-2xl">
          LANKA PROPERTY SHOW 2026 <span className="text-[#FFD300] ml-3 font-black drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">- VIRTUAL</span>
        </h1>
         {/* Live Status & Controls Row */}
        <div className="flex items-center justify-center gap-6 mt-4 flex-wrap">
          <div className="flex items-center gap-4">
            {/* Live Now Box */}
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-red-600 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-200"></div>
              <div className="relative flex items-center gap-2 bg-card border-2 border-red-600/90 px-5 py-2.5 rounded-lg shadow-xl">
                <div className="h-2.5 w-2.5 rounded-full bg-red-600 animate-pulse"></div>
                <span className="text-sm font-bold text-red-600 uppercase tracking-widest">Live Now</span>
              </div>
            </div>

            {/* Current Time Box */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2.5 rounded-lg shadow-sm">
              <span className="text-sm font-medium text-white tabular-nums">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex gap-1 p-1 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-sm">
              <button 
                onClick={() => setActiveView('standard')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeView === 'standard' ? 'bg-white/20 text-white shadow-sm' : 'text-white/60 hover:text-white'
                }`}>
                Overview
              </button>
              <button 
                onClick={() => setActiveView('map')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeView === 'map' ? 'bg-white/20 text-white shadow-sm' : 'text-white/60 hover:text-white'
                }`}>
                Map View
              </button>
            </div>

            {/* Refresh Button */}
            <button onClick={() => refetch()} disabled={isFetching}
              className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white transition-all shadow-sm flex items-center justify-center group" title="Refresh Analytics">
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 w-full max-w-[1700px] mx-auto px-4 sm:px-6 pb-2 flex flex-col min-h-0 relative z-10 gap-4">
        
        {/* ── Error & Loading States ── */}
        {isError && !isLoading && (
          <div className="glass-solid rounded-xl p-8 flex flex-col items-center justify-center gap-4 text-center mx-auto border-red-500/20 h-full w-full">
            <div className="text-sm text-muted-foreground mt-1">
              Failed to load analytics: {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </div>
          </div>
        )}

        {/* ── Loading State ── */}
        {isLoading && (
          <div className="w-full flex-1 flex flex-col gap-6 animate-pulse">
            <div className="grid grid-cols-3 gap-6 shrink-0 h-32">
               <div className="rounded-2xl h-full bg-white/10" />
               <div className="rounded-2xl h-full bg-white/10" />
               <div className="rounded-2xl h-full bg-white/10" />
            </div>
            <div className="grid grid-cols-[35%_65%] gap-6 flex-1 min-h-0">
               <div className="rounded-2xl h-full bg-white/10" />
               <div className="rounded-2xl h-full bg-white/10" />
            </div>
          </div>
        )}

        {/* ── Dashboard Content ── */}
        {data && !isLoading && (
          <div className="flex-1 w-full flex flex-col gap-4 min-h-0">
            {/* Central KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0 max-w-[1000px] mx-auto max-w-screen-sm">
              <div className="transform hover:scale-[1.02] transition-transform duration-300">
                <StatCard title="Page Views" value={formatNumber(data.kpis.pageViews)} icon={Eye} className="gradient-border-premium shadow-xl" />
              </div>
              <div className="transform hover:scale-[1.02] transition-transform duration-300">
                <StatCard title="Sessions" value={formatNumber(data.kpis.sessions)} icon={Activity} className="gradient-border-premium shadow-xl" />
              </div>
              <div className="transform hover:scale-[1.02] transition-transform duration-300">
                <StatCard 
                  title="Active Users" 
                  value={formatNumber(data.kpis.totalUsers24h)} 
                  // subtitle="Last 24 Hours"
                  icon={RefreshCw} 
                  className="gradient-border-premium shadow-xl" 
                />
              </div>
            </div>

            {/* Main Grid: 35% / 65% */}
            <div className="flex-1 min-h-0 relative">
              {activeView === 'standard' ? (
                <div className="grid grid-cols-[35%_65%] gap-4 h-full w-full">
                  {/* Left Side - Table */}
                  <div className="flex flex-col h-full gradient-border-premium rounded-2xl shadow-2xl overflow-hidden hover:scale-[1.005] transition-transform duration-500">
                    {data.countries.length > 0
                      ? (
                        <div className="h-full overflow-y-auto w-full custom-scrollbar">
                          {/* <div className="p-4 border-b border-border/10 bg-muted/5 flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Views by Country</span>
                          </div> */}
                          <CountriesTable data={data.countries} />
                        </div>
                      )
                      : <div className="p-8 h-full flex items-center justify-center text-muted-foreground text-sm">No country data available for this period.</div>}
                  </div>

                  {/* Right Side - Map Heatmap */}
                  <div className="flex flex-col h-full bg-transparent rounded-2xl border border-border/40 shadow-xl overflow-hidden hover:border-primary/20 transition-colors duration-500">
                    <WorldMap data={data.countries} />
                  </div>
                </div>
              ) : (
                <div className="h-full w-full relative bg-slate-250 dark:bg-slate-900/70 rounded-3xl border border-border/40 shadow-2xl overflow-hidden group/map-view">
                  {/* Background Full-Screen Map */}
                  <div className="absolute inset-0 z-0">
                    <WorldMap data={data.countries} />
                  </div>

                  {/* Sidebar Overlay - Reusing consistent style but floating */}
                  <div className="absolute top-6 left-6 z-10 flex flex-col gap-4 w-[400px] max-h-[calc(100%-3rem)] pointer-events-none">
                    <div className="gradient-border-premium !bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto min-h-0">
                        {/* <div className="p-4 border-b border-border/10 bg-muted/5 flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Country Traffic</span>
                        </div> */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                          <CountriesTable data={data.countries} className="bg-transparent border-none shadow-none p-4" />
                        </div>
                    </div>
                  </div>

                  {/* Subtle Overlay Elements */}
                  <div className="absolute top-0 inset-0 pointer-events-none bg-gradient-to-b from-slate-400/10 via-transparent to-slate-500/20"></div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      
      {/* Background Ornaments (Subtle Green glow) */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none -z-10" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-primary/10 blur-[100px] pointer-events-none -z-10" />
    </div>
  )
}
