import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '@/services/api'
import { Card, CardBody, Badge, Skeleton, Button } from '@/components/ui'
import { Users, CheckCircle, Clock, ArrowLeft, PlaneTakeoff, Search } from 'lucide-react'

interface ManifestBooking {
  id: string
  ticketNumber: string
  status: 'CONFIRMED' | 'USED'
  seat: { seatNumber: string }
  user: { name: string; email: string; phone?: string }
}

interface Manifest {
  schedule: {
    id: string
    departureTime: string
    status: string
    route: { origin: string; destination: string }
    bus: { name: string; plateNumber: string }
  }
  total: number
  checkedIn: number
  pending: number
  bookings: ManifestBooking[]
}

export default function PassengerManifestPage() {
  const { scheduleId } = useParams<{ scheduleId: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['manifest', scheduleId],
    queryFn: async () => {
      const res = await api.get(`/bookings/manifest/${scheduleId}`)
      return res.data.data as Manifest
    },
    refetchInterval: 15_000,
  })

  const departMutation = useMutation({
    mutationFn: () => api.post(`/bookings/manifest/${scheduleId}/depart`),
    onSuccess: () => {
      toast.success('Schedule marked as departed')
      qc.invalidateQueries({ queryKey: ['manifest', scheduleId] })
      qc.invalidateQueries({ queryKey: ['schedules', 'today'] })
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed'
      toast.error(msg)
    },
  })

  const filtered = (data?.bookings ?? []).filter((b) =>
    b.user.name.toLowerCase().includes(search.toLowerCase()) ||
    b.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
    b.seat.seatNumber.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/agent/trips')} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Passenger Manifest</h1>
          {data && (
            <p className="mt-0.5 text-sm text-gray-500">
              {data.schedule.route.origin} → {data.schedule.route.destination} ·{' '}
              {new Date(data.schedule.departureTime).toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' })} ·{' '}
              {data.schedule.bus.name} ({data.schedule.bus.plateNumber})
            </p>
          )}
        </div>
      </div>

      {isLoading && <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>}

      {data && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardBody className="flex items-center gap-3 py-3">
                <Users className="h-8 w-8 text-primary-600 shrink-0" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.total}</p>
                  <p className="text-xs text-gray-500">Total Booked</p>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="flex items-center gap-3 py-3">
                <CheckCircle className="h-8 w-8 text-green-500 shrink-0" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.checkedIn}</p>
                  <p className="text-xs text-gray-500">Checked In</p>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="flex items-center gap-3 py-3">
                <Clock className="h-8 w-8 text-orange-400 shrink-0" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.pending}</p>
                  <p className="text-xs text-gray-500">Not Yet Boarded</p>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Depart button */}
          {data.schedule.status === 'SCHEDULED' && (
            <div className="flex justify-end">
              <Button
                variant="danger"
                onClick={() => {
                  if (confirm('Mark this trip as DEPARTED? This cannot be undone.')) departMutation.mutate()
                }}
                loading={departMutation.isPending}
              >
                <PlaneTakeoff className="mr-2 h-4 w-4" /> Mark as Departed
              </Button>
            </div>
          )}
          {data.schedule.status === 'DEPARTED' && (
            <div className="flex justify-end">
              <Badge variant="warning">Trip Departed</Badge>
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, ticket, or seat…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Passenger list */}
          {filtered.length === 0 ? (
            <Card><CardBody><p className="text-center text-sm text-gray-500 py-6">No passengers found.</p></CardBody></Card>
          ) : (
            <div className="space-y-2">
              {filtered.map((b) => (
                <Card key={b.id} className={b.status === 'USED' ? 'opacity-60' : ''}>
                  <CardBody className="flex items-center justify-between py-3">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{b.user.name}</p>
                      <p className="text-xs text-gray-500">{b.ticketNumber} · Seat {b.seat.seatNumber}</p>
                      {b.user.phone && <p className="text-xs text-gray-400">{b.user.phone}</p>}
                    </div>
                    <Badge variant={b.status === 'USED' ? 'success' : 'warning'}>
                      {b.status === 'USED' ? '✓ Boarded' : 'Pending'}
                    </Badge>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
