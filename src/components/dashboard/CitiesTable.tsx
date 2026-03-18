interface CityData {
  city: string
  views: number
  percentage: number
}

export default function CitiesTable({ data }: { data: CityData[] }) {
  const max = Math.max(...data.map(d => d.views), 1)

  return (
    <div className="glass-solid rounded-xl p-5 h-full">
      <h3 className="text-sm font-semibold text-foreground mb-4">Views by City</h3>
      <div className="space-y-1.5">
        {data.map((item, i) => (
          <div
            key={item.city}
            className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-accent/40 transition-colors group"
          >
            <span
              className="text-xs font-bold w-5 h-5 rounded flex items-center justify-center shrink-0"
              style={{
                background: i < 3 ? 'rgba(139, 32, 187, 0.15)' : 'transparent',
                color: i < 3 ? '#8B20BB' : 'hsl(var(--muted-foreground))',
              }}
            >{i + 1}</span>
            <span className="text-xs font-medium text-foreground flex-1 truncate">{item.city === '(not set)' ? 'Unknown' : item.city}</span>
            <div className="w-16 h-1 rounded-full bg-muted overflow-hidden shrink-0">
              <div className="h-full rounded-full" style={{ width: `${(item.views / max) * 100}%`, background: '#8B20BB' }} />
            </div>
            <span className="text-xs text-muted-foreground w-14 text-right shrink-0">{item.views.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
