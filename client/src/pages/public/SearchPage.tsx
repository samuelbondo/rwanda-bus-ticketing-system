import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
  const [searchParams] = useSearchParams()

  const [origin, setOrigin] = useState(searchParams.get('origin') ?? '')
  const [date, setDate]     = useState(searchParams.get('date') ?? '')
  const [submitted, setSubmitted] = useState(
    !!(searchParams.get('origin') || searchParams.get('date'))
  )

  // Re-sync if URL params change (e.g. back navigation)
  useEffect(() => {
    const o = searchParams.get('origin') ?? ''
    const d = searchParams.get('date') ?? ''
    setOrigin(o)
    setDate(d)
    if (o || d) setSubmitted(true)
  }, [searchParams])

  const { data, isLoading } = useQuery({
    queryKey: ['schedules', origin, date],
    queryFn: () => scheduleService.search({ origin, date }),
    enabled: submitted,
  })

  const schedules: Schedule[] = (data as { data: Schedule[] })?.data ?? []

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-12">
      <h1 className="mb-6 sm:mb-8 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
        Search Bus Schedules
      </h1>

      <Card className="mb-8">
        <CardBody>
          <form onSubmit={handleSearch}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <Input
                  label="From (origin)"
                  placeholder="e.g. Nyanza"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Input
                  label="Date"
                  type="date"
                  value={date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full sm:w-auto shrink-0">
                <Search className="mr-2 h-4 w-4" /> Search
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      )}

      {!isLoading && submitted && schedules.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 py-16 text-center dark:border-gray-700 dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400">No schedules found. Try a different date or route.</p>
        </div>
      )}

      <div className="space-y-4">
        {schedules.map((s) => (
          <Card key={s.id}>
            <CardBody>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                    <MapPin className="h-4 w-4 shrink-0 text-primary-600" />
                    <span className="truncate">{s.route.origin} → {s.route.destination}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      {new Date(s.departureTime).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      {s.availableSeats} seats left
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{s.bus.name} · {s.bus.plateNumber}</p>
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-start">
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary-600">RWF {Number(s.price).toLocaleString()}</p>
                    <Badge variant={statusVariant(s.status) as 'success' | 'danger' | 'default'}>{s.status}</Badge>
                  </div>
                  <Button
                    onClick={() => navigate('/login', { state: { scheduleId: s.id } })}
                    disabled={s.availableSeats === 0 || s.status !== 'SCHEDULED'}
                    className="shrink-0"
                  >
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
