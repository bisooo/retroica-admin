'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface MonthlyData {
  month: string   // "Jan 24"
  gross: number
  net: number
}

interface RevenueChartProps {
  data: MonthlyData[]
}

interface TooltipPayloadEntry {
  name: string
  value: number
  color: string
}

function EurTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadEntry[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="border-2 border-border bg-background p-3 text-xs">
      <p className="font-bold mb-1">{label}</p>
      {payload.map((p: TooltipPayloadEntry) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: €{Number(p.value).toFixed(2)}
        </p>
      ))}
    </div>
  )
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={v => `€${v}`}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={60}
        />
        <Tooltip content={<EurTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          formatter={v => v.toUpperCase()}
        />
        <Bar dataKey="gross" name="gross" fill="hsl(var(--foreground))" opacity={0.25} radius={[2, 2, 0, 0]} />
        <Bar dataKey="net" name="net" fill="hsl(var(--foreground))" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
