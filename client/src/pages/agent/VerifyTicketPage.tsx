import { useState, useEffect, lazy, Suspense } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import api from '@/services/api'
import { Button, Input, Card, CardBody, Badge } from '@/components/ui'
import { CheckCircle, XCircle, UserCheck, Camera, Keyboard } from 'lucide-react'
import type { Booking } from '@/types'

const QrScanner = lazy(() => import('@/components/QrScanner'))

type VerifyResult = { valid: boolean; message: string; data?: Booking }

export default function VerifyTicketPage() {
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState<'manual' | 'camera'>('manual')
  const [ticketNumber, setTicketNumber] = useState(searchParams.get('ticket') ?? '')
  const [loading, setLoading] = useState(false)
  const [checkingIn, setCheckingIn] = useState(false)
  const [result, setResult] = useState<VerifyResult | null>(null)
  const [checkedIn, setCheckedIn] = useState(false)
  const [scannerActive, setScannerActive] = useState(false)

  async function handleVerify(ticket = ticketNumber) {
    const t = ticket.trim()
    if (!t) return
    setLoading(true)
    setResult(null)
    setCheckedIn(false)
    setScannerActive(false)
    try {
      const { data } = await api.post('/verify', { ticketNumber: t, checkIn: false })
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
      // Auto-clear after 3 seconds so agent is ready for next passenger
      setTimeout(() => {
        setResult(null)
        setCheckedIn(false)
        setTicketNumber('')
        if (mode === 'camera') setScannerActive(true)
      }, 3000)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Check-in failed'
      toast.error(msg)
    } finally {
      setCheckingIn(false)
    }
  }

  function handleScan(text: string) {
    if (loading || result) return
    setTicketNumber(text)
    handleVerify(text)
  }

  function handleReset() {
    setResult(null)
    setCheckedIn(false)
    setTicketNumber('')
    if (mode === 'camera') setScannerActive(true)
  }

  useEffect(() => {
    const ticket = searchParams.get('ticket')
    if (ticket) handleVerify(ticket)
  }, [])

  useEffect(() => {
    if (mode === 'camera') setScannerActive(true)
    else setScannerActive(false)
  }, [mode])

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Verify Ticket</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Scan a QR code or enter a ticket number to verify and check in a passenger.</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('manual')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
            mode === 'manual'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          <Keyboard className="h-4 w-4" /> Manual Entry
        </button>
        <button
          onClick={() => setMode('camera')}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
            mode === 'camera'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
          }`}
        >
          <Camera className="h-4 w-4" /> Scan QR Code
        </button>
      </div>

      {/* Manual entry */}
      {mode === 'manual' && (
        <Card>
          <CardBody className="space-y-4">
            <Input
              label="Ticket Number"
              placeholder="RBT-XXXXXX-XXXXXX"
              value={ticketNumber}
              onChange={(e) => { setTicketNumber(e.target.value); setResult(null); setCheckedIn(false) }}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            />
            <Button onClick={() => handleVerify()} loading={loading} className="w-full">
              Look Up Ticket
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Camera scanner */}
      {mode === 'camera' && (
        <Card>
          <CardBody className="space-y-3">
            {scannerActive && !result && (
              <Suspense fallback={<div className="h-64 flex items-center justify-center text-sm text-gray-400">Loading camera…</div>}>
                <QrScanner onScan={handleScan} />
              </Suspense>
            )}
            {!scannerActive && !result && (
              <div className="flex flex-col items-center gap-3 py-8">
                <Camera className="h-10 w-10 text-gray-300" />
                <p className="text-sm text-gray-500">Camera paused</p>
                <Button size="sm" onClick={() => setScannerActive(true)}>Resume Camera</Button>
              </div>
            )}
            {loading && (
              <p className="text-center text-sm text-gray-500 animate-pulse">Verifying ticket…</p>
            )}
          </CardBody>
        </Card>
      )}

      {/* Result card */}
      {result && (
        <Card className={result.valid ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'}>
          <CardBody className="space-y-4">
            <div className="flex items-center gap-3">
              {result.valid
                ? <CheckCircle className="h-6 w-6 shrink-0 text-green-500" />
                : <XCircle className="h-6 w-6 shrink-0 text-red-500" />}
              <p className="font-semibold text-gray-900 dark:text-white">{result.message}</p>
            </div>

            {result.data && (
              <div className="space-y-2 text-sm">
                {/* Passenger avatar */}
                <div className="flex items-center gap-3 pb-2">
                  {result.data.user?.avatarUrl ? (
                    <img src={result.data.user.avatarUrl} alt={result.data.user.name} className="h-12 w-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700" />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-600 text-lg font-bold text-white">
                      {result.data.user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{result.data.user?.name}</p>
                    <p className="text-xs text-gray-500">{result.data.user?.email}</p>
                  </div>
                </div>
                {([
                  ['Route', `${result.data.source} → ${result.data.destination}`],
                  ['Seat', result.data.seat?.seatNumber],
                  ['Departure', new Date(result.data.schedule?.departureTime).toLocaleString('en-RW')],
                  ['Ticket No.', result.data.ticketNumber],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label} className="flex justify-between border-b border-gray-100 pb-1.5 dark:border-gray-700">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{value}</span>
                  </div>
                ))}

                <div className="flex items-center justify-between pt-2">
                  {checkedIn
                    ? <Badge variant="success">✓ CHECKED IN — Ready for next passenger</Badge>
                    : <Badge variant="info">CONFIRMED</Badge>
                  }
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={handleReset}>Clear</Button>
                    {!checkedIn && (
                      <Button size="sm" onClick={handleCheckIn} loading={checkingIn}>
                        <UserCheck className="mr-1.5 h-4 w-4" /> Check In
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!result.valid && (
              <Button size="sm" variant="secondary" onClick={handleReset} className="w-full">Try Again</Button>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  )
}
