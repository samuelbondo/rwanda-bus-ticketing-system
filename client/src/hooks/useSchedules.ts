import { useQuery } from '@tanstack/react-query'
import { scheduleService } from '@/services/scheduleService'
import type { Schedule } from '@/types'

export function useSchedules(filters: { origin?: string; date?: string }, enabled = true) {
  const { data, isLoading } = useQuery({
    queryKey: ['schedules', filters.origin, filters.date],
    queryFn: () => scheduleService.search(filters),
    enabled,
  })
  const schedules: Schedule[] = (data as { data: Schedule[] })?.data ?? []
  return { schedules, isLoading }
}

export function useScheduleById(id: string) {
  return useQuery({
    queryKey: ['schedule', id],
    queryFn: () => scheduleService.getById(id),
    enabled: !!id,
  })
}
