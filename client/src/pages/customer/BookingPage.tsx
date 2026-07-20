import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { MapPin, Clock, Bus, Users, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { scheduleService } from '@/services/scheduleService'
import { bookingService } from '@/services/bookingService'
import { seatService } from '@/services/seatService'
import { Button, Card, CardBody, Skeleton } from '@/components/ui'
import type { Seat } from '@/types'

export default function BookingPage() {
  const { scheduleId } = useParams<{ scheduleId: string }>()
  const navigate = useNavigate()
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null)

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
      toast.success('Booking confirmed!')
      navigate(`/bookings/${booking.id}/ticket`)
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Booking failed. Please try again.')
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
        <Button className="mt-4" onClick={() => navigate('/search')}>Back to Search</Button>
      </div>
    )
  }

  const dep = new Date(schedule.departureTime)

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-12 space-y-6">
      <div>
        <button onClick={() => navigate(-1)} className="mb-4 text-sm text-primary-600 hover:underline">
          ← Back to search
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Complete Your Booking</h1>
      </div>

      {/* Schedule summary */}
      <Card>
        <CardBody className="space-y-3">
          <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
            <MapPin className="h-4 w-4 text-primary-600 shrink-0" />
            {schedule.route.origin} → {schedule.route.destination}
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 shrink-0" />
              {dep.toLocaleDateString('en-RW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              {' at '}
              {dep.toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="flex items-center gap-1.5">
              <Bus className="h-4 w-4 shrink-0" />
              {schedule.bus.name} · {schedule.bus.plateNumber}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 shrink-0" />
              {schedule.availableSeats} seats available
            </span>
          </div>
          <div className="pt-1 text-lg font-bold text-primary-600">
            RWF {Number(schedule.price).toLocaleString()}
          </div>
        </CardBody>
      </Card>

      {/* Seat picker */}
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
            <>
              {/* Legend */}
              <div className="mb-4 flex flex-wrap gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-green-100 border border-green-300" />Available</span>
                <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-primary-600" />Selected</span>
                <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-gray-200 dark:bg-gray-700" />Taken</span>
              </div>

              {/* Bus front indicator */}
              <div className="mb-3 flex items-center gap-2 text-xs text-gray-400">
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
                <span>FRONT</span>
                <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
              </div>

              <div className="grid grid-cols-5 gap-2">
                {seats.map((seat) => {
                  const isSelected = selectedSeat?.id === seat.id
                  const isTaken = !seat.isAvailable
                  return (
                    <button
                      key={seat.id}
                      disabled={isTaken}
                      onClick={() => setSelectedSeat(isSelected ? null : seat)}
                      className={[
                        'rounded-lg border py-2.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary-500',
                        isTaken
                          ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-500'
                          : isSelected
                          ? 'border-primary-600 bg-primary-600 text-white shadow-md'
                          : 'border-green-300 bg-green-50 text-green-700 hover:border-primary-400 hover:bg-primary-50 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400',
                      ].join(' ')}
                    >
                      {seat.seatNumber}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* Confirm */}
      {selectedSeat && (
        <Card>
          <CardBody>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Seat {selectedSeat.seatNumber} selected
                  </p>
                  <p className="text-xs text-gray-500">
                    {schedule.route.origin} → {schedule.route.destination} · RWF {Number(schedule.price).toLocaleString()}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => bookMutation.mutate()}
                loading={bookMutation.isPending}
                className="shrink-0"
              >
                Confirm Booking
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
