import { Download, XCircle, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button, Badge, Card, CardBody, Skeleton } from '@/components/ui'
import { useBookings, useCancelBooking, useDownloadTicket } from '@/hooks/useBookings'
import { formatDateTime, formatRwf, canCancel } from '@/utils'

function statusVariant(s: string): 'success' | 'danger' | 'warning' | 'default' {
  if (s === 'CONFIRMED') return 'success'
  if (s === 'CANCELLED') return 'danger'
  if (s === 'PENDING' || s === 'AWAITING_APPROVAL') return 'warning'
  return 'default'
}

export default function BookingHistoryPage() {
  const { bookings, isLoading } = useBookings()
  const cancelMutation = useCancelBooking()
  const downloadTicket = useDownloadTicket()
  const navigate = useNavigate()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Bookings</h1>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      ) : bookings.length === 0 ? (
        <Card><CardBody><p className="text-center text-gray-500 py-8">No bookings found.</p></CardBody></Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <Card key={b.id}>
              <CardBody>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {b.source} → {b.destination}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDateTime(b.schedule.departureTime)} · Seat {b.seat.seatNumber}
                    </p>
                    <p className="text-xs text-gray-400">{b.ticketNumber}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusVariant(b.status)}>{b.status}</Badge>
                    <p className="font-semibold text-primary-600">{formatRwf(b.totalPrice)}</p>
                    {b.status === 'CONFIRMED' && (
                      <>
                        <Button size="sm" variant="secondary" onClick={() => downloadTicket(b.id, b.ticketNumber)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        {canCancel(b.schedule.departureTime) && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => cancelMutation.mutate(b.id)}
                            loading={cancelMutation.isPending}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    )}
                    {(b.status === 'CANCELLED' || b.status === 'USED') && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                        navigate(`/search?origin=${encodeURIComponent(b.source)}&destination=${encodeURIComponent(b.destination)}`)
                        }
                      >
                        <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Rebook
                      </Button>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
