import api from './api'
import type { User } from '@/types'

export const authService = {
  async login(email: string, password: string): Promise<{ user: User }> {
    const { data } = await api.post('/auth/login', { email, password })
    const { user, token } = data.data
    localStorage.setItem('token', token)
    return { user }
  },

  async register(payload: {
    name: string
    email: string
    password: string
    phone?: string
  }): Promise<{ user: User }> {
    const { data } = await api.post('/auth/register', payload)
    const { user, token } = data.data
    localStorage.setItem('token', token)
    return { user }
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
    localStorage.removeItem('token')
  },

  async getProfile(): Promise<User> {
    const { data } = await api.get('/auth/profile')
    return data.data
  },

  async updateProfile(payload: { name?: string; phone?: string; avatarUrl?: string }): Promise<User> {
    const { data } = await api.put('/auth/profile', payload)
    return data.data
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/auth/change-password', { currentPassword, newPassword })
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email })
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await api.post('/auth/reset-password', { token, password })
  },
}
