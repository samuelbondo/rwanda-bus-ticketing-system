import { useNavigate } from 'react-router-dom'
import { Bus, Ticket, QrCode, Clock } from 'lucide-react'
import { Button } from '@/components/ui'

const features = [
  { icon: Bus, title: 'Search Schedules', desc: 'Find available buses by route and date.' },
  { icon: Ticket, title: 'Book Online', desc: 'Reserve your seat without visiting an office.' },
  { icon: QrCode, title: 'Digital Ticket', desc: 'Download your PDF ticket with QR code.' },
  { icon: Clock, title: 'Easy Cancellation', desc: 'Cancel up to 3 hours before departure.' },
]

export default function HomePage() {
  const navigate = useNavigate()
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-900 py-24 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">Book Your Bus Ticket Online</h1>
          <p className="mt-4 text-lg text-primary-100">
            Travel from Nyanza to Kigali — no office visit required.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" variant="secondary" onClick={() => navigate('/search')}>
              Search Schedules
            </Button>
            <Button size="lg" variant="ghost" className="text-white border-white hover:bg-white/10" onClick={() => navigate('/register')}>
              Create Account
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-2xl font-bold text-gray-900 dark:text-white">
            Everything you need to travel
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-900/30">
                  <Icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
