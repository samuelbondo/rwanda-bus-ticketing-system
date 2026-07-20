import { CreditCard, Smartphone } from 'lucide-react'
import { Card, CardBody, Button } from '@/components/ui'

type PaymentMethod = 'MOMO' | 'CARD' | 'CASH'

const METHODS: { value: PaymentMethod; label: string; icon: React.ElementType }[] = [
  { value: 'MOMO', label: 'Mobile Money (MoMo)', icon: Smartphone },
  { value: 'CARD', label: 'Bank Card', icon: CreditCard },
]

interface PaymentStepProps {
  price: number
  pendingBookingId: string
  method: PaymentMethod
  reference: string
  loading: boolean
  onMethodChange: (m: PaymentMethod) => void
  onReferenceChange: (v: string) => void
  onConfirm: () => void
}

export default function PaymentStep({
  price, pendingBookingId, method, reference, loading,
  onMethodChange, onReferenceChange, onConfirm,
}: PaymentStepProps) {
  return (
    <Card>
      <CardBody className="space-y-5">
        <div>
          <p className="font-semibold text-gray-900 dark:text-white mb-1">Choose Payment Method</p>
          <p className="text-xs text-gray-500">Your seat is reserved. Complete payment to confirm your ticket.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {METHODS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => onMethodChange(value)}
              className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-all ${
                method === value
                  ? 'border-primary-600 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 dark:border-gray-700 dark:text-gray-400'
              }`}
            >
              <Icon className="h-6 w-6" />
              {label}
            </button>
          ))}
        </div>

        {method !== 'CASH' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {method === 'MOMO' ? 'MoMo Phone Number' : 'Card Reference'}
            </label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder={method === 'MOMO' ? '07X XXX XXXX' : 'e.g. TXN-123456'}
              value={reference}
              onChange={(e) => onReferenceChange(e.target.value)}
            />
          </div>
        )}

        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
          <div>
            <p className="text-xs text-gray-500">Amount due</p>
            <p className="text-lg font-bold text-primary-600">RWF {Number(price).toLocaleString()}</p>
          </div>
          <Button onClick={onConfirm} loading={loading}>Confirm Payment</Button>
        </div>
      </CardBody>
    </Card>
  )
}
