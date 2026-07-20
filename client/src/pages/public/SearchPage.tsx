import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, MapPin, Calendar, Users, Bus, Clock, AlertTriangle } from 'lucide-react'
import { scheduleService } from '@/services/scheduleService'
import { Button, Badge, Skeleton } from '@/components/ui'
import { useAuth } from '@/contexts/AuthContext'
import type { Schedule } from '@/types'

const today = new Date().toISOString().split('T')[0]

function statusLabel(s: string): { text: string; variant: 'success' | 'danger' | 'warning' | 'default' } {
  if (s === 'SCHEDULED') return { text: 'On Time', variant: 'success' }
  if (s === 'CANCELLED') return { text: 'Cancelled', variant: 'danger' }
  return { text: s, variant: 'default' }
}

export default function SearchPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchParams] = useSearchParams()

  const [origin, setOrigin] = useState(searchParams.get('origin') ?? '')
  const [date, setDate] = useState(searchParams.get('date') ?? '')
  const [submitted, setSubmitted] = useState(
    !!(searchParams.get('origin') || searchParams.get('date'))
  )

  useEffect(() => {
    const o = searchParams.get('origin') ?? ''
    const d = searchParams.get('date') ?? ''
    setOrigin(o)
    setDate(d)
    if (o || d) setSubmitted(true)
  }, [searchParams])

  const { data, isLoading } = useQuery({
    queryKey: ['schedules', origin, date],
    queryFn: () => scheduleService.search({ origin, date }),
    enabled: submitted,
  })

  const schedules: Schedule[] = (data as { data: Schedule[] })?.data ?? []

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-12">

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Bus Schedules
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Nyanza → Ruhango → Muhanga → Kigali · Search by origin and date
        </p>
      </div>

      {/* Search form */}
      <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <form onSubmit={handleSearch}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">

            {/* Origin */}
            <div className="flex-1">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
                From
              </label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                  placeholder="e.g. Nyanza"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                />
              </div>
            </div>

            {/* Destination — locked */}
            <div className="flex-1">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
                To
              </label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <input
                  className="w-full rounded-lg border border-gray-200 bg-gray-100 pl-9 pr-3 py-2.5 text-sm text-gray-400 cursor-not-allowed dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-500"
                  value="Kigali"
                  readOnly
                />
              </div>
            </div>

            {/* Date */}
            <div className="flex-1">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">
                Travel Date
              </label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-2.5 text-sm text-gray-900 transition focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:[color-scheme:dark]"
                  value={date}
                  min={today}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full sm:w-auto shrink-0 gap-2">
              <Search className="h-4 w-4" /> Search
            </Button>
          </div>
        </form>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && submitted && schedules.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center dark:border-gray-700 dark:bg-gray-800/50">
          <Bus className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">No schedules found</p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Try a different origin or travel date
          </p>
        </div>
      )}

      {/* Results */}
      {!isLoading && schedules.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {schedules.length} departure{schedules.length !== 1 ? 's' : ''} found
          </p>
          {schedules.map((s) => {
            const dep = new Date(s.departureTime)
            const timeStr = dep.toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' })
            const dateStr = dep.toLocaleDateString('en-RW', { weekday: 'short', month: 'short', day: 'numeric' })
            const full = s.availableSeats === 0
            const cancelled = s.status === 'CANCELLED'
            const lowSeats = !full && s.availableSeats <= 5
            const { text: statusText, variant: statusVariant } = statusLabel(s.status)

            return (
              <div
                key={s.id}
                className={`rounded-xl border bg-white p-4 sm:p-5 shadow-sm transition hover:shadow-md dark:bg-gray-800 ${
                  cancelled
                    ? 'border-red-200 opacity-60 dark:border-red-900'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  {/* Left info */}
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                      <MapPin className="h-4 w-4 shrink-0 text-primary-600" />
                      <span className="truncate">{s.route.origin} → {s.route.destination}</span>
                      <Badge variant={statusVariant}>{statusText}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        {timeStr} · {dateStr}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bus className="h-3.5 w-3.5 shrink-0" />
                        {s.bus.name}
                      </span>
                      <span className={`flex items-center gap-1 ${lowSeats ? 'font-semibold text-orange-500' : ''} ${full ? 'font-semibold text-red-500' : ''}`}>
                        {lowSeats && <AlertTriangle className="h-3.5 w-3.5 shrink-0" />}
                        <Users className="h-3.5 w-3.5 shrink-0" />
                        {full ? 'Fully booked' : `${s.availableSeats} seat${s.availableSeats !== 1 ? 's' : ''} left`}
                      </span>
                    </div>
                  </div>

                  {/* Right — price + action */}
                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-start">
                    <p className="text-lg font-bold text-primary-600">
                      RWF {Number(s.price).toLocaleString()}
                    </p>
                    <Button
                      onClick={() =>
                        user
                          ? navigate(`/book/${s.id}`)
                          : navigate('/login', { state: { scheduleId: s.id } })
                      }
                      disabled={full || cancelled}
                      size="sm"
                    >
                      {full ? 'Full' : 'Book Now'}
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
