import api from './api'
import type { User } from '@/types'

export const authService = {
  async login(email: string, password: string): Promise<{ user: User }> {
    const { data } = await api.post('/auth/login', { email, password })
    return data
  },

  async register(payload: {
    name: string
    email: string
    password: string
    phone?: string
  }): Promise<{ user: User }> {
    const { data } = await api.post('/auth/register', payload)
    return data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async getProfile(): Promise<User> {
    const { data } = await api.get('/auth/profile')
    return data.data
  },

  async updateProfile(payload: Partial<User>): Promise<User> {
    const { data } = await api.put('/auth/profile', payload)
    return data.data
  },
}
