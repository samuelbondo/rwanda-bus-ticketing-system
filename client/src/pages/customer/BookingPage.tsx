import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AlertTriangle, Clock } from 'lucide-react'
import { scheduleService } from '@/services/scheduleService'
import { bookingService } from '@/services/bookingService'
import { seatService } from '@/services/seatService'
import { Card, CardBody, Skeleton } from '@/components/ui'
import BookingSteps from '@/components/booking/BookingSteps'
import ScheduleSummary from '@/components/booking/ScheduleSummary'
import SeatConfirm from '@/components/booking/SeatConfirm'
import PaymentStep from '@/components/booking/PaymentStep'
import SeatMap from '@/components/seat/SeatMap'
import { canPay } from '@/utils'
import type { Seat } from '@/types'

type PaymentMethod = 'MOMO' | 'CARD' | 'CASH'
type Step = 'seat' | 'payment'

function friendlyError(msg?: string): string {
  if (!msg) return 'Something went wrong. Please try again.'
  if (msg.includes('less than 1 hour')) return 'Booking is closed — this departure is less than 1 hour away. Please choose a later schedule.'
  if (msg.includes('not available') || msg.includes('SCHEDULED')) return 'This schedule is no longer available for booking.'
  if (msg.includes('already booked') || msg.includes('Seat already')) return 'This seat was just taken by someone else. Please select a different seat.'
  if (msg.includes('Booking is not awaiting payment')) return 'This booking is no longer in a payable state. Please check your bookings.'
  if (msg.includes('Payment window closed')) return 'Payment window has closed — less than 1 hour before departure.'
  return msg
}

export default function BookingPage() {
  const { scheduleId } = useParams<{ scheduleId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null)
  const [step, setStep] = useState<Step>('seat')
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MOMO')
  const [reference, setReference] = useState('')
  const [proofUrl, setProofUrl] = useState('')
  const [bookingError, setBookingError] = useState('')

  const { data: schedule, isLoading: loadingSchedule } = useQuery({
    queryKey: ['schedule', scheduleId],
    queryFn: () => scheduleService.getById(scheduleId!),
    enabled: !!scheduleId,
  })

  const { data: seatsData, isLoading: loadingSeats } = useQuery({
    queryKey: ['seats', scheduleId],
    queryFn: () => seatService.getBySchedule(scheduleId!),
    enabled: !!scheduleId,
  })

  const seats: Seat[] = seatsData ?? []

  const bookMutation = useMutation({
    mutationFn: () => bookingService.create({
      scheduleId: scheduleId!,
      seatId: selectedSeat!.id,
      source: schedule!.route.origin,
      destination: schedule!.route.destination,
    }),
    onSuccess: (booking) => {
      setBookingError('')
      setPendingBookingId(booking.id)
      setStep('payment')
      queryClient.invalidateQueries({ queryKey: ['schedule', scheduleId] })
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
      queryClient.invalidateQueries({ queryKey: ['seats', scheduleId] })
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      const msg = friendlyError(err?.response?.data?.message)
      setBookingError(msg)
      toast.error(msg, { duration: 6000 })
    },
  })

  const payMutation = useMutation({
    mutationFn: () => bookingService.confirmPayment(pendingBookingId!, paymentMethod, reference.trim() || undefined, proofUrl || undefined),
    onSuccess: () => {
      toast.success('Payment submitted! Awaiting admin approval.')
      navigate(`/bookings`)
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      const msg = friendlyError(err?.response?.data?.message)
      toast.error(msg, { duration: 6000 })
    },
  })

  if (loadingSchedule) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!schedule) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 text-center">
        <p className="text-gray-500">Schedule not found.</p>
      </div>
    )
  }

  const bookingClosed = !canPay(schedule.departureTime)
  const hoursLeft = (new Date(schedule.departureTime).getTime() - Date.now()) / 36e5
  const closingSoon = !bookingClosed && hoursLeft < 2

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-12 space-y-6">
      <BookingSteps current={step} />

      <ScheduleSummary schedule={schedule} />

      {/* Booking closed warning */}
      {bookingClosed && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">Booking Closed</p>
            <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">
              This departure is less than 1 hour away. Bookings are no longer accepted.
              Please <button onClick={() => navigate('/search')} className="underline font-medium">search for another schedule</button>.
            </p>
          </div>
        </div>
      )}

      {/* Closing soon warning */}
      {closingSoon && (
        <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20 px-4 py-3">
          <Clock className="h-5 w-5 shrink-0 text-orange-500 mt-0.5" />
          <p className="text-sm text-orange-700 dark:text-orange-400">
            <span className="font-semibold">Hurry!</span> Booking closes in less than {Math.ceil(hoursLeft * 60)} minutes.
          </p>
        </div>
      )}

      {step === 'seat' && !bookingClosed && (
        <Card>
          <CardBody>
            <h2 className="mb-4 font-semibold text-gray-900 dark:text-white">Select a Seat</h2>
            {loadingSeats ? (
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 30 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            ) : (
              <SeatMap seats={seats} selectedSeat={selectedSeat} onSelect={setSelectedSeat} />
            )}
          </CardBody>
        </Card>
      )}

      {/* Inline error */}
      {bookingError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400">{bookingError}</p>
        </div>
      )}

      {step === 'seat' && selectedSeat && !bookingClosed && (
        <SeatConfirm
          seat={selectedSeat}
          schedule={schedule}
          loading={bookMutation.isPending}
          onConfirm={() => { setBookingError(''); bookMutation.mutate() }}
        />
      )}

      {step === 'payment' && (
        <PaymentStep
          price={Number(schedule.price)}
          method={paymentMethod}
          reference={reference}
          proofUrl={proofUrl}
          loading={payMutation.isPending}
          onMethodChange={setPaymentMethod}
          onReferenceChange={setReference}
          onProofUrlChange={setProofUrl}
          onConfirm={() => payMutation.mutate()}
        />
      )}
    </div>
  )
}
