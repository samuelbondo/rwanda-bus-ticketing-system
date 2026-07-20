import { CheckCircle } from 'lucide-react'
import { Card, CardBody, Button } from '@/components/ui'
import type { Seat, Schedule } from '@/types'

interface SeatConfirmProps {
  seat: Seat
  schedule: Schedule
  loading: boolean
  onConfirm: () => void
}

export default function SeatConfirm({ seat, schedule, loading, onConfirm }: SeatConfirmProps) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                Seat {seat.seatNumber} selected
              </p>
              <p className="text-xs text-gray-500">
                {schedule.route.origin} → {schedule.route.destination} · RWF {Number(schedule.price).toLocaleString()}
              </p>
            </div>
          </div>
          <Button onClick={onConfirm} loading={loading} className="shrink-0">
            Proceed to Payment
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}
