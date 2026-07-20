import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, MapPin, Calendar, Users } from 'lucide-react'
import { scheduleService } from '@/services/scheduleService'
import { Button, Input, Card, CardBody, Badge, Skeleton } from '@/components/ui'
import type { Schedule } from '@/types'

function statusVariant(s: string) {
  return s === 'SCHEDULED' ? 'success' : s === 'CANCELLED' ? 'danger' : 'default'
}

export default function SearchPage() {
  const navigate = useNavigate()
  const [origin, setOrigin] = useState('')
  const [date, setDate] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['schedules', origin, date],
    queryFn: () => scheduleService.search({ origin, date }),
    enabled: submitted,
  })

  const schedules: Schedule[] = (data as { data: Schedule[] })?.data ?? []

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">Search Bus Schedules</h1>

      <Card className="mb-8">
        <CardBody>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Input label="From (origin)" placeholder="e.g. Nyanza" value={origin} onChange={(e) => setOrigin(e.target.value)} />
            <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <div className="flex items-end">
              <Button onClick={() => setSubmitted(true)} className="w-full sm:w-auto">
                <Search className="mr-2 h-4 w-4" /> Search
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      )}

      {!isLoading && submitted && schedules.length === 0 && (
        <p className="text-center text-gray-500">No schedules found. Try a different date or route.</p>
      )}

      <div className="space-y-4">
        {schedules.map((s) => (
          <Card key={s.id}>
            <CardBody>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                    <MapPin className="h-4 w-4 text-primary-600" />
                    {s.route.origin} → {s.route.destination}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(s.departureTime).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {s.availableSeats} seats left
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{s.bus.name} · {s.bus.plateNumber}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary-600">RWF {Number(s.price).toLocaleString()}</p>
                    <Badge variant={statusVariant(s.status) as 'success' | 'danger' | 'default'}>{s.status}</Badge>
                  </div>
                  <Button onClick={() => navigate(`/login`, { state: { scheduleId: s.id } })} disabled={s.availableSeats === 0 || s.status !== 'SCHEDULED'}>
                    Book
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}
