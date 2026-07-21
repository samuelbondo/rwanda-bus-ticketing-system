import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import api from '@/services/api'
import { Button, Input, Card, CardBody, Badge } from '@/components/ui'
import { CheckCircle, XCircle, UserCheck } from 'lucide-react'
import type { Booking } from '@/types'

export default function VerifyTicketPage() {
  const [searchParams] = useSearchParams()
  const [ticketNumber, setTicketNumber] = useState(searchParams.get('ticket') ?? '')
  const [loading, setLoading] = useState(false)
  const [checkingIn, setCheckingIn] = useState(false)
  const [result, setResult] = useState<{ valid: boolean; message: string; data?: Booking } | null>(null)
  const [checkedIn, setCheckedIn] = useState(false)

  async function handleVerify(ticket = ticketNumber) {
    if (!ticket.trim()) return
    setLoading(true)
    setResult(null)
    setCheckedIn(false)
    try {
      const { data } = await api.post('/verify', { ticketNumber: ticket.trim(), checkIn: false })
      setResult(data)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Verification failed'
      setResult({ valid: false, message: msg })
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleCheckIn() {
    if (!result?.data?.ticketNumber) return
    setCheckingIn(true)
    try {
      await api.post('/verify', { ticketNumber: result.data.ticketNumber, checkIn: true })
      setCheckedIn(true)
      toast.success('Passenger checked in successfully')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Check-in failed'
      toast.error(msg)
    } finally {
      setCheckingIn(false)
    }
  }

  useEffect(() => {
    const ticket = searchParams.get('ticket')
    if (ticket) handleVerify(ticket)
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Verify Ticket</h1>
      <Card className="max-w-md">
        <CardBody className="space-y-4">
          <Input
            label="Ticket Number"
            placeholder="RBT-XXXXXX-XXXXXX"
            value={ticketNumber}
            onChange={(e) => { setTicketNumber(e.target.value); setResult(null); setCheckedIn(false) }}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
          />
          <Button onClick={() => handleVerify()} loading={loading} className="w-full">Look Up Ticket</Button>
        </CardBody>
      </Card>

      {result && (
        <Card className="max-w-md">
          <CardBody className="space-y-3">
            <div className="flex items-center gap-3">
              {result.valid
                ? <CheckCircle className="h-6 w-6 text-green-500" />
                : <XCircle className="h-6 w-6 text-red-500" />}
              <p className="font-semibold text-gray-900 dark:text-white">{result.message}</p>
            </div>
            {result.data && (
              <div className="space-y-2 text-sm">
                {[
                  ['Passenger', result.data.user?.name],
                  ['Route', `${result.data.source} → ${result.data.destination}`],
                  ['Seat', result.data.seat?.seatNumber],
                  ['Departure', new Date(result.data.schedule?.departureTime).toLocaleString()],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between pt-2">
                  {checkedIn ? (
                    <Badge variant="success">CHECKED IN</Badge>
                  ) : (
                    <Badge variant="info">CONFIRMED</Badge>
                  )}
                  {!checkedIn && (
                    <Button size="sm" onClick={handleCheckIn} loading={checkingIn}>
                      <UserCheck className="mr-1.5 h-4 w-4" /> Check In Passenger
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  )
}
