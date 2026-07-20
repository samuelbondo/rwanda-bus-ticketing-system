import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Users, Bus, Route, CalendarDays, Ticket, TrendingUp, TrendingDown, AlertCircle, Plus } from 'lucide-react'
import { reportService, busService, routeService, userService } from '@/services/adminService'
import { scheduleService } from '@/services/scheduleService'
import { bookingService } from '@/services/bookingService'
import { Card, CardBody, CardHeader, Skeleton, Badge } from '@/components/ui'
import type { Booking } from '@/types'

const periods = ['daily', 'weekly', 'monthly', 'yearly']

export default function AdminDashboard() {
  const [period, setPeriod] = useState('monthly')

  const { data: report, isLoading: reportLoading } = useQuery({
    queryKey: ['reports', period],
    queryFn: () => reportService.get(period),
  })
  const { data: buses = [] } = useQuery({ queryKey: ['buses'], queryFn: busService.getAll })
  const { data: routes = [] } = useQuery({ queryKey: ['routes'], queryFn: routeService.getAll })
  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: userService.getAll })
  const { data: schedulesData } = useQuery({ queryKey: ['schedules', 'all'], queryFn: () => scheduleService.search({}) })
  const { data: bookingsData } = useQuery({ queryKey: ['bookings', 'admin'], queryFn: () => bookingService.getAll() })

  const schedules = (schedulesData as { data: unknown[] })?.data ?? []
  const bookings: Booking[] = (bookingsData as { data: Booking[] })?.data ?? []
  const recentBookings = bookings.slice(0, 5)

  const activeBuses = (buses as { isActive: boolean }[]).filter(b => b.isActive).length
  const activeRoutes = (routes as { isActive: boolean }[]).filter(r => r.isActive).length
  const activeSchedules = (schedules as { status: string }[]).filter(s => s.status === 'SCHEDULED').length
  const totalUsers = (users as unknown[]).length

  const systemStats = [
    { label: 'Total Users', value: totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', to: '/admin/users' },
    { label: 'Active Buses', value: activeBuses, icon: Bus, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', to: '/admin/buses' },
    { label: 'Active Routes', value: activeRoutes, icon: Route, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', to: '/admin/routes' },
    { label: 'Upcoming Schedules', value: activeSchedules, icon: CalendarDays, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', to: '/admin/schedules' },
  ]

  const revenueStats = [
    {
      label: 'Total Bookings',
      value: reportLoading ? '—' : (report?.totalBookings ?? 0),
      icon: Ticket,
      color: 'text-primary-600',
      bg: 'bg-primary-50 dark:bg-primary-900/20',
      trend: null,
    },
    {
      label: 'Revenue (RWF)',
      value: reportLoading ? '—' : `RWF ${Number(report?.totalRevenue ?? 0).toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-900/20',
      trend: 'up',
    },
    {
      label: 'Cancellation Rate',
      value: reportLoading ? '—' : `${Number(report?.cancellationRate ?? 0).toFixed(1)}%`,
      icon: TrendingDown,
      color: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-900/20',
      trend: 'down',
    },
    {
      label: 'Seat Occupancy',
      value: reportLoading ? '—' : `${Number(report?.seatOccupancy ?? 0).toFixed(1)}%`,
      icon: AlertCircle,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      trend: null,
    },
  ]

  const chartData = report?.bookingsPerDay ?? []

  const statusVariant = (s: string): 'success' | 'danger' | 'warning' | 'default' => {
    if (s === 'CONFIRMED') return 'success'
    if (s === 'CANCELLED') return 'danger'
    if (s === 'PENDING') return 'warning'
    return 'default'
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Overview of your bus ticketing system</p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          {periods.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
      </div>

      {/* System Overview */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">System Overview</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {systemStats.map(({ label, value, icon: Icon, color, bg, to }) => (
            <Link key={label} to={to}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardBody className="flex items-center gap-4">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Revenue Stats */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
          {period.charAt(0).toUpperCase() + period.slice(1)} Performance
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {revenueStats.map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label}>
              <CardBody className="flex items-center gap-4">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  {reportLoading
                    ? <Skeleton className="h-7 w-20" />
                    : <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
                  }
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Chart + Recent Bookings */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <p className="font-semibold text-gray-900 dark:text-white">Bookings Over Time</p>
          </CardHeader>
          <CardBody>
            {chartData.length === 0 ? (
              <div className="flex h-52 items-center justify-center text-sm text-gray-400">
                No booking data for this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <p className="font-semibold text-gray-900 dark:text-white">Quick Actions</p>
          </CardHeader>
          <CardBody className="space-y-2">
            {[
              { label: 'Add New Bus', to: '/admin/buses', icon: Bus },
              { label: 'Add New Route', to: '/admin/routes', icon: Route },
              { label: 'Add Schedule', to: '/admin/schedules', icon: CalendarDays },
              { label: 'View All Bookings', to: '/admin/bookings', icon: Ticket },
              { label: 'Manage Users', to: '/admin/users', icon: Users },
            ].map(({ label, to, icon: Icon }) => (
              <Link
                key={label}
                to={to}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
              >
                <Plus className="h-4 w-4 text-primary-600 shrink-0" />
                <Icon className="h-4 w-4 text-gray-400 shrink-0" />
                {label}
              </Link>
            ))}
          </CardBody>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <p className="font-semibold text-gray-900 dark:text-white">Recent Bookings</p>
          <Link to="/admin/bookings" className="text-xs text-primary-600 hover:underline">View all</Link>
        </CardHeader>
        <CardBody className="p-0">
          {recentBookings.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-gray-400">No bookings yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 dark:border-gray-700">
                  <tr className="text-left text-gray-500">
                    {['Ticket', 'Passenger', 'Route', 'Departure', 'Price', 'Status'].map((h) => (
                      <th key={h} className="px-4 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {recentBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-300">{b.ticketNumber}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white">{b.user?.name}</td>
                      <td className="px-4 py-3 text-gray-500">{b.source} → {b.destination}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(b.schedule.departureTime).toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-500">RWF {Number(b.totalPrice).toLocaleString()}</td>
                      <td className="px-4 py-3"><Badge variant={statusVariant(b.status)}>{b.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

    </div>
  )
}
