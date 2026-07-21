import api from './api'
import type { Route } from '@/types'

export const routeService = {
  async getAll(): Promise<Route[]> {
    const { data } = await api.get('/routes')
    return data.data
  },
}
