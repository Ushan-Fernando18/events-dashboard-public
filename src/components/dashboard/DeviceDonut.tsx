import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { titleCase } from '../../lib/formatters'

interface DeviceData {
  name: string
  sessions: number
  percentage: number
}

const COLORS = [
  'hsl(221 83% 63%)',
  'hsl(262 83% 70%)',
  'hsl(142 71% 48%)',
  'hsl(38 92% 60%)',
  'hsl(346 84% 65%)',
]

interface Props {
  data: DeviceData[]
}

export default function DeviceDonut({ data }: Props) {
  return (
    <div className="glass rounded-xl p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Sessions by Device</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={3}
            dataKey="sessions"
            nameKey="name"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'hsl(222 47% 10%)',
              border: '1px solid hsl(217 32% 17%)',
              borderRadius: '8px',
              color: 'hsl(210 40% 98%)',
            }}
            formatter={(value: number, name: string) => [
              `${value.toLocaleString()} sessions`,
              titleCase(name),
            ]}
          />
          <Legend
            formatter={(value) => (
              <span style={{ color: 'hsl(215 20% 55%)', fontSize: '12px' }}>
                {titleCase(value)}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Percentage breakdown */}
      <div className="mt-2 space-y-2">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <span className="text-foreground capitalize">{item.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${item.percentage}%`,
                    background: COLORS[i % COLORS.length],
                  }}
                />
              </div>
              <span className="text-muted-foreground w-8 text-right">{item.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
