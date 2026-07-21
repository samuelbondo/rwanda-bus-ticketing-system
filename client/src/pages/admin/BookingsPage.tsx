import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Search, Eye, CheckCircle, XCircle, FileImage } from 'lucide-react'
import { bookingService } from '@/services/bookingService'
import api from '@/services/api'
import { Badge, Button, Card, CardBody, CardHeader, Skeleton } from '@/components/ui'
import type { Booking } from '@/types'

const statusVariant = (s: string): 'success' | 'danger' | 'warning' | 'default' => {
  if (s === 'CONFIRMED') return 'success'
  if (s === 'CANCELLED') return 'danger'
  if (s === 'PENDING' || s === 'AWAITING_APPROVAL') return 'warning'
  return 'default'
}

interface PaymentInfo {
  proofUrl?: string | null
  method?: string
  reference?: string | null
}

interface BookingWithPayment extends Booking {
  payment?: PaymentInfo
}

interface ProofModal {
  proofUrl?: string | null
  method?: string
  reference?: string | null
  ticketNumber: string
  passenger: string
  amount: number
}

export default function BookingsPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [proofModal, setProofModal] = useState<ProofModal | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['bookings', 'admin'],
    queryFn: async () => {
      const res = await api.get('/bookings')
      return res.data
    },
    refetchInterval: 30_000,
  })
  const bookings: BookingWithPayment[] = (data as { data: BookingWithPayment[] })?.data ?? []

  const approveMutation = useMutation({
    mutationFn: (id: string) => bookingService.approvePayment(id),
    onSuccess: () => {
      toast.success('Payment approved — ticket sent to customer')
      qc.invalidateQueries({ queryKey: ['bookings'] })
      setProofModal(null)
    },
    onError: (err: unknown) => toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed'),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => bookingService.rejectPayment(id, reason),
    onSuccess: () => {
      toast.success('Payment rejected — customer notified')
      qc.invalidateQueries({ queryKey: ['bookings'] })
      setRejectId(null)
      setRejectReason('')
      setProofModal(null)
    },
    onError: (err: unknown) => toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed'),
  })

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

  const pendingApproval = bookings.filter((b) => b.status === 'AWAITING_APPROVAL').length

  // Find booking id from rejectId for inline reject from modal
  const rejectBooking = rejectId ? bookings.find((b) => b.id === rejectId) : null

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
                    {['Ticket', 'Passenger', 'Route', 'Departure', 'Seat', 'Price', 'Payment', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filtered.map((b) => (
                    <tr key={b.id} className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30 ${b.status === 'AWAITING_APPROVAL' ? 'bg-orange-50/60 dark:bg-orange-900/10' : ''}`}>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-300">{b.ticketNumber}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white">{b.user?.name}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{b.source} → {b.destination}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{new Date(b.schedule.departureTime).toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-500">{b.seat.seatNumber}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">RWF {Number(b.totalPrice).toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {b.payment?.method ?? '—'}
                        {b.payment?.reference && <span className="block text-gray-400">{b.payment.reference}</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariant(b.status)}>
                          {b.status === 'AWAITING_APPROVAL' ? 'AWAITING' : b.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {b.status === 'AWAITING_APPROVAL' && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setProofModal({
                                proofUrl: b.payment?.proofUrl,
                                method: b.payment?.method,
                                reference: b.payment?.reference,
                                ticketNumber: b.ticketNumber,
                                passenger: b.user?.name ?? '',
                                amount: Number(b.totalPrice),
                              })}
                            >
                              <Eye className="mr-1 h-3.5 w-3.5" /> Review
                            </Button>
                          )}
                          {b.status === 'AWAITING_APPROVAL' && (
                            <Button size="sm" onClick={() => approveMutation.mutate(b.id)} loading={approveMutation.isPending}>
                              <CheckCircle className="mr-1 h-3.5 w-3.5" /> Approve
                            </Button>
                          )}
                          {b.status === 'AWAITING_APPROVAL' && (
                            <Button size="sm" variant="danger" onClick={() => setRejectId(b.id)}>
                              <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
                            </Button>
                          )}
                          {b.status !== 'CANCELLED' && b.status !== 'USED' && b.status !== 'AWAITING_APPROVAL' && (
                            <Button size="sm" variant="danger" onClick={() => cancelMutation.mutate(b.id)} loading={cancelMutation.isPending}>
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

      {/* Proof review modal */}
      {proofModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setProofModal(null)}>
          <div className="w-full max-w-lg rounded-xl bg-white dark:bg-gray-800 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-5 py-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Payment Proof Review</h3>
                <p className="text-xs text-gray-500 mt-0.5">{proofModal.passenger} · {proofModal.ticketNumber}</p>
              </div>
              <button onClick={() => setProofModal(null)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Payment details */}
            <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700/30 flex flex-wrap gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400">Amount</p>
                <p className="font-semibold text-gray-900 dark:text-white">RWF {proofModal.amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Method</p>
                <p className="font-semibold text-gray-900 dark:text-white">{proofModal.method ?? '—'}</p>
              </div>
              {proofModal.reference && (
                <div>
                  <p className="text-xs text-gray-400">Reference</p>
                  <p className="font-semibold text-gray-900 dark:text-white font-mono">{proofModal.reference}</p>
                </div>
              )}
            </div>

            {/* Proof image */}
            <div className="px-5 py-4">
              {proofModal.proofUrl ? (
                <img
                  src={proofModal.proofUrl}
                  alt="Proof of payment"
                  className="w-full max-h-72 rounded-lg object-contain border border-gray-200 dark:border-gray-700 bg-gray-50"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 py-10 text-gray-400">
                  <FileImage className="h-8 w-8" />
                  <p className="text-sm">No proof image uploaded</p>
                  <p className="text-xs">Customer provided reference number only</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 border-t border-gray-200 dark:border-gray-700 px-5 py-4">
              <Button variant="secondary" onClick={() => setProofModal(null)}>Close</Button>
              <Button
                variant="danger"
                onClick={() => {
                  const booking = bookings.find((b) => b.ticketNumber === proofModal.ticketNumber)
                  if (booking) setRejectId(booking.id)
                }}
              >
                <XCircle className="mr-1.5 h-4 w-4" /> Reject
              </Button>
              <Button
                onClick={() => {
                  const booking = bookings.find((b) => b.ticketNumber === proofModal.ticketNumber)
                  if (booking) approveMutation.mutate(booking.id)
                }}
                loading={approveMutation.isPending}
              >
                <CheckCircle className="mr-1.5 h-4 w-4" /> Approve
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reject reason modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Reject Payment</h3>
            {rejectBooking && (
              <p className="text-xs text-gray-500">{rejectBooking.user?.name} · {rejectBooking.ticketNumber}</p>
            )}
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
