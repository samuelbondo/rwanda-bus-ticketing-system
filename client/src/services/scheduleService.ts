import api from './api'
import type { Schedule, PaginatedResponse } from '@/types'

export const scheduleService = {
  async search(params: {
    origin?: string
    destination?: string
    date?: string
    page?: number
    limit?: number
  }): Promise<PaginatedResponse<Schedule>> {
    const { data } = await api.get('/schedules', { params })
    return data
  },

  async getById(id: string): Promise<Schedule> {
    const { data } = await api.get(`/schedules/${id}`)
    return data.data
  },

  async create(payload: Partial<Schedule>): Promise<Schedule> {
    const { data } = await api.post('/schedules', payload)
    return data.data
  },

  async update(id: string, payload: Partial<Schedule>): Promise<Schedule> {
    const { data } = await api.put(`/schedules/${id}`, payload)
    return data.data
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/schedules/${id}`)
  },
}
