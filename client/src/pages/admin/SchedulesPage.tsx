import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Edit2, X } from 'lucide-react'
import { scheduleService } from '@/services/scheduleService'
import { busService, routeService } from '@/services/adminService'
import { Button, Input, Card, CardBody, CardHeader, Badge, Skeleton } from '@/components/ui'
import type { Schedule, Bus, Route } from '@/types'

const schema = z.object({
  routeId: z.string().uuid(),
  busId: z.string().uuid(),
  departureTime: z.string().min(1),
  price: z.coerce.number().min(0),
})
type FormData = z.infer<typeof schema>

const statusVariant = (s: string): 'success' | 'danger' | 'warning' | 'default' => {
  if (s === 'SCHEDULED') return 'success'
  if (s === 'CANCELLED') return 'danger'
  if (s === 'DEPARTED') return 'warning'
  return 'default'
}

function ScheduleForm({
  title, defaultValues, buses, routes, onSubmit, onCancel, loading,
}: {
  title: string
  defaultValues?: Partial<FormData>
  buses: Bus[]
  routes: Route[]
  onSubmit: (d: FormData) => void
  onCancel: () => void
  loading: boolean
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues,
  })
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Route</label>
            <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" {...register('routeId')}>
              <option value="">Select route</option>
              {routes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            {errors.routeId && <p className="mt-1 text-xs text-red-500">{errors.routeId.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bus</label>
            <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" {...register('busId')}>
              <option value="">Select bus</option>
              {buses.map((b) => <option key={b.id} value={b.id}>{b.name} ({b.plateNumber})</option>)}
            </select>
            {errors.busId && <p className="mt-1 text-xs text-red-500">{errors.busId.message}</p>}
          </div>
          <Input label="Departure Time" type="datetime-local" error={errors.departureTime?.message} {...register('departureTime')} />
          <Input label="Price (RWF)" type="number" placeholder="2000" error={errors.price?.message} {...register('price')} />
          <div className="sm:col-span-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
            <Button type="submit" loading={loading}>Save Schedule</Button>
          </div>
        </form>
      </CardBody>
    </Card>
  )
}

export default function SchedulesPage() {
  const qc = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [editSchedule, setEditSchedule] = useState<Schedule | null>(null)
  const { data, isLoading } = useQuery({ queryKey: ['schedules', 'all'], queryFn: () => scheduleService.search({}) })
  const { data: buses = [] } = useQuery({ queryKey: ['buses'], queryFn: busService.getAll })
  const { data: routes = [] } = useQuery({ queryKey: ['routes'], queryFn: routeService.getAll })

  const schedules: Schedule[] = (data as { data: Schedule[] })?.data ?? []

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
    onSuccess: () => { toast.success('Schedule cancelled'); qc.invalidateQueries({ queryKey: ['schedules'] }) },
    onError: () => toast.error('Failed to cancel schedule'),
  })

  const toLocalDatetime = (iso: string) => {
    const d = new Date(iso)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Schedules</h1>
        <Button size="sm" onClick={() => { setShowCreate(true); setEditSchedule(null) }}>
          <Plus className="mr-1 h-4 w-4" />Add Schedule
        </Button>
      </div>

      {showCreate && (
        <ScheduleForm
          title="New Schedule"
          buses={buses as Bus[]}
          routes={routes as Route[]}
          loading={createMutation.isPending}
          onSubmit={(d) => createMutation.mutate(d)}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {editSchedule && (
        <ScheduleForm
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
          onCancel={() => setEditSchedule(null)}
        />
      )}

      <Card>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
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
                  {schedules.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{s.route.origin} → {s.route.destination}</td>
                      <td className="px-4 py-3 text-gray-500">{s.bus.name}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(s.departureTime).toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-500">RWF {Number(s.price).toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-500">{s.availableSeats}</td>
                      <td className="px-4 py-3"><Badge variant={statusVariant(s.status)}>{s.status}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {s.status === 'SCHEDULED' && (
                            <Button size="sm" variant="secondary" onClick={() => { setEditSchedule(s); setShowCreate(false) }}>
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {s.status === 'SCHEDULED' && (
                            <Button size="sm" variant="danger" onClick={() => cancelMutation.mutate(s.id)}>Cancel</Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
