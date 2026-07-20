import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import {
  Users, Bus, CalendarDays, Ticket,
  TrendingUp, TrendingDown, AlertCircle, ArrowRight,
} from 'lucide-react'
import { reportService, busService, routeService, userService } from '@/services/adminService'
import { scheduleService } from '@/services/scheduleService'
import { bookingService } from '@/services/bookingService'
import { Card, CardBody, CardHeader, Skeleton, Badge } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import type { Booking } from '@/types'

const periods = ['daily', 'weekly', 'monthly', 'yearly'] as const

const statusVariant = (s: string): 'success' | 'danger' | 'warning' | 'default' => {
  if (s === 'CONFIRMED') return 'success'
  if (s === 'CANCELLED') return 'danger'
  if (s === 'PENDING') return 'warning'
  return 'default'
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [period, setPeriod] = useState<string>('monthly')

  const { data: report, isLoading: reportLoading } = useQuery({
    queryKey: ['reports', period],
    queryFn: () => reportService.get(period),
  })
  const { data: buses = [] }     = useQuery({ queryKey: ['buses'],   queryFn: busService.getAll })
  const { data: routes = [] }    = useQuery({ queryKey: ['routes'],  queryFn: routeService.getAll })
  const { data: users = [] }     = useQuery({ queryKey: ['users'],   queryFn: userService.getAll })
  const { data: schedulesData }  = useQuery({ queryKey: ['schedules', 'all'], queryFn: () => scheduleService.search({}) })
  const { data: bookingsData }   = useQuery({ queryKey: ['bookings', 'admin'], queryFn: () => bookingService.getAll() })

  const schedules  = (schedulesData as { data: unknown[] })?.data ?? []
  const bookings: Booking[] = (bookingsData as { data: Booking[] })?.data ?? []
  const recentBookings = bookings.slice(0, 5)

  const totalUsers      = (users as unknown[]).length
  const activeBuses     = (buses as { isActive: boolean }[]).filter(b => b.isActive).length
  const activeRoutes    = (routes as { isActive: boolean }[]).filter(r => r.isActive).length
  const activeSchedules = (schedules as { status: string }[]).filter(s => s.status === 'SCHEDULED').length

  const kpis = [
    {
      label: 'Total Bookings',
      value: reportLoading ? null : (report?.totalBookings ?? 0),
      sub: `${period} period`,
      icon: Ticket,
      color: 'text-primary-600',
      bg: 'bg-primary-50 dark:bg-primary-900/20',
      to: '/admin/bookings',
    },
    {
      label: 'Revenue',
      value: reportLoading ? null : `RWF ${Number(report?.totalRevenue ?? 0).toLocaleString()}`,
      sub: `${period} period`,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-900/20',
      to: '/admin/reports',
    },
    {
      label: 'Cancellation Rate',
      value: reportLoading ? null : `${Number(report?.cancellationRate ?? 0).toFixed(1)}%`,
      sub: 'of all bookings',
      icon: TrendingDown,
      color: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-900/20',
      to: '/admin/reports',
    },
    {
      label: 'Seat Occupancy',
      value: reportLoading ? null : `${Number(report?.seatOccupancy ?? 0).toFixed(1)}%`,
      sub: 'average fill rate',
      icon: AlertCircle,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      to: '/admin/reports',
    },
  ]

  const systemItems = [
    { label: 'Users',              value: totalUsers,      icon: Users,        to: '/admin/users',     color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Active Buses',       value: activeBuses,     icon: Bus,          to: '/admin/buses',     color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Active Routes',      value: activeRoutes,    icon: CalendarDays, to: '/admin/routes',    color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Live Schedules',     value: activeSchedules, icon: CalendarDays, to: '/admin/schedules', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  ]

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Welcome back, {user?.name.split(' ')[0]} · {new Date().toLocaleDateString('en-RW', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white sm:w-auto"
        >
          {periods.map((p) => (
            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* KPI row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map(({ label, value, sub, icon: Icon, color, bg, to }) => (
          <Link key={label} to={to}>
            <Card className="hover:shadow-md transition-shadow">
              <CardBody className="flex items-start gap-3 p-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                  {value === null
                    ? <Skeleton className="mt-1 h-6 w-20" />
                    : <p className="mt-0.5 text-xl font-bold text-gray-900 dark:text-white truncate">{value}</p>
                  }
                  <p className="mt-0.5 text-xs text-gray-400">{sub}</p>
                </div>
              </CardBody>
            </Card>
          </Link>
        ))}
      </div>

      {/* System overview — compact inline row */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="grid divide-y divide-gray-100 dark:divide-gray-700 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
          {systemItems.map(({ label, value, icon: Icon, to, color, bg }) => (
            <Link key={label} to={to} className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
              <ArrowRight className="ml-auto h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />
            </Link>
          ))}
        </div>
      </div>

      {/* Chart + Recent Bookings */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <p className="font-semibold text-gray-900 dark:text-white">
              Bookings — {period.charAt(0).toUpperCase() + period.slice(1)} View
            </p>
          </CardHeader>
          <CardBody>
            {reportLoading ? (
              <Skeleton className="h-52 w-full" />
            ) : (report?.bookingsPerDay ?? []).length === 0 ? (
              <div className="flex h-52 items-center justify-center text-sm text-gray-400">
                No booking data for this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={report?.bookingsPerDay ?? []}>
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

        {/* Quick links */}
        <Card>
          <CardHeader>
            <p className="font-semibold text-gray-900 dark:text-white">Quick Actions</p>
          </CardHeader>
          <CardBody className="p-2">
            {[
              { label: 'Manage Users',     to: '/admin/users',     icon: Users },
              { label: 'Manage Buses',     to: '/admin/buses',     icon: Bus },
              { label: 'View Bookings',    to: '/admin/bookings',  icon: Ticket },
              { label: 'View Reports',     to: '/admin/reports',   icon: TrendingUp },
              { label: 'Audit Logs',       to: '/admin/audit-logs',icon: AlertCircle },
            ].map(({ label, to, icon: Icon }) => (
              <Link
                key={label}
                to={to}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
              >
                <Icon className="h-4 w-4 text-gray-400 shrink-0" />
                {label}
                <ArrowRight className="ml-auto h-3.5 w-3.5 text-gray-300" />
              </Link>
            ))}
          </CardBody>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <p className="font-semibold text-gray-900 dark:text-white">Recent Bookings</p>
          <Link to="/admin/bookings" className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardBody className="p-0">
          {recentBookings.length === 0 ? (
            <p className="px-6 py-10 text-center text-sm text-gray-400">No bookings yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {['Ticket', 'Passenger', 'Route', 'Departure', 'Price', 'Status'].map((h) => (
                      <th key={h} className="px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {recentBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-300">{b.ticketNumber}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{b.user?.name}</td>
                      <td className="px-4 py-3 text-gray-500">{b.source} → {b.destination}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(b.schedule.departureTime).toLocaleString('en-RW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
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
