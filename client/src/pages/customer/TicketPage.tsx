import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Download, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { bookingService } from '@/services/bookingService'
import { Button, Card, CardBody, Badge, Skeleton } from '@/components/ui'

export default function TicketPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingService.getById(id!),
    enabled: !!id,
  })

  async function handleDownload() {
    try {
      const blob = await bookingService.downloadTicket(id!)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ticket-${booking?.ticketNumber}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Failed to download ticket')
    }
  }

  if (isLoading) return <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
  if (!booking) return <p className="text-center text-gray-500">Booking not found.</p>

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/bookings')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back to bookings
      </button>
      <Card className="max-w-lg">
        <CardBody className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Ticket</h1>
            <Badge variant={booking.status === 'CONFIRMED' ? 'success' : 'danger'}>{booking.status}</Badge>
          </div>
          {[
            ['Ticket No', booking.ticketNumber],
            ['Route', `${booking.source} → ${booking.destination}`],
            ['Bus', `${booking.schedule.bus.name} (${booking.schedule.bus.plateNumber})`],
            ['Seat', booking.seat.seatNumber],
            ['Departure', new Date(booking.schedule.departureTime).toLocaleString()],
            ['Price', `RWF ${Number(booking.totalPrice).toLocaleString()}`],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-gray-500">{label}</span>
              <span className="font-medium text-gray-900 dark:text-white">{value}</span>
            </div>
          ))}
          {booking.qrCode && (
            <div className="flex justify-center pt-2">
              <img src={booking.qrCode} alt="QR Code" className="h-32 w-32" />
            </div>
          )}
          <Button className="w-full" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </CardBody>
      </Card>
    </div>
  )
}
