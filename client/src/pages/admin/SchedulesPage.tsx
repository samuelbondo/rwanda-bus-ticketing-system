import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
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

export default function SchedulesPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const { data, isLoading } = useQuery({ queryKey: ['schedules', 'all'], queryFn: () => scheduleService.search({}) })
  const { data: buses = [] } = useQuery({ queryKey: ['buses'], queryFn: busService.getAll })
  const { data: routes = [] } = useQuery({ queryKey: ['routes'], queryFn: routeService.getAll })

  const schedules: Schedule[] = (data as { data: Schedule[] })?.data ?? []

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const createMutation = useMutation({
    mutationFn: (d: FormData) => scheduleService.create({ ...d, departureTime: new Date(d.departureTime).toISOString() }),
    onSuccess: () => { toast.success('Schedule created'); qc.invalidateQueries({ queryKey: ['schedules'] }); reset(); setShowForm(false) },
    onError: () => toast.error('Failed to create schedule'),
  })

  const cancelMutation = useMutation({
    mutationFn: scheduleService.remove,
    onSuccess: () => { toast.success('Schedule cancelled'); qc.invalidateQueries({ queryKey: ['schedules'] }) },
    onError: () => toast.error('Failed to cancel schedule'),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Schedules</h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)}><Plus className="mr-1 h-4 w-4" />Add Schedule</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><p className="font-semibold text-gray-900 dark:text-white">New Schedule</p></CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Route</label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" {...register('routeId')}>
                  <option value="">Select route</option>
                  {(routes as Route[]).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                {errors.routeId && <p className="mt-1 text-xs text-red-500">{errors.routeId.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bus</label>
                <select className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" {...register('busId')}>
                  <option value="">Select bus</option>
                  {(buses as Bus[]).map((b) => <option key={b.id} value={b.id}>{b.name} ({b.plateNumber})</option>)}
                </select>
                {errors.busId && <p className="mt-1 text-xs text-red-500">{errors.busId.message}</p>}
              </div>
              <Input label="Departure Time" type="datetime-local" error={errors.departureTime?.message} {...register('departureTime')} />
              <Input label="Price (RWF)" type="number" placeholder="2000" error={errors.price?.message} {...register('price')} />
              <div className="sm:col-span-2 flex justify-end">
                <Button type="submit" loading={isSubmitting}>Create</Button>
              </div>
            </form>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 dark:border-gray-700">
                  <tr className="text-left text-gray-500">
                    {['Route', 'Bus', 'Departure', 'Price', 'Seats', 'Status', ''].map((h) => (
                      <th key={h} className="px-4 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {schedules.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{s.route.origin} → {s.route.destination}</td>
                      <td className="px-4 py-3 text-gray-500">{s.bus.name}</td>
                      <td className="px-4 py-3 text-gray-500">{new Date(s.departureTime).toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-500">RWF {Number(s.price).toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-500">{s.availableSeats}</td>
                      <td className="px-4 py-3"><Badge variant={statusVariant(s.status)}>{s.status}</Badge></td>
                      <td className="px-4 py-3">
                        {s.status === 'SCHEDULED' && (
                          <Button size="sm" variant="danger" onClick={() => cancelMutation.mutate(s.id)}>Cancel</Button>
                        )}
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
