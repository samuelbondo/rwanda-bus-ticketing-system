import { MapPin, Clock, Bus, Users } from 'lucide-react'
import { Card, CardBody } from '@/components/ui'
import type { Schedule } from '@/types'

interface ScheduleSummaryProps {
  schedule: Schedule
}

export default function ScheduleSummary({ schedule }: ScheduleSummaryProps) {
  const dep = new Date(schedule.departureTime)
  return (
    <Card>
      <CardBody className="space-y-3">
        <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
          <MapPin className="h-4 w-4 text-primary-600 shrink-0" />
          {schedule.route.origin} → {schedule.route.destination}
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 shrink-0" />
            {dep.toLocaleDateString('en-RW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {' at '}
            {dep.toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="flex items-center gap-1.5">
            <Bus className="h-4 w-4 shrink-0" />
            {schedule.bus.name} · {schedule.bus.plateNumber}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-4 w-4 shrink-0" />
            {schedule.availableSeats} seats available
          </span>
        </div>
        <div className="pt-1 text-lg font-bold text-primary-600">
          RWF {Number(schedule.price).toLocaleString()}
        </div>
      </CardBody>
    </Card>
  )
}
