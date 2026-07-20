import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'

interface RevenueChartProps {
  data: { date: string; revenue: number }[]
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(v: number) => [`RWF ${v.toLocaleString()}`, 'Revenue']} />
        <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2}
          fill="url(#revenueGrad)" dot={false} activeDot={{ r: 4 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
