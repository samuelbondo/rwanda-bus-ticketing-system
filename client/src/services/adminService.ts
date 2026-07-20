import api from './api'
import type { Bus, Route, User, AuditLog, ReportData, PaginatedResponse } from '@/types'

export const busService = {
  async getAll(): Promise<Bus[]> {
    const { data } = await api.get('/buses')
    return data.data
  },
  async create(payload: Partial<Bus>): Promise<Bus> {
    const { data } = await api.post('/buses', payload)
    return data.data
  },
  async update(id: string, payload: Partial<Bus>): Promise<Bus> {
    const { data } = await api.put(`/buses/${id}`, payload)
    return data.data
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/buses/${id}`)
  },
}

export const routeService = {
  async getAll(): Promise<Route[]> {
    const { data } = await api.get('/routes')
    return data.data
  },
  async create(payload: Partial<Route>): Promise<Route> {
    const { data } = await api.post('/routes', payload)
    return data.data
  },
  async update(id: string, payload: Partial<Route>): Promise<Route> {
    const { data } = await api.put(`/routes/${id}`, payload)
    return data.data
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/routes/${id}`)
  },
}

export const userService = {
  async getAll(): Promise<User[]> {
    const { data } = await api.get('/users')
    return data.data
  },
  async create(payload: Partial<User> & { password: string }): Promise<User> {
    const { data } = await api.post('/users', payload)
    return data.data
  },
  async update(id: string, payload: Partial<User>): Promise<User> {
    const { data } = await api.put(`/users/${id}`, payload)
    return data.data
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/users/${id}`)
  },
  async resetPassword(id: string, newPassword: string): Promise<void> {
    await api.post(`/users/${id}/reset-password`, { newPassword })
  },
  async sendPasswordReset(id: string, newPassword: string): Promise<void> {
    await api.post(`/users/${id}/send-password-reset`, { newPassword })
  },
}

export const reportService = {
  async get(period: string): Promise<ReportData> {
    const { data } = await api.get('/reports', { params: { period } })
    return data.data
  },
}

export const auditService = {
  async getAll(page = 1, limit = 20): Promise<PaginatedResponse<AuditLog>> {
    const { data } = await api.get('/audit-logs', { params: { page, limit } })
    return data
  },
}

export const seatService = {
  async getBySchedule(scheduleId: string) {
    const { data } = await api.get(`/seats/${scheduleId}`)
    return data.data
  },
}
