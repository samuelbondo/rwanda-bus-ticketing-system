import { Outlet } from 'react-router-dom'
import { LayoutDashboard, Ticket, User } from 'lucide-react'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'

const items = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'My Bookings', to: '/bookings', icon: Ticket },
  { label: 'Profile', to: '/profile', icon: User },
]

export default function CustomerLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-8 sm:px-6">
        <Sidebar items={items} title="Customer" />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
