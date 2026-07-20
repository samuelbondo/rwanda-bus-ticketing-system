import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { LayoutDashboard, Ticket, User } from 'lucide-react'
import DashboardHeader from '@/components/layout/DashboardHeader'
import Sidebar from '@/components/layout/Sidebar'

const items = [
  { label: 'Dashboard',   to: '/dashboard', icon: LayoutDashboard },
  { label: 'My Bookings', to: '/bookings',  icon: Ticket },
  { label: 'Profile',     to: '/profile',   icon: User },
]

export default function CustomerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
      <div className="relative flex flex-1 overflow-hidden">
        <Sidebar
          items={items}
          title="My Account"
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
