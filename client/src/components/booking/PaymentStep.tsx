import { useState } from 'react'
import { CreditCard, Smartphone, Upload, X, ImageIcon } from 'lucide-react'
import { Card, CardBody, Button } from '@/components/ui'
import api from '@/services/api'

type PaymentMethod = 'MOMO' | 'CARD' | 'CASH'

const METHODS: { value: PaymentMethod; label: string; icon: React.ElementType; hint: string }[] = [
  { value: 'MOMO', label: 'Mobile Money', icon: Smartphone, hint: 'Send to: +250 794 047 261' },
  { value: 'CARD', label: 'Bank Card', icon: CreditCard, hint: 'Transfer to account: 1234-5678-9012' },
  { value: 'CASH', label: 'Cash (at office)', icon: CreditCard, hint: 'Pay at our Nyanza or Kigali office' },
]

interface PaymentStepProps {
  price: number
  method: PaymentMethod
  reference: string
  proofUrl: string
  loading: boolean
  onMethodChange: (m: PaymentMethod) => void
  onReferenceChange: (v: string) => void
  onProofUrlChange: (v: string) => void
  onConfirm: () => void
}

export default function PaymentStep({
  price, method, reference, proofUrl, loading,
  onMethodChange, onReferenceChange, onProofUrlChange, onConfirm,
}: PaymentStepProps) {
  const [uploading, setUploading] = useState(false)
  const selectedMethod = METHODS.find((m) => m.value === method)!
  const requiresProof = method !== 'CASH'
  const canSubmit = !requiresProof || !!proofUrl

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const { data } = await api.post('/upload?folder=payment-proofs', form)
      onProofUrlChange(data.url)
    } catch {
      // silent — user can retry
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardBody className="space-y-5">
        <div>
          <p className="font-semibold text-gray-900 dark:text-white mb-1">Choose Payment Method</p>
          <p className="text-xs text-gray-500">Your seat is reserved. Make payment then upload your proof to confirm.</p>
        </div>

        {/* Method selector */}
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

        {/* Payment instructions */}
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 px-4 py-3 text-sm text-blue-700 dark:text-blue-300">
          <p className="font-semibold mb-0.5">Payment Instructions</p>
          <p>{selectedMethod.hint}</p>
          <p className="mt-1 font-bold">Amount: RWF {Number(price).toLocaleString()}</p>
        </div>

        {/* Reference */}
        {method !== 'CASH' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {method === 'MOMO' ? 'MoMo Transaction ID' : 'Transaction Reference'}
            </label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              placeholder={method === 'MOMO' ? 'e.g. MP250XXXXXXX' : 'e.g. TXN-123456'}
              value={reference}
              onChange={(e) => onReferenceChange(e.target.value)}
            />
          </div>
        )}

        {/* Proof upload */}
        {requiresProof && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Proof of Payment <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-2">Upload a screenshot of your payment confirmation.</p>

            {proofUrl ? (
              <div className="relative inline-block">
                <img src={proofUrl} alt="Proof" className="h-32 w-auto rounded-lg border border-gray-200 object-cover" />
                <button
                  onClick={() => onProofUrlChange('')}
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <label className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-6 transition ${
                uploading ? 'border-primary-300 bg-primary-50' : 'border-gray-300 hover:border-primary-400 dark:border-gray-600'
              }`}>
                {uploading
                  ? <><Upload className="h-6 w-6 animate-bounce text-primary-500" /><span className="text-sm text-primary-600">Uploading…</span></>
                  : <><ImageIcon className="h-6 w-6 text-gray-400" /><span className="text-sm text-gray-500">Click to upload screenshot</span><span className="text-xs text-gray-400">PNG, JPG up to 5MB</span></>
                }
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
              </label>
            )}
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
          <div>
            <p className="text-xs text-gray-500">Amount due</p>
            <p className="text-lg font-bold text-primary-600">RWF {Number(price).toLocaleString()}</p>
          </div>
          <Button onClick={onConfirm} loading={loading} disabled={!canSubmit}>
            Submit for Approval
          </Button>
        </div>

        {requiresProof && !proofUrl && (
          <p className="text-center text-xs text-orange-500">Please upload your proof of payment to continue.</p>
        )}
      </CardBody>
    </Card>
  )
}
