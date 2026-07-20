import { useQuery } from '@tanstack/react-query'
import { scheduleService } from '@/services/scheduleService'
import { Card, CardBody, Badge, Skeleton } from '@/components/ui'
import type { Schedule } from '@/types'

export default function TodaysTripsPage() {
  const today = new Date().toISOString().split('T')[0]
  const { data, isLoading } = useQuery({
    queryKey: ['schedules', 'today'],
    queryFn: () => scheduleService.search({ date: today }),
  })

  const schedules: Schedule[] = (data as { data: Schedule[] })?.data ?? []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Today's Trips</h1>
      <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-RW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      {isLoading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
      ) : schedules.length === 0 ? (
        <Card><CardBody><p className="text-center text-gray-500 py-8">No trips scheduled for today.</p></CardBody></Card>
      ) : (
        <div className="space-y-4">
          {schedules.map((s) => (
            <Card key={s.id}>
              <CardBody>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{s.route.origin} → {s.route.destination}</p>
                    <p className="text-sm text-gray-500">{new Date(s.departureTime).toLocaleTimeString()} · {s.bus.name} · {s.bus.plateNumber}</p>
                    <p className="text-sm text-gray-500">{s.availableSeats} seats available</p>
                  </div>
                  <Badge variant={s.status === 'SCHEDULED' ? 'success' : 'default'}>{s.status}</Badge>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
