import { useState } from 'react'
import { toast } from 'sonner'
import api from '@/services/api'
import { Button, Input, Card, CardBody, Badge } from '@/components/ui'
import { CheckCircle, XCircle } from 'lucide-react'
import type { Booking } from '@/types'

export default function VerifyTicketPage() {
  const [ticketNumber, setTicketNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ valid: boolean; message: string; data?: Booking } | null>(null)

  async function handleVerify() {
    if (!ticketNumber.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const { data } = await api.post('/verify', { ticketNumber: ticketNumber.trim() })
      setResult(data)
      toast.success('Ticket verified')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Verification failed'
      setResult({ valid: false, message: msg })
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Verify Ticket</h1>
      <Card className="max-w-md">
        <CardBody className="space-y-4">
          <Input
            label="Ticket Number"
            placeholder="RBT-XXXXXX-XXXXXX"
            value={ticketNumber}
            onChange={(e) => setTicketNumber(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
          />
          <Button onClick={handleVerify} loading={loading} className="w-full">Verify</Button>
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
                <div className="flex justify-end pt-1">
                  <Badge variant="success">VERIFIED</Badge>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  )
}
