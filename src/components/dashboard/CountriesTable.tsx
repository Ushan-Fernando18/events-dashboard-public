import { cn } from '../../lib/utils'

interface CountryData {
  country: string
  views: number
  percentage: number
}

const countryToIso: Record<string, string> = {
  "Sri Lanka": "lk",
  "India": "in",
  "United States": "us",
  "United Kingdom": "gb",
  "Australia": "au",
  "United Arab Emirates": "ae",
  "Saudi Arabia": "sa",
  "Maldives": "mv",
  "Canada": "ca",
  "Oman": "om",
  "Kuwait": "kw",
  "Qatar": "qa",
  "Singapore": "sg",
  "Italy": "it",
  "France": "fr",
  "Germany": "de",
  "Japan": "jp",
  "New Zealand": "nz",
  "Bahrain": "bh",
  "Netherlands": "nl",
  "Switzerland": "ch",
  "South Korea": "kr",
  "Malaysia": "my",
  "Bangladesh": "bd",
  "Pakistan": "pk",
  "Ireland": "ie",
  "Sweden": "se"
}

export default function CountriesTable({ data, className }: { data: CountryData[], className?: string }) {
  const top15 = data.slice(0, 15);
  
  return (
    <div className={cn("bg-white rounded-xl p-4 h-full flex flex-col shadow-inner", className)}>
      <h3 className="text-sm font-bold text-[#002686] mb-2 uppercase tracking-tight">Visitors by Country</h3>
      <div className="flex flex-col gap-1 pr-1">
        {top15.map((item, i) => {
          const isoCode = countryToIso[item.country]
          return (
            <div key={item.country} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-5 shrink-0 text-right">{i + 1}</span>
              
              {/* Flag Icon */}
              <div className="shrink-0 w-6 h-4 bg-muted rounded-sm overflow-hidden border border-border/10">
                {isoCode ? (
                  <img 
                    src={`https://flagcdn.com/w40/${isoCode}.png`} 
                    alt={item.country}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200" />
                )}
              </div>

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
          )
        })}
      </div>
    </div>
  )
}
