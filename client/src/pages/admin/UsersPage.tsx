import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { userService } from '@/services/adminService'
import { Badge, Button, Card, CardBody, Skeleton } from '@/components/ui'
import type { User } from '@/types'

const roleVariant: Record<string, 'info' | 'success' | 'warning' | 'default'> = {
  ADMIN: 'info', AGENT: 'warning', CUSTOMER: 'success', GUEST: 'default',
}

export default function UsersPage() {
  const qc = useQueryClient()
  const { data: users = [], isLoading } = useQuery({ queryKey: ['users'], queryFn: userService.getAll })

  const deactivate = useMutation({
    mutationFn: (id: string) => userService.remove(id),
    onSuccess: () => { toast.success('User deactivated'); qc.invalidateQueries({ queryKey: ['users'] }) },
    onError: () => toast.error('Failed to deactivate user'),
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
      <Card>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 dark:border-gray-700">
                  <tr className="text-left text-gray-500">
                    {['Name', 'Email', 'Role', 'Status', 'Joined', ''].map((h) => (
                      <th key={h} className="px-4 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {(users as User[]).map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{u.name}</td>
                      <td className="px-4 py-3 text-gray-500">{u.email}</td>
                      <td className="px-4 py-3"><Badge variant={roleVariant[u.role] ?? 'default'}>{u.role}</Badge></td>
                      <td className="px-4 py-3"><Badge variant={u.isActive ? 'success' : 'danger'}>{u.isActive ? 'Active' : 'Inactive'}</Badge></td>
                      <td className="px-4 py-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        {u.isActive && (
                          <Button size="sm" variant="danger" onClick={() => deactivate.mutate(u.id)}>Deactivate</Button>
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
