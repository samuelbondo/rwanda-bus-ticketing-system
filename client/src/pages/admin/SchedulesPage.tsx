import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Edit2, X, Search, CalendarDays, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'
import { scheduleService } from '@/services/scheduleService'
import { busService, routeService } from '@/services/adminService'
import { Button, Input, Card, CardBody, Badge, Skeleton } from '@/components/ui'
import type { Schedule, Bus, Route } from '@/types'

const PAGE_SIZE = 10

const schema = z.object({
  routeId: z.string().min(1, 'Select a route'),
  busId: z.string().min(1, 'Select a bus'),
  departureTime: z.string().min(1, 'Departure time required'),
  price: z.coerce.number().min(0, 'Price required'),
})
type FormData = z.infer<typeof schema>

const statusVariant = (s: string): 'success' | 'danger' | 'warning' | 'default' => {
  if (s === 'SCHEDULED') return 'success'
  if (s === 'CANCELLED') return 'danger'
  if (s === 'DEPARTED') return 'warning'
  return 'default'
}

function toLocalDatetime(iso: string) {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// ── Schedule Form Modal ───────────────────────────────────────────────────────
function ScheduleModal({
  title, defaultValues, buses, routes, onSubmit, onClose, loading,
}: {
  title: string
  defaultValues?: Partial<FormData>
  buses: Bus[]
  routes: Route[]
  onSubmit: (d: FormData) => void
  onClose: () => void
  loading: boolean
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Route</label>
              <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" {...register('routeId')}>
                <option value="">Select route</option>
                {routes.filter(r => r.isActive).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              {errors.routeId && <p className="mt-1 text-xs text-red-500">{errors.routeId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bus</label>
              <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" {...register('busId')}>
                <option value="">Select bus</option>
                {buses.filter(b => b.isActive).map((b) => <option key={b.id} value={b.id}>{b.name} ({b.plateNumber})</option>)}
              </select>
              {errors.busId && <p className="mt-1 text-xs text-red-500">{errors.busId.message}</p>}
            </div>
          </div>
          <Input label="Departure Time" type="datetime-local" error={errors.departureTime?.message} {...register('departureTime')} />
          <Input label="Price (RWF)" type="number" placeholder="2000" error={errors.price?.message} {...register('price')} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={loading}>Save Schedule</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Cancel Confirm Modal ──────────────────────────────────────────────────────
function CancelModal({ schedule, onConfirm, onClose, loading }: {
  schedule: Schedule
  onConfirm: () => void
  onClose: () => void
  loading: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Cancel Schedule?</p>
              <p className="text-sm text-gray-500">This will cancel all active bookings and notify passengers.</p>
            </div>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-3 text-sm space-y-1">
            <p className="font-medium text-gray-900 dark:text-white">{schedule.route.origin} → {schedule.route.destination}</p>
            <p className="text-gray-500">{new Date(schedule.departureTime).toLocaleString()} · {schedule.bus.name}</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={onClose}>Keep</Button>
            <Button variant="danger" onClick={onConfirm} loading={loading}>Yes, Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SchedulesPage() {
  const qc = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [editSchedule, setEditSchedule] = useState<Schedule | null>(null)
  const [cancelSchedule, setCancelSchedule] = useState<Schedule | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [dateFilter, setDateFilter] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['schedules', 'all'],
    queryFn: () => scheduleService.search({}),
  })
  const { data: buses = [] } = useQuery({ queryKey: ['buses'], queryFn: busService.getAll })
  const { data: routes = [] } = useQuery({ queryKey: ['routes'], queryFn: routeService.getAll })

  const allSchedules: Schedule[] = (data as { data: Schedule[] })?.data ?? []

  // Filter
  const filtered = useMemo(() => {
    return allSchedules.filter((s) => {
      const matchSearch = !search ||
        s.route.origin.toLowerCase().includes(search.toLowerCase()) ||
        s.route.destination.toLowerCase().includes(search.toLowerCase()) ||
        s.bus.name.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'ALL' || s.status === statusFilter
      const matchDate = !dateFilter || new Date(s.departureTime).toISOString().startsWith(dateFilter)
      return matchSearch && matchStatus && matchDate
    })
  }, [allSchedules, search, statusFilter, dateFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const scheduled = allSchedules.filter(s => s.status === 'SCHEDULED').length
  const cancelled = allSchedules.filter(s => s.status === 'CANCELLED').length

  const createMutation = useMutation({
    mutationFn: (d: FormData) => scheduleService.create({ ...d, departureTime: new Date(d.departureTime).toISOString() }),
    onSuccess: () => { toast.success('Schedule created'); qc.invalidateQueries({ queryKey: ['schedules'] }); setShowCreate(false) },
    onError: () => toast.error('Failed to create schedule'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, d }: { id: string; d: FormData }) =>
      scheduleService.update(id, { ...d, departureTime: new Date(d.departureTime).toISOString() }),
    onSuccess: () => { toast.success('Schedule updated'); qc.invalidateQueries({ queryKey: ['schedules'] }); setEditSchedule(null) },
    onError: () => toast.error('Failed to update schedule'),
  })

  const cancelMutation = useMutation({
    mutationFn: scheduleService.remove,
    onSuccess: () => { toast.success('Schedule cancelled'); qc.invalidateQueries({ queryKey: ['schedules'] }); setCancelSchedule(null) },
    onError: () => toast.error('Failed to cancel schedule'),
  })

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Schedules</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {allSchedules.length} total · {scheduled} active · {cancelled} cancelled
          </p>
        </div>
        <Button size="sm" onClick={() => { setShowCreate(true); setEditSchedule(null) }}>
          <Plus className="mr-1.5 h-4 w-4" />Add Schedule
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardBody className="py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="Search route or bus…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="date"
                className="rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:[color-scheme:dark] focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={dateFilter}
                onChange={(e) => { setDateFilter(e.target.value); setPage(1) }}
              />
            </div>
            <select
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            >
              <option value="ALL">All Statuses</option>
              {['SCHEDULED', 'DEPARTED', 'COMPLETED', 'CANCELLED'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {(search || dateFilter || statusFilter !== 'ALL') && (
              <button
                onClick={() => { setSearch(''); setDateFilter(''); setStatusFilter('ALL'); setPage(1) }}
                className="text-xs text-primary-600 hover:underline whitespace-nowrap"
              >
                Clear filters
              </button>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Table */}
      <Card>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : paginated.length === 0 ? (
            <div className="py-16 text-center">
              <CalendarDays className="mx-auto mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-400">No schedules found</p>
              {(search || dateFilter || statusFilter !== 'ALL') && (
                <button onClick={() => { setSearch(''); setDateFilter(''); setStatusFilter('ALL') }} className="mt-2 text-xs text-primary-600 hover:underline">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {['Route', 'Bus', 'Departure', 'Price', 'Seats', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {paginated.map((s) => {
                    const dep = new Date(s.departureTime)
                    const isPast = dep < new Date()
                    return (
                      <tr key={s.id} className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30 ${isPast && s.status === 'SCHEDULED' ? 'opacity-60' : ''}`}>
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                          {s.route.origin} → {s.route.destination}
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{s.bus.name}</td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          <div>{dep.toLocaleDateString('en-RW', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                          <div className="text-xs text-gray-400">{dep.toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-500">RWF {Number(s.price).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`font-medium ${s.availableSeats === 0 ? 'text-red-500' : s.availableSeats <= 5 ? 'text-orange-500' : 'text-gray-500'}`}>
                            {s.availableSeats}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={statusVariant(s.status)}>{s.status}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          {s.status === 'SCHEDULED' && (
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="secondary" onClick={() => { setEditSchedule(s); setShowCreate(false) }}>
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button size="sm" variant="danger" onClick={() => setCancelSchedule(s)}>
                                Cancel
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 px-4 py-3">
            <p className="text-xs text-gray-500">
              Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => p - 1)}
                disabled={page === 1}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`h-7 w-7 rounded-lg text-xs font-medium transition-colors ${p === page ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  >
                    {p}
                  </button>
                )
              })}
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page === totalPages}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-40 dark:hover:bg-gray-700"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Modals */}
      {showCreate && (
        <ScheduleModal
          title="New Schedule"
          buses={buses as Bus[]}
          routes={routes as Route[]}
          loading={createMutation.isPending}
          onSubmit={(d) => createMutation.mutate(d)}
          onClose={() => setShowCreate(false)}
        />
      )}

      {editSchedule && (
        <ScheduleModal
          title={`Edit — ${editSchedule.route.origin} → ${editSchedule.route.destination}`}
          defaultValues={{
            routeId: editSchedule.route.id,
            busId: editSchedule.bus.id,
            departureTime: toLocalDatetime(editSchedule.departureTime),
            price: editSchedule.price,
          }}
          buses={buses as Bus[]}
          routes={routes as Route[]}
          loading={updateMutation.isPending}
          onSubmit={(d) => updateMutation.mutate({ id: editSchedule.id, d })}
          onClose={() => setEditSchedule(null)}
        />
      )}

      {cancelSchedule && (
        <CancelModal
          schedule={cancelSchedule}
          loading={cancelMutation.isPending}
          onConfirm={() => cancelMutation.mutate(cancelSchedule.id)}
          onClose={() => setCancelSchedule(null)}
        />
      )}
    </div>
  )
}
