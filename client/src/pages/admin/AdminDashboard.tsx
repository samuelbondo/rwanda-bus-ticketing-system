import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { reportService } from '@/services/adminService'
import { Card, CardBody, CardHeader, Skeleton } from '@/components/ui'

const periods = ['daily', 'weekly', 'monthly', 'yearly']

export default function AdminDashboard() {
  const [period, setPeriod] = useState('monthly')
  const { data, isLoading } = useQuery({
    queryKey: ['reports', period],
    queryFn: () => reportService.get(period),
  })

  const stats = [
    { label: 'Total Bookings', value: data?.totalBookings ?? 0 },
    { label: 'Revenue (RWF)', value: data ? Number(data.totalRevenue).toLocaleString() : 0 },
    { label: 'Cancellation Rate', value: data ? `${Number(data.cancellationRate).toFixed(1)}%` : '0%' },
  ]

  const chartData = data?.bookingsPerDay ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          {periods.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value }) => (
          <Card key={label}>
            <CardBody>
              {isLoading ? <Skeleton className="h-10 w-full" /> : (
                <>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                  <p className="text-sm text-gray-500">{label}</p>
                </>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader><p className="font-semibold text-gray-900 dark:text-white">Bookings Over Time</p></CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
