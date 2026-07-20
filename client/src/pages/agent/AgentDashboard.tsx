import { useAuth } from '@/contexts/AuthContext'
import { Card, CardBody } from '@/components/ui'
import { QrCode, CalendarDays } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AgentDashboard() {
  const { user } = useAuth()
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agent Dashboard</h1>
      <p className="text-gray-500">Welcome, {user?.name}. Use the tools below to assist passengers.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/agent/verify">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardBody className="flex items-center gap-4">
              <QrCode className="h-10 w-10 text-primary-600" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Verify Ticket</p>
                <p className="text-sm text-gray-500">Scan or enter a ticket number to verify boarding.</p>
              </div>
            </CardBody>
          </Card>
        </Link>
        <Link to="/agent/trips">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardBody className="flex items-center gap-4">
              <CalendarDays className="h-10 w-10 text-primary-600" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Today's Trips</p>
                <p className="text-sm text-gray-500">View all scheduled departures for today.</p>
              </div>
            </CardBody>
          </Card>
        </Link>
      </div>
    </div>
  )
}
