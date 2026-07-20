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
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <DashboardHeader navItems={items} />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6">
        <Sidebar items={items} title="Admin" />
        <main className="flex-1 min-w-0 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
