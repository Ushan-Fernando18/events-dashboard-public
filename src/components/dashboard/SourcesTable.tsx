interface RowData { name: string; sessions: number }

const SOURCE_COLORS: Record<string, string> = {
  google: '#8B20BB',
  facebook: '#1E3A8A',
  instagram: '#E1306C',
  '(direct)': '#4F46E5',
  direct: '#4F46E5',
  twitter: '#1DA1F2',
  linkedin: '#0077B5',
  email: '#7C3AED',
}
const MEDIUM_COLORS: Record<string, string> = {
  organic: '#8B20BB',
  cpc: '#1E3A8A',
  referral: '#4F46E5',
  email: '#7C3AED',
  social: '#9333EA',
  '(none)': '#64748B',
  none: '#64748B',
}

function getColor(name: string, map: Record<string, string>) {
  return map[name.toLowerCase()] || '#8B20BB'
}

function Bar({ rows, colorMap }: { rows: RowData[]; colorMap: Record<string, string> }) {
  const max = Math.max(...rows.map(d => d.sessions), 1)
  const total = rows.reduce((s, d) => s + d.sessions, 0)
  return (
    <div className="space-y-2.5">
      {rows.map((item) => {
        const pct = total > 0 ? Math.round((item.sessions / total) * 100) : 0
        const color = getColor(item.name, colorMap)
        return (
          <div key={item.name} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-foreground capitalize">{item.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{item.sessions.toLocaleString()}</span>
                <span className="text-xs font-semibold min-w-[28px] text-right" style={{ color }}>{pct}%</span>
              </div>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(item.sessions / max) * 100}%`, background: color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function SourcesTable({ data }: { data: RowData[] }) {
  return (
    <div className="glass-solid rounded-xl p-5 h-full">
      <h3 className="text-sm font-semibold text-foreground mb-4">Sessions by Source</h3>
      <Bar rows={data} colorMap={SOURCE_COLORS} />
    </div>
  )
}

export function MediumsTable({ data }: { data: RowData[] }) {
  return (
    <div className="glass-solid rounded-xl p-5 h-full">
      <h3 className="text-sm font-semibold text-foreground mb-4">Sessions by Medium</h3>
      <Bar rows={data} colorMap={MEDIUM_COLORS} />
    </div>
  )
}

export function RegisterNowSourceTable({ data }: { data: RowData[] }) {
  return (
    <div className="glass-solid rounded-xl p-5 flex flex-col min-h-[250px] max-h-[350px]">
      <h3 className="text-sm font-semibold text-foreground mb-4 shrink-0">Register Now by Source</h3>
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <Bar rows={data} colorMap={SOURCE_COLORS} />
      </div>
    </div>
  )
}

