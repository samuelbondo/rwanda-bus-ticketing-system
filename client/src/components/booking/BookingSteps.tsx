interface BookingStepsProps {
  current: 'seat' | 'payment'
}

export default function BookingSteps({ current }: BookingStepsProps) {
  const steps = [
    { key: 'seat', label: 'Select Seat', n: '1' },
    { key: 'payment', label: 'Payment', n: '2' },
  ] as const

  return (
    <div className="flex items-center gap-3 text-sm">
      {steps.map((step, i) => {
        const done = current === 'payment' && step.key === 'seat'
        const active = current === step.key
        return (
          <div key={step.key} className="flex items-center gap-3">
            {i > 0 && <div className="h-px w-8 bg-gray-300" />}
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                done ? 'bg-green-500 text-white' : active ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'
              }`}
            >
              {step.n}
            </span>
            <span className={active ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-400'}>
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
