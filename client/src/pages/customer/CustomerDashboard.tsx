import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Ticket, CheckCircle, XCircle, Clock, Search, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { bookingService } from '@/services/bookingService'
import { Card, CardBody, Badge, Skeleton, Button } from '@/components/ui'
import { formatDateTime, formatRwf } from '@/utils'
import type { Booking } from '@/types'

function statusVariant(s: string): 'success' | 'danger' | 'warning' | 'default' {
  if (s === 'CONFIRMED') return 'success'
  if (s === 'CANCELLED') return 'danger'
  if (s === 'PENDING' || s === 'AWAITING_APPROVAL') return 'warning'
  return 'default'
}

function statusLabel(s: string) {
  if (s === 'AWAITING_APPROVAL') return 'Awaiting Approval'
  return s
}

export default function CustomerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => bookingService.getAll({ limit: 5 }),
  })

  const bookings: Booking[] = (data as { data: Booking[] })?.data ?? []
  const confirmed = bookings.filter((b) => b.status === 'CONFIRMED').length
  const cancelled = bookings.filter((b) => b.status === 'CANCELLED').length
  const awaitingApproval = bookings.filter((b) => b.status === 'AWAITING_APPROVAL').length

  // Next upcoming confirmed trip
  const nextTrip = bookings
    .filter((b) => b.status === 'CONFIRMED' && new Date(b.schedule.departureTime) > new Date())
    .sort((a, b) => new Date(a.schedule.departureTime).getTime() - new Date(b.schedule.departureTime).getTime())[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {user?.name}</h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Manage your bookings and travel plans.</p>
      </div>

      {/* Awaiting approval notice */}
      {awaitingApproval > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 dark:border-orange-800 dark:bg-orange-900/20">
          <AlertCircle className="h-5 w-5 shrink-0 text-orange-500 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-orange-700 dark:text-orange-400">
              {awaitingApproval} booking{awaitingApproval > 1 ? 's' : ''} awaiting payment approval
            </p>
            <p className="text-xs text-orange-600 dark:text-orange-500 mt-0.5">
              An admin will verify your proof of payment shortly. You'll receive an email once confirmed.
            </p>
          </div>
        </div>
      )}

      {/* Next trip highlight */}
      {nextTrip && (
        <div
          className="cursor-pointer rounded-xl border-2 border-primary-200 bg-primary-50 px-4 py-4 dark:border-primary-800 dark:bg-primary-900/20 transition hover:shadow-md"
          onClick={() => navigate(`/bookings/${nextTrip.id}/ticket`)}
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400 mb-1">Your Next Trip</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{nextTrip.source} → {nextTrip.destination}</p>
              <p className="text-sm text-gray-500 mt-0.5">{formatDateTime(nextTrip.schedule.departureTime)} · Seat {nextTrip.seat.seatNumber}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-primary-600 shrink-0" />
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Bookings', value: bookings.length, icon: Ticket, color: 'text-primary-600' },
          { label: 'Confirmed', value: confirmed, icon: CheckCircle, color: 'text-green-600' },
          { label: 'Cancelled', value: cancelled, icon: XCircle, color: 'text-red-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardBody className="flex items-center gap-4">
              <Icon className={`h-8 w-8 ${color}`} />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{isLoading ? '—' : value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Book CTA */}
      {bookings.length === 0 && !isLoading && (
        <Card className="border-2 border-dashed border-primary-200 dark:border-primary-800">
          <CardBody className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 dark:bg-primary-900/20">
              <Search className="h-8 w-8 text-primary-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">No bookings yet</p>
              <p className="mt-1 text-sm text-gray-500">Search available schedules and book your first ticket.</p>
            </div>
            <Button onClick={() => navigate('/search')}>
              <Search className="mr-2 h-4 w-4" /> Search Schedules
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Recent bookings */}
      {(bookings.length > 0 || isLoading) && (
        <Card>
          <CardBody>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 dark:text-white">Recent Bookings</h2>
              <Button size="sm" variant="secondary" onClick={() => navigate('/search')}>
                <Search className="mr-1.5 h-3.5 w-3.5" /> Book New
              </Button>
            </div>
            {isLoading ? (
              <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {bookings.map((b) => (
                  <div key={b.id} className="flex items-center justify-between py-3">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{b.source} → {b.destination}</p>
                      <p className="text-sm text-gray-500">{formatDateTime(b.schedule.departureTime)} · {formatRwf(b.totalPrice)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <Badge variant={statusVariant(b.status)}>{statusLabel(b.status)}</Badge>
                      {b.status === 'CONFIRMED' && (
                        <Button size="sm" variant="secondary" onClick={() => navigate(`/bookings/${b.id}/ticket`)}>
                          Ticket
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 text-center">
              <button onClick={() => navigate('/bookings')} className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-400">
                View all bookings <ArrowRight className="inline h-3.5 w-3.5" />
              </button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
