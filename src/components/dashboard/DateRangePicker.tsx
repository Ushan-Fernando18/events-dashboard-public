import { useState } from 'react'
import { format, subDays } from 'date-fns'
import { Calendar, ChevronDown } from 'lucide-react'

interface DateRange {
  startDate: string
  endDate: string
  label: string
}

const PRESETS: DateRange[] = [
  { label: 'Last 7 days', startDate: format(subDays(new Date(), 7), 'yyyy-MM-dd'), endDate: format(new Date(), 'yyyy-MM-dd') },
  { label: 'Last 14 days', startDate: format(subDays(new Date(), 14), 'yyyy-MM-dd'), endDate: format(new Date(), 'yyyy-MM-dd') },
  { label: 'Last 30 days', startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'), endDate: format(new Date(), 'yyyy-MM-dd') },
  { label: 'Last 60 days', startDate: format(subDays(new Date(), 60), 'yyyy-MM-dd'), endDate: format(new Date(), 'yyyy-MM-dd') },
  { label: 'Last 90 days', startDate: format(subDays(new Date(), 90), 'yyyy-MM-dd'), endDate: format(new Date(), 'yyyy-MM-dd') },
]

interface Props {
  value: DateRange
  onChange: (range: DateRange) => void
}

export default function DateRangePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 glass rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-accent/50 transition-colors"
      >
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span>{value.label}</span>
        <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 z-20 glass rounded-xl shadow-xl min-w-[180px] py-1 animate-fade-in">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  onChange(preset)
                  setOpen(false)
                }}
                className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-accent/50 ${
                  value.label === preset.label ? 'text-primary font-medium' : 'text-foreground'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export { PRESETS }
export type { DateRange }
