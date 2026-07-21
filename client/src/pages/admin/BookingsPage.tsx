import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Search, Eye, CheckCircle, XCircle } from 'lucide-react'
import { bookingService } from '@/services/bookingService'
import api from '@/services/api'
import { Badge, Button, Card, CardBody, CardHeader, Skeleton } from '@/components/ui'
import type { Booking } from '@/types'

const statusVariant = (s: string): 'success' | 'danger' | 'warning' | 'default' => {
  if (s === 'CONFIRMED') return 'success'
  if (s === 'CANCELLED') return 'danger'
  if (s === 'PENDING') return 'warning'
  if (s === 'AWAITING_APPROVAL') return 'warning'
  return 'default'
}

interface BookingWithPayment extends Booking {
  payment?: { proofUrl?: string; method?: string; reference?: string }
}

export default function BookingsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [proofModal, setProofModal] = useState<string | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['bookings', 'admin'],
    queryFn: async () => {
      const res = await api.get('/bookings', { params: { include: 'payment' } })
      return res.data
    },
  })
  const bookings: BookingWithPayment[] = (data as { data: BookingWithPayment[] })?.data ?? []

  const cancelMutation = useMutation({
    mutationFn: (id: string) => bookingService.cancel(id),
    onSuccess: () => { toast.success('Booking cancelled'); qc.invalidateQueries({ queryKey: ['bookings'] }) },
    onError: () => toast.error('Failed to cancel booking'),
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => bookingService.approvePayment(id),
    onSuccess: () => { toast.success('Payment approved — ticket sent to customer'); qc.invalidateQueries({ queryKey: ['bookings'] }) },
    onError: (err: unknown) => toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed'),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => bookingService.rejectPayment(id, reason),
    onSuccess: () => {
      toast.success('Payment rejected — customer notified')
      qc.invalidateQueries({ queryKey: ['bookings'] })
      setRejectId(null)
      setRejectReason('')
    },
    onError: (err: unknown) => toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed'),
  })

  const filtered = bookings.filter((b) => {
    const matchSearch =
      b.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
      (b.user?.name ?? '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'ALL' || b.status === statusFilter
    return matchSearch && matchStatus
  })

  const pendingApproval = bookings.filter((b) => b.status === 'AWAITING_APPROVAL').length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">All Bookings</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {bookings.length} total
            {pendingApproval > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                {pendingApproval} awaiting approval
              </span>
            )}
          </p>
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
              {['PENDING', 'AWAITING_APPROVAL', 'CONFIRMED', 'CANCELLED', 'USED'].map((s) => (
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
                    <tr key={b.id} className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30 ${b.status === 'AWAITING_APPROVAL' ? 'bg-orange-50/50 dark:bg-orange-900/10' : ''}`}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-300">{b.ticketNumber}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white">{b.user?.name}</td>
                      <td className="px-4 py-3 text-gray-500">{b.source} → {b.destination}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(b.schedule.departureTime).toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-500">{b.seat.seatNumber}</td>
                      <td className="px-4 py-3 text-gray-500">RWF {Number(b.totalPrice).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariant(b.status)}>
                          {b.status === 'AWAITING_APPROVAL' ? 'AWAITING' : b.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {/* Proof image viewer */}
                          {b.status === 'AWAITING_APPROVAL' && b.payment?.proofUrl && (
                            <Button size="sm" variant="secondary" onClick={() => setProofModal(b.payment!.proofUrl!)}>
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {/* Approve */}
                          {b.status === 'AWAITING_APPROVAL' && (
                            <Button
                              size="sm"
                              onClick={() => approveMutation.mutate(b.id)}
                              loading={approveMutation.isPending}
                            >
                              <CheckCircle className="mr-1 h-3.5 w-3.5" /> Approve
                            </Button>
                          )}
                          {/* Reject */}
                          {b.status === 'AWAITING_APPROVAL' && (
                            <Button size="sm" variant="danger" onClick={() => setRejectId(b.id)}>
                              <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
                            </Button>
                          )}
                          {/* Cancel */}
                          {b.status !== 'CANCELLED' && b.status !== 'USED' && b.status !== 'AWAITING_APPROVAL' && (
                            <Button size="sm" variant="danger" onClick={() => cancelMutation.mutate(b.id)}>
                              Cancel
                            </Button>
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

      {/* Proof image modal */}
      {proofModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setProofModal(null)}>
          <div className="relative max-h-[90vh] max-w-lg" onClick={(e) => e.stopPropagation()}>
            <img src={proofModal} alt="Proof of payment" className="rounded-xl object-contain max-h-[80vh]" />
            <button onClick={() => setProofModal(null)} className="absolute -right-3 -top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-lg text-gray-700 hover:bg-gray-100">
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Reject reason modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Reject Payment</h3>
            <p className="text-sm text-gray-500">Optionally provide a reason. The customer will be notified by email.</p>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              rows={3}
              placeholder="e.g. Screenshot unclear, wrong amount sent..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => { setRejectId(null); setRejectReason('') }}>Cancel</Button>
              <Button
                variant="danger"
                loading={rejectMutation.isPending}
                onClick={() => rejectMutation.mutate({ id: rejectId, reason: rejectReason })}
              >
                Reject Payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
