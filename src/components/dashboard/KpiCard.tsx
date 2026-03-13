import { cn } from '../../lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  accent?: boolean
}

export default function StatCard({ title, value, subtitle, icon: Icon, accent }: StatCardProps) {
  return (
    <div className={cn(
      'rounded-xl p-5 animate-fade-in hover:scale-[1.01] transition-transform duration-200',
      accent ? 'gradient-brand text-white' : 'glass-solid'
    )}>
      <div className="flex items-start justify-between mb-3">
        <p className={cn('text-sm font-medium', accent ? 'text-white/80' : 'text-muted-foreground')}>{title}</p>
        <div className={cn('p-2 rounded-lg', accent ? 'bg-white/20' : 'bg-primary/10 text-primary')}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className={cn('text-3xl font-bold tracking-tight mb-1', accent ? 'text-white' : 'text-foreground')}>{value}</p>
      {subtitle && <p className={cn('text-xs', accent ? 'text-white/70' : 'text-muted-foreground')}>{subtitle}</p>}
    </div>
  )
}
