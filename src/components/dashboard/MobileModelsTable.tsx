interface MobileModel {
  model: string
  sessions: number
}

interface Props {
  data: MobileModel[]
}

export default function MobileModelsTable({ data }: Props) {
  const max = Math.max(...data.map((d) => d.sessions), 1)

  return (
    <div className="glass rounded-xl p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Top Mobile Devices</h3>
      <div className="space-y-2">
        {data.map((item, i) => (
          <div key={item.model} className="flex items-center gap-2.5">
            <span className="text-xs text-muted-foreground w-4 shrink-0">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium text-foreground truncate" title={item.model}>
                  {item.model === '(not set)' ? 'Unknown' : item.model}
                </span>
                <span className="text-xs text-muted-foreground ml-2 shrink-0">{item.sessions.toLocaleString()}</span>
              </div>
              <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(item.sessions / max) * 100}%`,
                    background: 'hsl(221 83% 63%)',
                    opacity: 0.7 + 0.3 * (1 - i / data.length),
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
