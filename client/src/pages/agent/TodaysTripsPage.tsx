import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { scheduleService } from '@/services/scheduleService'
import { Card, CardBody, Badge, Skeleton, Button } from '@/components/ui'
import { Users, Clock, ChevronRight, QrCode } from 'lucide-react'
import type { Schedule } from '@/types'

export default function TodaysTripsPage() {
  const today = new Date().toISOString().split('T')[0]
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['schedules', 'today'],
    queryFn: () => scheduleService.search({ date: today }),
    refetchInterval: 30_000,
  })

  const schedules: Schedule[] = (data as { data: Schedule[] })?.data ?? []

  function statusVariant(s: string): 'success' | 'warning' | 'danger' | 'default' {
    if (s === 'SCHEDULED') return 'success'
    if (s === 'DEPARTED') return 'warning'
    if (s === 'CANCELLED') return 'danger'
    return 'default'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Today's Trips</h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          {new Date().toLocaleDateString('en-RW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          {' · '}{schedules.length} trip{schedules.length !== 1 ? 's' : ''} scheduled
        </p>
      </div>

      {isLoading && (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)}</div>
      )}

      {!isLoading && schedules.length === 0 && (
        <Card><CardBody><p className="text-center text-gray-500 py-8">No trips scheduled for today.</p></CardBody></Card>
      )}

      {!isLoading && schedules.length > 0 && (
        <div className="space-y-3">
          {schedules.map((s) => {
            const dep = new Date(s.departureTime)
            const timeStr = dep.toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' })
            const booked = s.bus.capacity - s.availableSeats
            const pct = Math.round((booked / s.bus.capacity) * 100)

            return (
              <Card key={s.id}>
                <CardBody>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {s.route.origin} → {s.route.destination}
                        </p>
                        <Badge variant={statusVariant(s.status)}>{s.status}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{timeStr}</span>
                        <span>{s.bus.name} · {s.bus.plateNumber}</span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {booked}/{s.bus.capacity} booked ({pct}%)
                        </span>
                      </div>
                      {/* Occupancy bar */}
                      <div className="h-1.5 w-full max-w-xs rounded-full bg-gray-100 dark:bg-gray-700">
                        <div
                          className={`h-1.5 rounded-full transition-all ${pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-orange-400' : 'bg-green-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => navigate(`/agent/verify?scheduleId=${s.id}`)}
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/agent/manifest/${s.id}`)}
                      >
                        Manifest <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
