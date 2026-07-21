import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, XCircle, CreditCard, Clock } from 'lucide-react'
import { Button, Card, CardBody, Badge, Skeleton } from '@/components/ui'
import { useBookingById, useDownloadTicket, useCancelBooking } from '@/hooks/useBookings'
import { formatDateTime, formatRwf, canCancel } from '@/utils'

function statusVariant(s: string): 'success' | 'danger' | 'warning' | 'default' | 'info' {
  if (s === 'CONFIRMED') return 'success'
  if (s === 'CANCELLED') return 'danger'
  if (s === 'PENDING' || s === 'AWAITING_APPROVAL') return 'warning'
  if (s === 'USED') return 'info'
  return 'default'
}

function statusLabel(s: string): string {
  if (s === 'AWAITING_APPROVAL') return 'Awaiting Approval'
  if (s === 'PENDING') return 'Pending Payment'
  return s.charAt(0) + s.slice(1).toLowerCase()
}

export default function TicketPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: booking, isLoading } = useBookingById(id!)
  const downloadTicket = useDownloadTicket()
  const cancelMutation = useCancelBooking()

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    )
  }
  if (!booking) return <p className="text-center text-gray-500">Booking not found.</p>

  const confirmed = booking.status === 'CONFIRMED'
  const cancellable = (confirmed || booking.status === 'AWAITING_APPROVAL') && canCancel(booking.schedule.departureTime)

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/bookings')}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back to bookings
      </button>

      <Card className="max-w-lg">
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Ticket</h1>
            <Badge variant={statusVariant(booking.status)}>
              {statusLabel(booking.status)}
            </Badge>
          </div>

          {/* Status messages */}
          {booking.status === 'AWAITING_APPROVAL' && (
            <div className="rounded-lg bg-orange-50 dark:bg-orange-900/20 px-4 py-3 text-sm text-orange-700 dark:text-orange-300">
              <p className="font-semibold flex items-center gap-1.5"><Clock className="h-4 w-4" /> Payment Under Review</p>
              <p className="mt-0.5 text-xs">An admin is verifying your proof of payment. You'll receive an email once confirmed.</p>
            </div>
          )}
          {booking.status === 'PENDING' && (
            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 px-4 py-3 text-sm text-yellow-700 dark:text-yellow-300">
              <p className="font-semibold">Payment Required</p>
              <p className="mt-0.5 text-xs">Your seat is reserved but payment has not been submitted yet.</p>
            </div>
          )}

          {([
            ['Ticket No', booking.ticketNumber],
            ['Route', `${booking.source} → ${booking.destination}`],
            ['Bus', `${booking.schedule.bus.name} (${booking.schedule.bus.plateNumber})`],
            ['Seat', booking.seat.seatNumber],
            ['Departure', formatDateTime(booking.schedule.departureTime)],
            ['Price', formatRwf(booking.totalPrice)],
          ] as [string, string][]).map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-gray-500">{label}</span>
              <span className="font-medium text-gray-900 dark:text-white">{value}</span>
            </div>
          ))}

          {confirmed && booking.qrCode && (
            <div className="flex justify-center pt-2">
              <img src={booking.qrCode} alt="QR Code" className="h-32 w-32" />
            </div>
          )}

          {/* PENDING — go back to pay */}
          {booking.status === 'PENDING' && (
            <Button className="w-full" onClick={() => navigate(`/book/${booking.schedule.id}`)}>
              <CreditCard className="mr-2 h-4 w-4" /> Complete Payment
            </Button>
          )}

          {/* CONFIRMED — download */}
          {confirmed && (
            <Button className="w-full" onClick={() => downloadTicket(booking.id, booking.ticketNumber)}>
              <Download className="mr-2 h-4 w-4" /> Download PDF
            </Button>
          )}

          {/* Cancel */}
          {cancellable && (
            <Button
              className="w-full"
              variant="danger"
              loading={cancelMutation.isPending}
              onClick={() => cancelMutation.mutate(booking.id, { onSuccess: () => navigate('/bookings') })}
            >
              <XCircle className="mr-2 h-4 w-4" /> Cancel Booking
            </Button>
          )}

          {confirmed && !cancellable && (
            <p className="text-center text-xs text-gray-400">
              Cancellation window has closed (less than 3 hours before departure).
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
