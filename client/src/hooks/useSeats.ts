import { useQuery } from '@tanstack/react-query'
import { seatService } from '@/services/seatService'
import type { Seat } from '@/types'

export function useSeats(scheduleId: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['seats', scheduleId],
    queryFn: () => seatService.getBySchedule(scheduleId),
    enabled: !!scheduleId,
  })
  const seats: Seat[] = data ?? []
  return { seats, isLoading }
}
