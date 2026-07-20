import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Download, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { bookingService } from '@/services/bookingService'
import { Button, Badge, Card, CardBody, Skeleton } from '@/components/ui'
import type { Booking } from '@/types'

function statusVariant(s: string): 'success' | 'danger' | 'warning' | 'default' {
  if (s === 'CONFIRMED') return 'success'
  if (s === 'CANCELLED') return 'danger'
  if (s === 'PENDING') return 'warning'
  return 'default'
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function BookingHistoryPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => bookingService.getAll(),
  })

  const bookings: Booking[] = (data as { data: Booking[] })?.data ?? []

  const cancelMutation = useMutation({
    mutationFn: (id: string) => bookingService.cancel(id),
    onSuccess: () => { toast.success('Booking cancelled'); qc.invalidateQueries({ queryKey: ['bookings'] }) },
    onError: () => toast.error('Cancellation failed'),
  })

  async function handleDownload(id: string, ticketNumber: string) {
    try {
      const blob = await bookingService.downloadTicket(id)
      downloadBlob(blob, `ticket-${ticketNumber}.pdf`)
    } catch {
      toast.error('Failed to download ticket')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Bookings</h1>
      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full" />)}</div>
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
                      {new Date(b.schedule.departureTime).toLocaleString()} · Seat {b.seat.seatNumber}
                    </p>
                    <p className="text-xs text-gray-400">{b.ticketNumber}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusVariant(b.status)}>{b.status}</Badge>
                    <p className="font-semibold text-primary-600">RWF {Number(b.totalPrice).toLocaleString()}</p>
                    {b.status === 'CONFIRMED' && (
                      <>
                        <Button size="sm" variant="secondary" onClick={() => handleDownload(b.id, b.ticketNumber)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => cancelMutation.mutate(b.id)} loading={cancelMutation.isPending}>
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
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
