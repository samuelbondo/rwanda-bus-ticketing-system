import { useQuery } from '@tanstack/react-query'
import { Ticket, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { bookingService } from '@/services/bookingService'
import { Card, CardBody, Badge, Skeleton } from '@/components/ui'
import type { Booking } from '@/types'

function statusVariant(s: string): 'success' | 'danger' | 'warning' | 'default' {
  if (s === 'CONFIRMED') return 'success'
  if (s === 'CANCELLED') return 'danger'
  if (s === 'PENDING') return 'warning'
  return 'default'
}

export default function CustomerDashboard() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => bookingService.getAll({ limit: 5 }),
  })

  const bookings: Booking[] = (data as { data: Booking[] })?.data ?? []
  const confirmed = bookings.filter((b) => b.status === 'CONFIRMED').length
  const cancelled = bookings.filter((b) => b.status === 'CANCELLED').length

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {user?.name}</h1>

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

      <Card>
        <CardBody>
          <h2 className="mb-4 font-semibold text-gray-900 dark:text-white">Recent Bookings</h2>
          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-gray-400">
              <Clock className="h-10 w-10" />
              <p>No bookings yet. <a href="/search" className="text-primary-600 hover:underline">Search schedules</a></p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {bookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{b.schedule.route.origin} → {b.schedule.route.destination}</p>
                    <p className="text-sm text-gray-500">{new Date(b.schedule.departureTime).toLocaleString()} · {b.ticketNumber}</p>
                  </div>
                  <Badge variant={statusVariant(b.status)}>{b.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
