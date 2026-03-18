import { cn } from '../../lib/utils'

interface CountryData {
  country: string
  views: number
  percentage: number
}

export default function CountriesTable({ data, className }: { data: CountryData[], className?: string }) {
  return (
    <div className={cn("glass-solid rounded-xl p-5 h-full", className)}>
      <h3 className="text-sm font-semibold text-foreground mb-4">Views by Country</h3>
      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={item.country} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-5 shrink-0 text-right">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium text-foreground truncate">{item.country}</span>
                <span className="text-xs text-muted-foreground ml-2 shrink-0">{item.views.toLocaleString()}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${item.percentage}%`, background: 'linear-gradient(90deg, #8B20BB, #1E3A8A)' }}
                />
              </div>
            </div>
            <span className="text-xs text-muted-foreground w-8 text-right shrink-0">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
