import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface AgeData {
  bracket: string
  sessions: number
}

const COLORS = [
  'hsl(221 83% 63%)',
  'hsl(230 83% 67%)',
  'hsl(240 83% 71%)',
  'hsl(250 83% 68%)',
  'hsl(262 83% 70%)',
  'hsl(270 83% 68%)',
]

interface Props {
  data: AgeData[]
}

export default function AgeChart({ data }: Props) {
  const sorted = [...data].sort((a, b) => {
    const order = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+']
    return order.indexOf(a.bracket) - order.indexOf(b.bracket)
  })

  return (
    <div className="glass rounded-xl p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Sessions by Age</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={sorted} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="bracket"
            tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'hsl(215 20% 55%)', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
          />
          <Tooltip
            contentStyle={{
              background: 'hsl(222 47% 10%)',
              border: '1px solid hsl(217 32% 17%)',
              borderRadius: '8px',
              color: 'hsl(210 40% 98%)',
            }}
            formatter={(value: number) => [value.toLocaleString(), 'Sessions']}
          />
          <Bar dataKey="sessions" radius={[4, 4, 0, 0]}>
            {sorted.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
