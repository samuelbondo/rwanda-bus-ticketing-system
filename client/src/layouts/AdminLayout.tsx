import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { LayoutDashboard, Users, Bus, Route, CalendarDays, Ticket, BarChart2, ScrollText, UserCircle } from 'lucide-react'
import DashboardHeader from '@/components/layout/DashboardHeader'
import Sidebar from '@/components/layout/Sidebar'

const items = [
  { label: 'Dashboard',  to: '/admin',              icon: LayoutDashboard },
  { label: 'Users',      to: '/admin/users',         icon: Users },
  { label: 'Buses',      to: '/admin/buses',         icon: Bus },
  { label: 'Routes',     to: '/admin/routes',        icon: Route },
  { label: 'Schedules',  to: '/admin/schedules',     icon: CalendarDays },
  { label: 'Bookings',   to: '/admin/bookings',      icon: Ticket },
  { label: 'Reports',    to: '/admin/reports',       icon: BarChart2 },
  { label: 'Audit Logs', to: '/admin/audit-logs',    icon: ScrollText },
  { label: 'My Profile', to: '/admin/profile',       icon: UserCircle },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Top header — full width */}
      <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />

      {/* Body: sidebar + main side by side */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          items={items}
          title="Admin"
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
