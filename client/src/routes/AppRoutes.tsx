import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

import PublicLayout from '@/layouts/PublicLayout'
import CustomerLayout from '@/layouts/CustomerLayout'
import AgentLayout from '@/layouts/AgentLayout'
import AdminLayout from '@/layouts/AdminLayout'

// Public pages
import HomePage from '@/pages/public/HomePage'
import SearchPage from '@/pages/public/SearchPage'
import LoginPage from '@/pages/public/LoginPage'
import RegisterPage from '@/pages/public/RegisterPage'
import ResetPasswordPage from '@/pages/public/ResetPasswordPage'

// Customer pages
import CustomerDashboard from '@/pages/customer/CustomerDashboard'
import BookingHistoryPage from '@/pages/customer/BookingHistoryPage'
import BookingPage from '@/pages/customer/BookingPage'
import TicketPage from '@/pages/customer/TicketPage'
import ProfilePage from '@/pages/customer/ProfilePage'
import NotificationsPage from '@/pages/customer/NotificationsPage'

// Agent pages
import AgentDashboard from '@/pages/agent/AgentDashboard'
import VerifyTicketPage from '@/pages/agent/VerifyTicketPage'
import TodaysTripsPage from '@/pages/agent/TodaysTripsPage'
import AgentProfilePage from '@/pages/agent/AgentProfilePage'
import PassengerManifestPage from '@/pages/agent/PassengerManifestPage'

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard'
import UsersPage from '@/pages/admin/UsersPage'
import BusesPage from '@/pages/admin/BusesPage'
import RoutesPage from '@/pages/admin/RoutesPage'
import SchedulesPage from '@/pages/admin/SchedulesPage'
import BookingsPage from '@/pages/admin/BookingsPage'
import ReportsPage from '@/pages/admin/ReportsPage'
import AuditLogsPage from '@/pages/admin/AuditLogsPage'

import AdminProfilePage from '@/pages/admin/AdminProfilePage'
import SlideshowPage from '@/pages/admin/SlideshowPage'
import SettingsPage from '@/pages/admin/SettingsPage'

import NotFoundPage from '@/pages/public/NotFoundPage'

function roleDashboard(role: string) {
  if (role === 'ADMIN') return '/admin'
  if (role === 'AGENT') return '/agent'
  return '/dashboard'
}

function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode
  roles: string[]
}) {
  const { user, isLoading } = useAuth()
  if (isLoading) return null
  if (!user) return <Navigate to="/login" replace />
  if (!roles.includes(user.role)) return <Navigate to={roleDashboard(user.role)} replace />
  return <>{children}</>
}

// Redirect already-authenticated users away from public-only pages
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  if (isLoading) return null
  if (user) return <Navigate to={roleDashboard(user.role)} replace />
  return <>{children}</>
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/reset-password" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />
      </Route>

      {/* Customer */}
      <Route
        element={
          <ProtectedRoute roles={['CUSTOMER']}>
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<CustomerDashboard />} />
        <Route path="/book/:scheduleId" element={<BookingPage />} />
        <Route path="/bookings" element={<BookingHistoryPage />} />
        <Route path="/bookings/:id/ticket" element={<TicketPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Agent */}
      <Route
        element={
          <ProtectedRoute roles={['AGENT']}>
            <AgentLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/agent" element={<AgentDashboard />} />
        <Route path="/agent/verify" element={<VerifyTicketPage />} />
        <Route path="/agent/trips" element={<TodaysTripsPage />} />
        <Route path="/agent/manifest/:scheduleId" element={<PassengerManifestPage />} />
        <Route path="/agent/profile" element={<AgentProfilePage />} />
      </Route>

      {/* Admin */}
      <Route
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UsersPage />} />
        <Route path="/admin/buses" element={<BusesPage />} />
        <Route path="/admin/routes" element={<RoutesPage />} />
        <Route path="/admin/schedules" element={<SchedulesPage />} />
        <Route path="/admin/bookings" element={<BookingsPage />} />
        <Route path="/admin/reports" element={<ReportsPage />} />
        <Route path="/admin/slideshow" element={<SlideshowPage />} />
        <Route path="/admin/settings" element={<SettingsPage />} />
        <Route path="/admin/profile" element={<AdminProfilePage />} />
        <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
