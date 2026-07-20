import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
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

export default function RoutesPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const { data: routes = [], isLoading } = useQuery({ queryKey: ['routes'], queryFn: routeService.getAll })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const createMutation = useMutation({
    mutationFn: routeService.create,
    onSuccess: () => { toast.success('Route created'); qc.invalidateQueries({ queryKey: ['routes'] }); reset(); setShowForm(false) },
    onError: () => toast.error('Failed to create route'),
  })

  const deactivate = useMutation({
    mutationFn: routeService.remove,
    onSuccess: () => { toast.success('Route deactivated'); qc.invalidateQueries({ queryKey: ['routes'] }) },
    onError: () => toast.error('Failed to deactivate route'),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Routes</h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)}><Plus className="mr-1 h-4 w-4" />Add Route</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><p className="font-semibold text-gray-900 dark:text-white">New Route</p></CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="grid gap-4 sm:grid-cols-2">
              <Input label="Route Name" placeholder="Nyanza – Kigali" error={errors.name?.message} {...register('name')} />
              <Input label="Origin" placeholder="Nyanza" error={errors.origin?.message} {...register('origin')} />
              <Input label="Destination" placeholder="Kigali" error={errors.destination?.message} {...register('destination')} />
              <Input label="Base Price (RWF)" type="number" placeholder="2000" error={errors.basePrice?.message} {...register('basePrice')} />
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
            <div className="space-y-3 p-6">{[1, 2].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 dark:border-gray-700">
                  <tr className="text-left text-gray-500">
                    {['Name', 'Origin', 'Destination', 'Base Price', 'Status', ''].map((h) => (
                      <th key={h} className="px-4 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {(routes as Route[]).map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{r.name}</td>
                      <td className="px-4 py-3 text-gray-500">{r.origin}</td>
                      <td className="px-4 py-3 text-gray-500">{r.destination}</td>
                      <td className="px-4 py-3 text-gray-500">RWF {Number(r.basePrice).toLocaleString()}</td>
                      <td className="px-4 py-3"><Badge variant={r.isActive ? 'success' : 'danger'}>{r.isActive ? 'Active' : 'Inactive'}</Badge></td>
                      <td className="px-4 py-3">
                        {r.isActive && <Button size="sm" variant="danger" onClick={() => deactivate.mutate(r.id)}>Deactivate</Button>}
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
