import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import api from '@/services/api'

export interface PublicSettings {
  siteName: string
  supportPhone: string
  supportEmail: string
  supportAddress: string
  whatsappNumber: string
  whatsappMessage: string
  maintenanceMode: boolean
  maintenanceMessage: string
  aiEnabled: boolean
  aiWelcomeMessage: string
  facebookUrl: string
  twitterUrl: string
  instagramUrl: string
}

const defaults: PublicSettings = {
  siteName: 'Rwanda Bus',
  supportPhone: '+250794047261',
  supportEmail: 'rwandabus@gmail.com',
  supportAddress: 'KG 7 Ave, Kigali, Rwanda',
  whatsappNumber: '+250794047261',
  whatsappMessage: 'Hello! I need help with my bus booking.',
  maintenanceMode: false,
  maintenanceMessage: 'We are currently performing scheduled maintenance.',
  aiEnabled: true,
  aiWelcomeMessage: "Hi! I'm your Rwanda Bus assistant. How can I help you today?",
  facebookUrl: '',
  twitterUrl: '',
  instagramUrl: '',
}

const SettingsContext = createContext<PublicSettings>(defaults)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PublicSettings>(defaults)

  useEffect(() => {
    api.get<{ data: PublicSettings }>('/settings/public')
      .then((r) => setSettings(r.data.data))
      .catch(() => {/* use defaults */})
  }, [])

  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  return useContext(SettingsContext)
}
