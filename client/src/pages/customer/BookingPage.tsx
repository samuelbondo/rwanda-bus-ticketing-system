import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { scheduleService } from '@/services/scheduleService'
import { bookingService } from '@/services/bookingService'
import { seatService } from '@/services/seatService'
import { Card, CardBody, Skeleton } from '@/components/ui'
import BookingSteps from '@/components/booking/BookingSteps'
import ScheduleSummary from '@/components/booking/ScheduleSummary'
import SeatConfirm from '@/components/booking/SeatConfirm'
import PaymentStep from '@/components/booking/PaymentStep'
import SeatMap from '@/components/seat/SeatMap'
import type { Seat } from '@/types'

type PaymentMethod = 'MOMO' | 'CARD' | 'CASH'
type Step = 'seat' | 'payment'

export default function BookingPage() {
  const { scheduleId } = useParams<{ scheduleId: string }>()
  const navigate = useNavigate()
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null)
  const [step, setStep] = useState<Step>('seat')
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MOMO')
  const [reference, setReference] = useState('')
  const [proofUrl, setProofUrl] = useState('')

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
    onSuccess: (booking) => { setPendingBookingId(booking.id); setStep('payment') },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Booking failed. Please try again.')
    },
  })

  const payMutation = useMutation({
    mutationFn: () => bookingService.confirmPayment(pendingBookingId!, paymentMethod, reference.trim() || undefined, proofUrl || undefined),
    onSuccess: () => {
      toast.success('Payment submitted! Awaiting admin approval.')
      navigate(`/bookings`)
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Payment failed. Please try again.')
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

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-12 space-y-6">
      <BookingSteps current={step} />

      <ScheduleSummary schedule={schedule} />

      {step === 'seat' && (
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

      {step === 'seat' && selectedSeat && (
        <SeatConfirm
          seat={selectedSeat}
          schedule={schedule}
          loading={bookMutation.isPending}
          onConfirm={() => bookMutation.mutate()}
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
