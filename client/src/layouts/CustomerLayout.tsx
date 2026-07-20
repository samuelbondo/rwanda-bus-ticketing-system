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
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <DashboardHeader navItems={items} onMenuClick={() => setSidebarOpen(true)} />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6">
        <Sidebar
          items={items}
          title="My Account"
          mobileOpen={sidebarOpen}
          onMobileClose={() => setSidebarOpen(false)}
        />
        <main className="flex-1 min-w-0 rounded-xl border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-700 dark:bg-gray-800">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
