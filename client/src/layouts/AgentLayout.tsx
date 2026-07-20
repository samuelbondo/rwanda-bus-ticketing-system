import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { LayoutDashboard, QrCode, CalendarDays, UserCircle } from 'lucide-react'
import DashboardHeader from '@/components/layout/DashboardHeader'
import Sidebar from '@/components/layout/Sidebar'

const items = [
  { label: 'Dashboard',     to: '/agent',          icon: LayoutDashboard },
  { label: "Today's Trips", to: '/agent/trips',    icon: CalendarDays },
  { label: 'Verify Ticket', to: '/agent/verify',   icon: QrCode },
  { label: 'My Profile',    to: '/agent/profile',  icon: UserCircle },
]

export default function AgentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50 dark:bg-gray-950">
      <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          items={items}
          title="Agent"
          mobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
