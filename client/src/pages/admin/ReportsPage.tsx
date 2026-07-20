import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid,
} from 'recharts'
import { reportService } from '@/services/adminService'
import { Card, CardBody, CardHeader, Skeleton, Button } from '@/components/ui'
import {
  TrendingUp, Users, DollarSign, XCircle, Download, FileText,
  Calendar, BarChart2, MapPin,
} from 'lucide-react'
import { toast } from 'sonner'

const PERIODS = [
  { value: 'daily', label: 'Today' },
  { value: 'weekly', label: 'This Week' },
  { value: 'monthly', label: 'This Month' },
  { value: 'yearly', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
]

function StatCard({
  label, value, icon: Icon, color, loading,
}: {
  label: string
  value: string
  icon: React.ElementType
  color: string
  loading: boolean
}) {
  return (
    <Card>
      <CardBody className="flex items-center gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="min-w-0">
          {loading ? (
            <>
              <Skeleton className="mb-1 h-7 w-24" />
              <Skeleton className="h-4 w-32" />
            </>
          ) : (
            <>
              <p className="truncate text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            </>
          )}
        </div>
      </CardBody>
    </Card>
  )
}

export default function ReportsPage() {
  const [period, setPeriod] = useState('monthly')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [exporting, setExporting] = useState<'pdf' | 'csv' | null>(null)

  const isCustom = period === 'custom'
  const queryFrom = isCustom ? from : undefined
  const queryTo = isCustom ? to : undefined
  const enabled = !isCustom || (!!from && !!to)

  const { data, isLoading } = useQuery({
    queryKey: ['reports', period, queryFrom, queryTo],
    queryFn: () => reportService.get(period, queryFrom, queryTo),
    enabled,
  })

  async function handleExport(format: 'pdf' | 'csv') {
    if (isCustom && (!from || !to)) {
      toast.error('Please select both From and To dates before exporting.')
      return
    }
    setExporting(format)
    try {
      const blob = await reportService.export(period, format, queryFrom, queryTo)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report-${period}.${format}`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`Report exported as ${format.toUpperCase()}`)
    } catch {
      toast.error('Export failed. Please try again.')
    } finally {
      setExporting(null)
    }
  }

  const stats = [
    {
      label: 'Total Bookings',
      value: data ? String(data.totalBookings) : '—',
      icon: Users,
      color: 'bg-blue-600',
    },
    {
      label: 'Total Revenue',
      value: data ? `RWF ${Number(data.totalRevenue).toLocaleString()}` : '—',
      icon: DollarSign,
      color: 'bg-emerald-600',
    },
    {
      label: 'Cancellation Rate',
      value: data ? `${Number(data.cancellationRate).toFixed(1)}%` : '—',
      icon: XCircle,
      color: 'bg-red-500',
    },
    {
      label: 'Seat Occupancy',
      value: data ? `${Number(data.seatOccupancy).toFixed(1)}%` : '—',
      icon: TrendingUp,
      color: 'bg-violet-600',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleExport('csv')}
            loading={exporting === 'csv'}
            disabled={!!exporting}
          >
            <Download className="mr-1.5 h-4 w-4" />
            CSV
          </Button>
          <Button
            size="sm"
            onClick={() => handleExport('pdf')}
            loading={exporting === 'pdf'}
            disabled={!!exporting}
          >
            <FileText className="mr-1.5 h-4 w-4" />
            PDF Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardBody className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
              Period
            </label>
            <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-900">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    period === p.value
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {isCustom && (
            <div className="flex items-end gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  <Calendar className="mr-1 inline h-3 w-3" />
                  From
                </label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                  To
                </label>
                <input
                  type="date"
                  value={to}
                  min={from}
                  onChange={(e) => setTo(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          )}

          {data && (
            <p className="ml-auto text-xs text-gray-400">
              {new Date(data.from).toLocaleDateString()} – {new Date(data.to).toLocaleDateString()}
            </p>
          )}
        </CardBody>
      </Card>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} loading={isLoading} />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Bookings over time */}
        <Card>
          <CardHeader>
            <p className="font-semibold text-gray-900 dark:text-white">Bookings Over Time</p>
          </CardHeader>
          <CardBody>
            {isLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : data?.bookingsPerDay && data.bookingsPerDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.bookingsPerDay} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip
                    formatter={(v: number) => [v, 'Bookings']}
                    labelFormatter={(l) => `Date: ${l}`}
                  />
                  <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} name="Bookings" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-10 text-center text-sm text-gray-400">No data for this period</p>
            )}
          </CardBody>
        </Card>

        {/* Revenue over time */}
        <Card>
          <CardHeader>
            <p className="font-semibold text-gray-900 dark:text-white">Revenue Over Time (RWF)</p>
          </CardHeader>
          <CardBody>
            {isLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : data?.bookingsPerDay && data.bookingsPerDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data.bookingsPerDay} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(v: number) => [`RWF ${Number(v).toLocaleString()}`, 'Revenue']}
                    labelFormatter={(l) => `Date: ${l}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#revenueGrad)"
                    name="Revenue"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="py-10 text-center text-sm text-gray-400">No data for this period</p>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Popular routes */}
      <Card>
        <CardHeader className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-600" />
          <p className="font-semibold text-gray-900 dark:text-white">Top Routes</p>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-6">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : data?.popularRoutes && data.popularRoutes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                    <th className="px-6 py-3 text-left font-medium text-gray-500">#</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Route</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Origin</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-500">Destination</th>
                    <th className="px-6 py-3 text-right font-medium text-gray-500">Bookings</th>
                    <th className="px-6 py-3 text-right font-medium text-gray-500">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {data.popularRoutes.map((r, i) => {
                    const share = data.totalBookings > 0
                      ? ((r.count / data.totalBookings) * 100).toFixed(1)
                      : '0.0'
                    return (
                      <tr
                        key={i}
                        className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                      >
                        <td className="px-6 py-3 text-gray-400">{i + 1}</td>
                        <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">{r.route}</td>
                        <td className="px-6 py-3 text-gray-600 dark:text-gray-300">{r.origin}</td>
                        <td className="px-6 py-3 text-gray-600 dark:text-gray-300">{r.destination}</td>
                        <td className="px-6 py-3 text-right font-semibold text-blue-600">{r.count}</td>
                        <td className="px-6 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                              <div
                                className="h-full rounded-full bg-blue-600"
                                style={{ width: `${share}%` }}
                              />
                            </div>
                            <span className="w-10 text-xs text-gray-500">{share}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-gray-400">No route data for this period</p>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
