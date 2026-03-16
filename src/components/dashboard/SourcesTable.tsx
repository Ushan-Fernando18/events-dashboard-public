interface RowData { name: string; sessions: number }

const SOURCE_COLORS: Record<string, string> = {
  google: 'hsl(145 72% 32%)',
  facebook: 'hsl(220 80% 55%)',
  instagram: 'hsl(300 60% 55%)',
  '(direct)': 'hsl(160 55% 45%)',
  direct: 'hsl(160 55% 45%)',
  twitter: 'hsl(200 80% 55%)',
  linkedin: 'hsl(210 80% 50%)',
  email: 'hsl(38 85% 55%)',
}
const MEDIUM_COLORS: Record<string, string> = {
  organic: 'hsl(145 72% 32%)',
  cpc: 'hsl(220 80% 55%)',
  referral: 'hsl(38 85% 55%)',
  email: 'hsl(25 80% 55%)',
  social: 'hsl(300 60% 55%)',
  '(none)': 'hsl(160 40% 50%)',
  none: 'hsl(160 40% 50%)',
}

function getColor(name: string, map: Record<string, string>) {
  return map[name.toLowerCase()] || 'hsl(145 55% 42%)'
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

