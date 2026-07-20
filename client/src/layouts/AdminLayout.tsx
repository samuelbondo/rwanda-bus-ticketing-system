import { Outlet } from 'react-router-dom'
import { LayoutDashboard, Users, Bus, Route, CalendarDays, Ticket, BarChart2, ScrollText } from 'lucide-react'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'

const items = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Buses', to: '/admin/buses', icon: Bus },
  { label: 'Routes', to: '/admin/routes', icon: Route },
  { label: 'Schedules', to: '/admin/schedules', icon: CalendarDays },
  { label: 'Bookings', to: '/admin/bookings', icon: Ticket },
  { label: 'Reports', to: '/admin/reports', icon: BarChart2 },
  { label: 'Audit Logs', to: '/admin/audit-logs', icon: ScrollText },
]

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-8 sm:px-6">
        <Sidebar items={items} title="Admin" />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
