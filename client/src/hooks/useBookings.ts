import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { bookingService } from '@/services/bookingService'
import type { Booking } from '@/types'

export function useBookings() {
  const { data, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => bookingService.getAll(),
  })
  const bookings: Booking[] = (data as { data: Booking[] })?.data ?? []
  return { bookings, isLoading }
}

export function useBookingById(id: string) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => bookingService.getById(id),
    enabled: !!id,
  })
}

export function useCancelBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bookingService.cancel(id),
    onSuccess: () => {
      toast.success('Booking cancelled')
      qc.invalidateQueries({ queryKey: ['bookings'] })
      qc.invalidateQueries({ queryKey: ['schedules'] })
      qc.invalidateQueries({ queryKey: ['schedule'] })
      qc.invalidateQueries({ queryKey: ['seats'] })
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? 'Cancellation failed')
    },
  })
}

export function useDownloadTicket() {
  return async (id: string, ticketNumber: string) => {
    try {
      const blob = await bookingService.downloadTicket(id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ticket-${ticketNumber}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Failed to download ticket')
    }
  }
}
