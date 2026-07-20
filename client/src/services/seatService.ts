import api from './api'
import type { Seat } from '@/types'

export const seatService = {
  async getBySchedule(scheduleId: string): Promise<Seat[]> {
    const { data } = await api.get(`/seats/${scheduleId}`)
    return data.data
  },
}
