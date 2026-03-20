import { useState, useEffect } from 'react'
import { Eye, RefreshCw, ShieldOff } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useAnalytics } from '../hooks/useAnalytics'
import { usePublicAnalytics } from '../hooks/usePublicAnalytics'
import { formatNumber } from '../lib/formatters'
import CountriesTable from '../components/dashboard/CountriesTable'
import WorldMap from '../components/dashboard/WorldMap'

export default function EventDashboardPage() {
  const [searchParams] = useSearchParams()
  const accessKey = searchParams.get('access') ?? ''
  const isPublicMode = accessKey.length > 0

  const [activeView, setActiveView] = useState<'standard' | 'map'>('standard')

  // ── Internal mode: OAuth-based analytics ──────────────────────────────────
  const getDates = () => {
    const end = new Date()
    const start = new Date()
    start.setHours(start.getHours() - 72)
    const fmt = (d: Date) => d.toISOString().split('T')[0]
    return { startDate: fmt(start), endDate: fmt(end) }
  }
  const { startDate, endDate } = getDates()
  const internalQuery = useAnalytics(startDate, endDate, 'virtual-events')

  // ── Public mode: Service-Account-based analytics ──────────────────────────
  const publicQuery = usePublicAnalytics(accessKey)

  // Pick the right source
  const { data, isLoading, isError, error, refetch, isFetching } = isPublicMode
    ? { ...publicQuery, refetch: publicQuery.refetch, isFetching: publicQuery.isFetching }
    : internalQuery

  // Live time updater
  const [currentTime, setCurrentTime] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // ── Access Denied screen (public mode, wrong/missing key) ─────────────────
  if (isPublicMode && isError) {
    return (
      <div className="h-screen w-full bg-white flex flex-col items-center justify-center gap-6">
        <ShieldOff className="h-16 w-16 text-red-400" />
        <h1 className="text-2xl font-black text-slate-800">Access Denied</h1>
        <p className="text-slate-500 text-sm max-w-xs text-center">
          The link you used is invalid or has expired. Please contact the dashboard owner for a new link.
        </p>
      </div>
    )
  }

  return (
    <div className="h-screen w-full bg-gradient-to-br from-[#002686] via-[#0540ad] via-[#0543b6] via-[#450c55] to-[#9324b1] relative selection:bg-white/20 flex flex-col overflow-hidden">
      {/* ── Event Header ── */}
      <div className="w-full flex flex-col items-center justify-center pt-6 pb-2 shrink-0 relative z-10">
        <div className="flex items-center gap-2 mb-2 animate-fade-in">
          <img src="/lpwlogo11.png" alt="LankaPropertyWeb Logo" className="h-10 w-auto object-contain drop-shadow-2xl" />
        </div>
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter text-center uppercase drop-shadow-2xl mb-4">
          LANKA PROPERTY SHOW 2026 <span className="text-[#FFD300] ml-3 font-black drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">- VIRTUAL</span>
        </h1>
        
        {/* Horizontal Status & Controls Bar */}
        <div className="flex items-center gap-4 flex-wrap justify-center px-4 max-w-full mt-2 animate-fade-in">
          {/* Box 1: Date & Time */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl shadow-lg ring-1 ring-white/5">
             <div className="flex flex-col items-center border-r border-white/10 pr-3">
               <span className="text-xs font-bold text-white whitespace-nowrap uppercase tracking-tighter">
                 {currentTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
               </span>
               <span className="text-[10px] font-medium text-white/50 tabular-nums uppercase leading-none">
                 {currentTime.getFullYear()}
               </span>
             </div>
             <div className="flex flex-col items-center">
               <span className="text-sm font-black text-white tabular-nums leading-none">
                 {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </span>
               <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest mt-0.5">
                 {currentTime.toLocaleTimeString([], { second: '2-digit', hour12: true }).split(' ')[1]}
               </span>
             </div>
          </div>

          {/* Box 2: Live Now & Active Users */}
          <div className="flex items-center gap-6 bg-white/90 backdrop-blur-md border border-white/20 px-6 py-3 rounded-xl shadow-lg ring-1 ring-white/5 transition-all hover:bg-white/15">
             <div className="flex items-center gap-3 pr-4 border-r border-white/10">
               <div className="h-3 w-3 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.8)]"></div>
               <span className="text-[12px] font-bold text-red-600 uppercase tracking-[0.2em] whitespace-nowrap">Live Now</span>
             </div>
             <div className="flex items-center gap-3">
               <span className="text-[12px] font-bold text-green-600 uppercase tracking-widest whitespace-nowrap">Active Visitors</span>
               <span className="text-2xl font-black text-black/90 leading-none tabular-nums tracking-tighter">
                 {data ? formatNumber(data.kpis.totalUsers24h) : '...'}
               </span>
               <div className="h-3 w-3 rounded-full bg-emerald-600 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)] mb-1"></div>
             </div>
          </div>

          {/* Box 3: Compact Controls */}
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 p-1.5 rounded-xl shadow-lg">
              <button 
                onClick={() => setActiveView('standard')}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                  activeView === 'standard' ? 'bg-white text-[#002686] shadow-md scale-105' : 'text-white/50 hover:text-white'
                }`}>
                Overview
              </button>
              <button 
                onClick={() => setActiveView('map')}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                  activeView === 'map' ? 'bg-white text-[#002686] shadow-md scale-105' : 'text-white/50 hover:text-white'
                }`}>
                Map View
              </button>
            <div className="w-px h-3.5 bg-white/10 mx-1" />
            <button onClick={() => refetch()} disabled={isFetching}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all group" title="Refresh">
              <RefreshCw className={`h-3 w-3 ${isFetching ? 'animate-spin' : ''}`} />
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


            {/* Main Grid: 35% / 65% */}
            <div className="flex-1 min-h-0 relative">
              {activeView === 'standard' ? (
                <div className="grid grid-cols-[35%_65%] gap-4 h-full w-full">
                  {/* Left Side - KPI & Table */}
                  <div className="flex flex-col gap-4 h-full min-h-0">
                    {/* KPI Box (Same style as Map Sidebar) */}
                    <div className="flex shrink-0">
                      <div className="w-full bg-white/95 backdrop-blur-sm border border-white/20 p-2 rounded-xl shadow-lg flex flex-col items-center justify-center transform hover:scale-[1.002] transition-all duration-300">
                        <div className="flex items-center gap-2 mb-1">
                          <Eye className="h-5 w-5 text-blue-500" />
                          <span className="text-[14px] font-black text-slate-400 uppercase tracking-widest">Total Virtual Event Visitors</span>
                        </div>
                        <span className="text-2xl font-black text-slate-900 tracking-tighter tabular-nums">{formatNumber(data.kpis.pageViews)}</span>
                      </div>
                    </div>

                    {/* Table */}
                    <div className="flex flex-col flex-1 gradient-border-premium rounded-2xl shadow-2xl overflow-hidden hover:scale-[1.005] transition-transform duration-500">
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

                  {/* Sidebar Overlay - KPIs & Views Table */}
                  <div className="absolute top-4 left-4 z-10 flex flex-col gap-2.5 w-[420px] max-h-[calc(100%-2rem)] pointer-events-none">
                    {/* KPI Box */}
                    <div className="flex shrink-0 pointer-events-auto">
                      <div className="w-full bg-white/95 backdrop-blur-md border border-white/20 p-2 rounded-xl shadow-2xl flex flex-col items-center justify-center transform hover:scale-[1.02] transition-all duration-300">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Eye className="h-4 w-4 text-blue-500" />
                          <span className="text-[14px] font-black text-slate-500 uppercase tracking-widest">Total Virtual Event Visitors</span>
                        </div>
                        <span className="text-2xl font-black text-slate-900 tracking-tighter tabular-nums">{formatNumber(data.kpis.pageViews)}</span>
                      </div>
                    </div>
                    
                    {/* Countries Table */}
                    <div className="flex-1 overflow-hidden bg-white/90 backdrop-blur-md border border-slate-200 rounded-2xl shadow-2xl flex flex-col min-h-0 pointer-events-auto">
                      {/* <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <span className="text-[11px] font-black text-[#002686] uppercase tracking-widest">Views by Country</span>
                        <div className="flex gap-1">
                          <div className="h-1 w-1 rounded-full bg-blue-400"></div>
                          <div className="h-1 w-1 rounded-full bg-blue-300"></div>
                        </div>
                      </div> */}
                      <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <CountriesTable data={data.countries} className="bg-transparent border-none shadow-none p-2" />
                      </div>
                    </div>
                  </div>

                  {/* Subtle Overlay Elements */}
                  <div className="absolute top-0 inset-0 pointer-events-none bg-gradient-to-b from-slate-400/5 via-transparent to-slate-500/10"></div>
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
