import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardBody, CardHeader, Button } from '@/components/ui'

const STORAGE_KEY = 'rbt_notif_prefs'

interface NotifPrefs {
  reminder24h: boolean
  boarding2h: boolean
  cancellationAlert: boolean
}

const defaults: NotifPrefs = { reminder24h: true, boarding2h: true, cancellationAlert: true }

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
        checked ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState<NotifPrefs>(() => {
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') }
    } catch {
      return defaults
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  }, [prefs])

  function set(key: keyof NotifPrefs, value: boolean) {
    setPrefs((p) => ({ ...p, [key]: value }))
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
    toast.success('Notification preferences saved')
  }

  const items: { key: keyof NotifPrefs; label: string; description: string }[] = [
    {
      key: 'reminder24h',
      label: '24-hour departure reminder',
      description: 'Receive an email reminder 24 hours before your bus departs.',
    },
    {
      key: 'boarding2h',
      label: 'Boarding alert (2 hours before)',
      description: 'Get notified 2 hours before departure to head to the boarding point.',
    },
    {
      key: 'cancellationAlert',
      label: 'Cancellation & refund updates',
      description: 'Be notified when a booking is cancelled or a refund is processed.',
    },
  ]

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          Choose which email alerts you want to receive for your trips.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-gray-400" />
            <p className="font-semibold text-gray-900 dark:text-white">Email Alerts</p>
          </div>
        </CardHeader>
        <CardBody className="divide-y divide-gray-100 dark:divide-gray-700 p-0">
          {items.map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>
              </div>
              <Toggle checked={prefs[key]} onChange={(v) => set(key, v)} />
            </div>
          ))}
        </CardBody>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save}>Save preferences</Button>
      </div>
    </div>
  )
}
