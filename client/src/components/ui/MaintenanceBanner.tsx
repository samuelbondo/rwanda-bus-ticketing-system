import { AlertTriangle } from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'

export default function MaintenanceBanner() {
  const { maintenanceMode, maintenanceMessage } = useSettings()
  if (!maintenanceMode) return null

  return (
    <div className="flex items-center gap-3 bg-amber-500 px-4 py-2.5 text-sm font-medium text-white">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span>{maintenanceMessage}</span>
    </div>
  )
}
