import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { reportService } from '@/services/adminService'
import { Card, CardBody, CardHeader, Skeleton } from '@/components/ui'

const periods = ['daily', 'weekly', 'monthly', 'yearly']

export default function ReportsPage() {
  const [period, setPeriod] = useState('monthly')
  const { data, isLoading } = useQuery({
    queryKey: ['reports', period],
    queryFn: () => reportService.get(period),
  })

  const stats = [
    { label: 'Total Bookings', value: data?.totalBookings ?? 0 },
    { label: 'Total Revenue', value: data ? `RWF ${Number(data.totalRevenue).toLocaleString()}` : '—' },
    { label: 'Cancellation Rate', value: data ? `${Number(data.cancellationRate).toFixed(1)}%` : '—' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
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

      {data?.bookingsPerDay && data.bookingsPerDay.length > 0 && (
        <Card>
          <CardHeader><p className="font-semibold text-gray-900 dark:text-white">Bookings Over Time</p></CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.bookingsPerDay}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
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
