import api from './api'
import type { Booking, PaginatedResponse } from '@/types'

export const bookingService = {
  async create(payload: {
    scheduleId: string
    seatId: string
    source: string
    destination: string
  }): Promise<Booking> {
    const { data } = await api.post('/bookings', payload)
    return data.data
  },

  async getAll(params?: {
    page?: number
    limit?: number
    status?: string
  }): Promise<PaginatedResponse<Booking>> {
    const { data } = await api.get('/bookings', { params })
    return data
  },

  async getById(id: string): Promise<Booking> {
    const { data } = await api.get(`/bookings/${id}`)
    return data.data
  },

  async cancel(id: string, reason?: string): Promise<void> {
    await api.delete(`/bookings/${id}`, { data: { reason } })
  },

  async confirmPayment(id: string, method: 'MOMO' | 'CARD' | 'CASH', reference?: string, proofUrl?: string): Promise<void> {
    await api.post(`/bookings/${id}/pay`, { method, reference, proofUrl })
  },

  async approvePayment(id: string): Promise<void> {
    await api.post(`/bookings/${id}/approve`)
  },

  async rejectPayment(id: string, reason?: string): Promise<void> {
    await api.post(`/bookings/${id}/reject`, { reason })
  },

  async downloadTicket(id: string): Promise<Blob> {
    const { data } = await api.get(`/bookings/${id}/ticket`, {
      responseType: 'blob',
    })
    return data
  },
}
