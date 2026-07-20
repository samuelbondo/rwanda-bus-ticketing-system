import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { busService } from '@/services/adminService'
import { Button, Input, Card, CardBody, CardHeader, Badge, Skeleton } from '@/components/ui'
import type { Bus } from '@/types'

const schema = z.object({
  name: z.string().min(2),
  plateNumber: z.string().min(3),
  capacity: z.coerce.number().int().min(1),
})
type FormData = z.infer<typeof schema>

export default function BusesPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const { data: buses = [], isLoading } = useQuery({ queryKey: ['buses'], queryFn: busService.getAll })

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const createMutation = useMutation({
    mutationFn: busService.create,
    onSuccess: () => { toast.success('Bus created'); qc.invalidateQueries({ queryKey: ['buses'] }); reset(); setShowForm(false) },
    onError: () => toast.error('Failed to create bus'),
  })

  const deactivate = useMutation({
    mutationFn: busService.remove,
    onSuccess: () => { toast.success('Bus deactivated'); qc.invalidateQueries({ queryKey: ['buses'] }) },
    onError: () => toast.error('Failed to deactivate bus'),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Buses</h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)}><Plus className="mr-1 h-4 w-4" />Add Bus</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><p className="font-semibold text-gray-900 dark:text-white">New Bus</p></CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="flex flex-col gap-4 sm:flex-row">
              <Input label="Name" placeholder="Volcano Express 1" error={errors.name?.message} {...register('name')} />
              <Input label="Plate Number" placeholder="RAB 001 A" error={errors.plateNumber?.message} {...register('plateNumber')} />
              <Input label="Capacity" type="number" placeholder="30" error={errors.capacity?.message} {...register('capacity')} />
              <div className="flex items-end">
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
                    {['Name', 'Plate', 'Capacity', 'Status', ''].map((h) => (
                      <th key={h} className="px-4 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {(buses as Bus[]).map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{b.name}</td>
                      <td className="px-4 py-3 text-gray-500">{b.plateNumber}</td>
                      <td className="px-4 py-3 text-gray-500">{b.capacity}</td>
                      <td className="px-4 py-3"><Badge variant={b.isActive ? 'success' : 'danger'}>{b.isActive ? 'Active' : 'Inactive'}</Badge></td>
                      <td className="px-4 py-3">
                        {b.isActive && <Button size="sm" variant="danger" onClick={() => deactivate.mutate(b.id)}>Deactivate</Button>}
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
