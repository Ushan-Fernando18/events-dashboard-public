import { cn } from '../../lib/utils'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  accent?: boolean
  className?: string
}

export default function StatCard({ title, value, subtitle, icon: Icon, accent, className }: StatCardProps) {
  return (
    <div className={cn(
      'rounded-xl p-3 animate-fade-in transition-transform duration-200',
      accent ? 'gradient-brand text-white' : (!className?.includes('bg-') && !className?.includes('gradient-border') && 'glass-solid'),
      className
    )}>
      <div className="flex items-start justify-between mb-0.5">
        <p className={cn(
          'text-sm font-semibold', 
          accent ? 'text-white/80' : (className?.includes('gradient-border') ? 'text-slate-600' : 'text-muted-foreground')
        )}>{title}</p>
        <div className={cn('p-1.5 rounded-lg', accent ? 'bg-white/20' : 'bg-primary/10 text-primary')}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className={cn(
        'text-3xl font-bold tracking-tight mb-0', 
        accent ? 'text-white' : (className?.includes('gradient-border') ? 'text-slate-900' : 'text-foreground')
      )}>{value}</p>
      {subtitle && <p className={cn(
        'text-xs', 
        accent ? 'text-white/70' : (className?.includes('gradient-border') ? 'text-slate-500' : 'text-muted-foreground')
      )}>{subtitle}</p>}
    </div>
  )
}
