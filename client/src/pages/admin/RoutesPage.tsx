import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Edit2, X } from 'lucide-react'
import { routeService } from '@/services/adminService'
import { Button, Input, Card, CardBody, CardHeader, Badge, Skeleton } from '@/components/ui'
import type { Route } from '@/types'

const schema = z.object({
  name: z.string().min(2),
  origin: z.string().min(2),
  destination: z.string().min(2),
  basePrice: z.coerce.number().min(0),
})
type FormData = z.infer<typeof schema>

function RouteForm({
  title, defaultValues, onSubmit, onCancel, loading,
}: {
  title: string
  defaultValues?: Partial<FormData>
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
          <Input label="Route Name" placeholder="Nyanza – Kigali" error={errors.name?.message} {...register('name')} />
          <Input label="Origin" placeholder="Nyanza" error={errors.origin?.message} {...register('origin')} />
          <Input label="Destination" placeholder="Kigali" error={errors.destination?.message} {...register('destination')} />
          <Input label="Base Price (RWF)" type="number" placeholder="2000" error={errors.basePrice?.message} {...register('basePrice')} />
          <div className="sm:col-span-2 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
            <Button type="submit" loading={loading}>Save Route</Button>
          </div>
        </form>
      </CardBody>
    </Card>
  )
}

export default function RoutesPage() {
  const qc = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [editRoute, setEditRoute] = useState<Route | null>(null)
  const { data: routes = [], isLoading } = useQuery({ queryKey: ['routes'], queryFn: routeService.getAll })

  const createMutation = useMutation({
    mutationFn: routeService.create,
    onSuccess: () => { toast.success('Route created'); qc.invalidateQueries({ queryKey: ['routes'] }); setShowCreate(false) },
    onError: () => toast.error('Failed to create route'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Route> }) => routeService.update(id, data),
    onSuccess: () => { toast.success('Route updated'); qc.invalidateQueries({ queryKey: ['routes'] }); setEditRoute(null) },
    onError: () => toast.error('Failed to update route'),
  })

  const toggleMutation = useMutation<void, Error, { id: string; active: boolean }>({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      await (active ? routeService.remove(id) : routeService.update(id, { isActive: true }))
    },
    onSuccess: () => { toast.success('Route updated'); qc.invalidateQueries({ queryKey: ['routes'] }) },
    onError: () => toast.error('Failed to update route'),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Routes</h1>
        <Button size="sm" onClick={() => { setShowCreate(true); setEditRoute(null) }}>
          <Plus className="mr-1 h-4 w-4" />Add Route
        </Button>
      </div>

      {showCreate && (
        <RouteForm
          title="New Route"
          loading={createMutation.isPending}
          onSubmit={(d) => createMutation.mutate(d)}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {editRoute && (
        <RouteForm
          title={`Edit — ${editRoute.name}`}
          defaultValues={{ name: editRoute.name, origin: editRoute.origin, destination: editRoute.destination, basePrice: editRoute.basePrice }}
          loading={updateMutation.isPending}
          onSubmit={(d) => updateMutation.mutate({ id: editRoute.id, data: d })}
          onCancel={() => setEditRoute(null)}
        />
      )}

      <Card>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">{[1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {['Name', 'Origin', 'Destination', 'Base Price', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {(routes as Route[]).map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{r.name}</td>
                      <td className="px-4 py-3 text-gray-500">{r.origin}</td>
                      <td className="px-4 py-3 text-gray-500">{r.destination}</td>
                      <td className="px-4 py-3 text-gray-500">RWF {Number(r.basePrice).toLocaleString()}</td>
                      <td className="px-4 py-3"><Badge variant={r.isActive ? 'success' : 'danger'}>{r.isActive ? 'Active' : 'Inactive'}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="secondary" onClick={() => { setEditRoute(r); setShowCreate(false) }}>
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant={r.isActive ? 'danger' : 'secondary'}
                            onClick={() => toggleMutation.mutate({ id: r.id, active: r.isActive })}
                          >
                            {r.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
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
