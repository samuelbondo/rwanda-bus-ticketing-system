import api from './api'
import type { Bus } from '@/types'

export const busService = {
  async getAll(): Promise<Bus[]> {
    const { data } = await api.get('/buses')
    return data.data
  },
}
