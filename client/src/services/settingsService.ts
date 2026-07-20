import api from './api'

export interface FullSettings {
  id: string
  siteName: string
  supportPhone: string
  supportEmail: string
  supportAddress: string
  whatsappNumber: string
  whatsappMessage: string
  maintenanceMode: boolean
  maintenanceMessage: string
  geminiApiKey: string
  aiModel: string
  aiEnabled: boolean
  aiWelcomeMessage: string
  facebookUrl: string
  twitterUrl: string
  instagramUrl: string
  updatedAt: string
}

export const settingsService = {
  get: () => api.get<{ data: FullSettings }>('/settings').then((r) => r.data.data),
  update: (data: Partial<FullSettings>) => api.put<{ data: FullSettings }>('/settings', data).then((r) => r.data.data),
}
