import { useQuery } from '@tanstack/react-query'
import { bookingService } from '@/services/bookingService'
import { Badge, Card, CardBody, Skeleton } from '@/components/ui'
import type { Booking } from '@/types'

const statusVariant = (s: string): 'success' | 'danger' | 'warning' | 'default' => {
  if (s === 'CONFIRMED') return 'success'
  if (s === 'CANCELLED') return 'danger'
  if (s === 'PENDING') return 'warning'
  return 'default'
}

export default function BookingsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['bookings', 'admin'],
    queryFn: () => bookingService.getAll(),
  })
  const bookings: Booking[] = (data as { data: Booking[] })?.data ?? []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All Bookings</h1>
      <Card>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 dark:border-gray-700">
                  <tr className="text-left text-gray-500">
                    {['Ticket', 'Passenger', 'Route', 'Departure', 'Seat', 'Price', 'Status'].map((h) => (
                      <th key={h} className="px-4 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-300">{b.ticketNumber}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white">{b.user?.name}</td>
                      <td className="px-4 py-3 text-gray-500">{b.source} → {b.destination}</td>
                      <td className="px-4 py-3 text-gray-500">{new Date(b.schedule.departureTime).toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-500">{b.seat.seatNumber}</td>
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
