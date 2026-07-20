import { Outlet } from 'react-router-dom'
import { LayoutDashboard, QrCode, CalendarDays } from 'lucide-react'
import DashboardHeader from '@/components/layout/DashboardHeader'
import Sidebar from '@/components/layout/Sidebar'

const items = [
  { label: 'Dashboard',    to: '/agent',        icon: LayoutDashboard },
  { label: "Today's Trips", to: '/agent/trips',  icon: CalendarDays },
  { label: 'Verify Ticket', to: '/agent/verify', icon: QrCode },
]

export default function AgentLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <DashboardHeader navItems={items} />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6">
        <Sidebar items={items} title="Agent" />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
