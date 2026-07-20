import api from './api'
import type { HeroSlide, SlideshowConfig, SlideshowSource } from '@/types'

export const slideshowService = {
  async getPublic(): Promise<{ config: SlideshowConfig; slides: HeroSlide[] }> {
    const { data } = await api.get('/slideshow')
    return data.data
  },
  async getConfig(): Promise<SlideshowConfig> {
    const { data } = await api.get('/slideshow/config')
    return data.data
  },
  async updateConfig(payload: { source?: SlideshowSource; interval?: number }): Promise<SlideshowConfig> {
    const { data } = await api.put('/slideshow/config', payload)
    return data.data
  },
  async getSlides(): Promise<HeroSlide[]> {
    const { data } = await api.get('/slideshow/slides')
    return data.data
  },
  async createSlide(payload: Partial<HeroSlide>): Promise<HeroSlide> {
    const { data } = await api.post('/slideshow/slides', payload)
    return data.data
  },
  async updateSlide(id: string, payload: Partial<HeroSlide>): Promise<HeroSlide> {
    const { data } = await api.put(`/slideshow/slides/${id}`, payload)
    return data.data
  },
  async deleteSlide(id: string): Promise<void> {
    await api.delete(`/slideshow/slides/${id}`)
  },
}
