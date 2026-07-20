import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Search } from 'lucide-react'
import { bookingService } from '@/services/bookingService'
import { Badge, Button, Card, CardBody, CardHeader, Skeleton } from '@/components/ui'
import type { Booking } from '@/types'

const statusVariant = (s: string): 'success' | 'danger' | 'warning' | 'default' => {
  if (s === 'CONFIRMED') return 'success'
  if (s === 'CANCELLED') return 'danger'
  if (s === 'PENDING') return 'warning'
  return 'default'
}

export default function BookingsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const { data, isLoading } = useQuery({
    queryKey: ['bookings', 'admin'],
    queryFn: () => bookingService.getAll(),
  })
  const bookings: Booking[] = (data as { data: Booking[] })?.data ?? []

  const cancelMutation = useMutation({
    mutationFn: (id: string) => bookingService.cancel(id),
    onSuccess: () => { toast.success('Booking cancelled'); qc.invalidateQueries({ queryKey: ['bookings'] }) },
    onError: () => toast.error('Failed to cancel booking'),
  })

  const filtered = bookings.filter((b) => {
    const matchSearch =
      b.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      (b.user?.name ?? '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || b.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">All Bookings</h1>
          <p className="text-sm text-gray-500 mt-0.5">{bookings.length} total</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="Search by ticket or passenger..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              {['PENDING', 'CONFIRMED', 'CANCELLED', 'USED'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-400">No bookings found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {['Ticket', 'Passenger', 'Route', 'Departure', 'Seat', 'Price', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filtered.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-300">{b.ticketNumber}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white">{b.user?.name}</td>
                      <td className="px-4 py-3 text-gray-500">{b.source} → {b.destination}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(b.schedule.departureTime).toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-500">{b.seat.seatNumber}</td>
                      <td className="px-4 py-3 text-gray-500">RWF {Number(b.totalPrice).toLocaleString()}</td>
                      <td className="px-4 py-3"><Badge variant={statusVariant(b.status)}>{b.status}</Badge></td>
                      <td className="px-4 py-3">
                        {b.status !== 'CANCELLED' && b.status !== 'USED' && (
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => cancelMutation.mutate(b.id)}
                          >
                            Cancel
                          </Button>
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
