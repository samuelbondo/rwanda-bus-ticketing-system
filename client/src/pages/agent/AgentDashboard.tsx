import { useAuth } from '@/contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Card, CardBody, Skeleton, Badge } from '@/components/ui'
import { QrCode, CalendarDays, Users, CheckCircle, Clock, ChevronRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { scheduleService } from '@/services/scheduleService'
import api from '@/services/api'
import type { Schedule, Booking } from '@/types'

function useNow() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(t)
  }, [])
  return now
}

function countdown(dep: Date, now: Date): string {
  const diff = Math.round((dep.getTime() - now.getTime()) / 60_000)
  if (diff < 0) return 'Departed'
  if (diff === 0) return 'Departing now'
  if (diff < 60) return `in ${diff} min`
  const h = Math.floor(diff / 60), m = diff % 60
  return m > 0 ? `in ${h}h ${m}m` : `in ${h}h`
}

function statusVariant(s: string): 'success' | 'warning' | 'danger' | 'default' {
  if (s === 'SCHEDULED') return 'success'
  if (s === 'DEPARTED') return 'warning'
  if (s === 'CANCELLED') return 'danger'
  return 'default'
}

export default function AgentDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const now = useNow()
  const today = new Date().toISOString().split('T')[0]

  const { data: schedData, isLoading: loadingSched } = useQuery({
    queryKey: ['schedules', 'today'],
    queryFn: () => scheduleService.search({ date: today }),
    refetchInterval: 30_000,
  })

  const { data: bookingsData, isLoading: loadingBookings } = useQuery({
    queryKey: ['agent-bookings-today'],
    queryFn: async () => {
      const res = await api.get('/bookings')
      return res.data.data as Booking[]
    },
    refetchInterval: 30_000,
  })

  const schedules: Schedule[] = (schedData as { data: Schedule[] })?.data ?? []
  const bookings: Booking[] = bookingsData ?? []
  const checkedIn = bookings.filter((b) => b.status === 'USED').length
  const confirmed = bookings.filter((b) => b.status === 'CONFIRMED').length
  const loading = loadingSched || loadingBookings

  // Next upcoming scheduled trip
  const nextTrip = schedules
    .filter((s) => s.status === 'SCHEDULED' && new Date(s.departureTime) > now)
    .sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime())[0]

  const stats = [
    { label: "Today's Trips", value: schedules.length, icon: CalendarDays, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/20' },
    { label: 'Total Booked', value: bookings.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Checked In', value: checkedIn, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Awaiting Board', value: confirmed, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agent Dashboard</h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          Welcome, {user?.name}. Here's your overview for today.
        </p>
      </div>

      {/* Next departure banner */}
      {!loading && nextTrip && (() => {
        const dep = new Date(nextTrip.departureTime)
        const minsAway = Math.round((dep.getTime() - now.getTime()) / 60_000)
        const urgent = minsAway <= 30
        return (
          <button
            onClick={() => navigate(`/agent/manifest/${nextTrip.id}`)}
            className={`w-full rounded-xl border-2 px-4 py-3 text-left transition hover:shadow-md ${
              urgent
                ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/20'
                : 'border-primary-200 bg-primary-50 dark:bg-primary-900/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wide ${urgent ? 'text-orange-600' : 'text-primary-600'}`}>
                  {urgent ? '🚌 Boarding Soon' : 'Next Departure'}
                </p>
                <p className="mt-0.5 font-semibold text-gray-900 dark:text-white">
                  {nextTrip.route.origin} → {nextTrip.route.destination}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${urgent ? 'text-orange-600' : 'text-primary-600'}`}>
                  {countdown(dep, now)}
                </p>
                <p className="text-xs text-gray-500">
                  {dep.toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </button>
        )
      })()}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {loading
          ? [1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)
          : stats.map(({ label, value, icon: Icon, color, bg }) => (
            <Card key={label}>
              <CardBody className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                </div>
              </CardBody>
            </Card>
          ))
        }
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/agent/verify">
          <Card className="cursor-pointer hover:shadow-md transition-shadow border-primary-100 dark:border-primary-900/30">
            <CardBody className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/20">
                <QrCode className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Verify Ticket</p>
                <p className="text-sm text-gray-500">Scan QR or enter ticket number to board a passenger.</p>
              </div>
            </CardBody>
          </Card>
        </Link>
        <Link to="/agent/trips">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardBody className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20">
                <CalendarDays className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Today's Trips</p>
                <p className="text-sm text-gray-500">View schedules, manifests, and mark departures.</p>
              </div>
            </CardBody>
          </Card>
        </Link>
      </div>

      {/* Upcoming trips mini-list */}
      {!loading && schedules.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Today's Schedule</h2>
            {schedules.length > 4 && (
              <Link to="/agent/trips" className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700">
                View all {schedules.length} <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
          <div className="space-y-2">
            {schedules.slice(0, 4).map((s) => {
              const dep = new Date(s.departureTime)
              const minsAway = Math.round((dep.getTime() - now.getTime()) / 60_000)
              const boarding = s.status === 'SCHEDULED' && minsAway >= 0 && minsAway <= 30
              return (
                <button
                  key={s.id}
                  onClick={() => navigate(`/agent/manifest/${s.id}`)}
                  className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition hover:shadow-sm ${
                    boarding
                      ? 'border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20'
                      : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium text-gray-900 dark:text-white truncate">
                      {s.route.origin} → {s.route.destination}
                    </span>
                    <Badge variant={statusVariant(s.status)}>
                      {s.status === 'SCHEDULED' && boarding ? 'Boarding' : s.status}
                    </Badge>
                  </div>
                  <span className={`ml-2 shrink-0 text-xs font-semibold ${
                    boarding ? 'text-orange-600' : dep < now ? 'text-gray-400' : 'text-primary-600'
                  }`}>
                    {countdown(dep, now)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
