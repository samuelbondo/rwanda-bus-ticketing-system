import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { auditService } from '@/services/adminService'
import { Card, CardBody, Button, Skeleton } from '@/components/ui'
import type { AuditLog } from '@/types'

export default function AuditLogsPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page],
    queryFn: () => auditService.getAll(page, 20),
  })

  const logs: AuditLog[] = data?.data ?? []
  const totalPages = data?.totalPages ?? 1

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
      <Card>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {['Time', 'User', 'Action', 'Entity', 'Entity ID', 'IP'].map((h) => (
                      <th key={h} className="px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {logs.map((l) => (
                    <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(l.createdAt).toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white">{l.user?.name ?? '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-primary-600">{l.action}</td>
                      <td className="px-4 py-3 text-gray-500">{l.entity}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">{l.entityId ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-400">{l.ipAddress ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          <Button variant="secondary" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  )
}
