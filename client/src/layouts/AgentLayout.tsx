import { Outlet } from 'react-router-dom'
import { LayoutDashboard, QrCode, CalendarDays } from 'lucide-react'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'

const items = [
  { label: 'Dashboard', to: '/agent', icon: LayoutDashboard },
  { label: "Today's Trips", to: '/agent/trips', icon: CalendarDays },
  { label: 'Verify Ticket', to: '/agent/verify', icon: QrCode },
]

export default function AgentLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-8 sm:px-6">
        <Sidebar items={items} title="Agent" />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
