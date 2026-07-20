import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Edit2, X, Bus as BusIcon } from 'lucide-react'
import { busService } from '@/services/adminService'
import { Button, Input, Card, CardBody, CardHeader, Badge, Skeleton } from '@/components/ui'
import type { Bus } from '@/types'

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  plateNumber: z.string().min(3, 'Plate required'),
  capacity: z.coerce.number().int().min(1, 'Capacity required'),
})
type FormData = z.infer<typeof schema>

function BusForm({
  defaultValues,
  onSubmit,
  onCancel,
  loading,
  title,
}: {
  defaultValues?: Partial<FormData>
  onSubmit: (d: FormData) => void
  onCancel: () => void
  loading: boolean
  title: string
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
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-3">
          <Input label="Bus Name" placeholder="Volcano Express 1" error={errors.name?.message} {...register('name')} />
          <Input label="Plate Number" placeholder="RAB 001 A" error={errors.plateNumber?.message} {...register('plateNumber')} />
          <Input label="Capacity (seats)" type="number" placeholder="30" error={errors.capacity?.message} {...register('capacity')} />
          <div className="sm:col-span-3 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
            <Button type="submit" loading={loading}>Save Bus</Button>
          </div>
        </form>
      </CardBody>
    </Card>
  )
}

export default function BusesPage() {
  const qc = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [editBus, setEditBus] = useState<Bus | null>(null)

  const { data: buses = [], isLoading } = useQuery({ queryKey: ['buses'], queryFn: busService.getAll })

  const createMutation = useMutation({
    mutationFn: busService.create,
    onSuccess: () => { toast.success('Bus created'); qc.invalidateQueries({ queryKey: ['buses'] }); setShowCreate(false) },
    onError: () => toast.error('Failed to create bus'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Bus> }) => busService.update(id, data),
    onSuccess: () => { toast.success('Bus updated'); qc.invalidateQueries({ queryKey: ['buses'] }); setEditBus(null) },
    onError: () => toast.error('Failed to update bus'),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      active ? busService.remove(id) : busService.update(id, { isActive: true }),
    onSuccess: () => { toast.success('Bus updated'); qc.invalidateQueries({ queryKey: ['buses'] }) },
    onError: () => toast.error('Failed to update bus'),
  })

  const activeBuses = (buses as Bus[]).filter((b) => b.isActive).length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Buses</h1>
          <p className="text-sm text-gray-500 mt-0.5">{activeBuses} active · {(buses as Bus[]).length} total</p>
        </div>
        <Button size="sm" onClick={() => { setShowCreate(true); setEditBus(null) }}>
          <Plus className="mr-1.5 h-4 w-4" />Add Bus
        </Button>
      </div>

      {showCreate && (
        <BusForm
          title="Add New Bus"
          loading={createMutation.isPending}
          onSubmit={(d) => createMutation.mutate(d)}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {editBus && (
        <BusForm
          title={`Edit — ${editBus.name}`}
          defaultValues={{ name: editBus.name, plateNumber: editBus.plateNumber, capacity: editBus.capacity }}
          loading={updateMutation.isPending}
          onSubmit={(d) => updateMutation.mutate({ id: editBus.id, data: d })}
          onCancel={() => setEditBus(null)}
        />
      )}

      <Card>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">{[1, 2].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : (buses as Bus[]).length === 0 ? (
            <div className="py-16 text-center">
              <BusIcon className="mx-auto mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-400">No buses yet. Add your first bus.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {['Bus', 'Plate Number', 'Capacity', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {(buses as Bus[]).map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                            <BusIcon className="h-4 w-4 text-blue-600" />
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">{b.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-300">{b.plateNumber}</td>
                      <td className="px-4 py-3 text-gray-500">{b.capacity} seats</td>
                      <td className="px-4 py-3">
                        <Badge variant={b.isActive ? 'success' : 'danger'}>{b.isActive ? 'Active' : 'Inactive'}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="secondary" onClick={() => { setEditBus(b); setShowCreate(false) }}>
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant={b.isActive ? 'danger' : 'secondary'}
                            onClick={() => toggleMutation.mutate({ id: b.id, active: b.isActive })}
                          >
                            {b.isActive ? 'Deactivate' : 'Activate'}
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
