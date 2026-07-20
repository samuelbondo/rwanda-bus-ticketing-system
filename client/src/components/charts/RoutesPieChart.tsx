import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

interface RoutesPieChartProps {
  data: { route: string; count: number }[]
}

const COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed']

export default function RoutesPieChart({ data }: RoutesPieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="route"
          cx="50%"
          cy="50%"
          outerRadius={90}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v: number) => [v, 'Bookings']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
