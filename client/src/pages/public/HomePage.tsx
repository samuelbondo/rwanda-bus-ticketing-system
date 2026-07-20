import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Ticket, QrCode, Clock, MapPin, Shield, Star,
  ArrowRight, CheckCircle, Smartphone, HeadphonesIcon,
  TrendingUp, Users, Calendar, ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui'

// ─── Data ────────────────────────────────────────────────────────────────────

const stats = [
  { value: '50,000+', label: 'Happy Passengers' },
  { value: '200+',    label: 'Daily Trips' },
  { value: '4.9★',   label: 'Average Rating' },
  { value: '99.8%',  label: 'On-Time Rate' },
]

const steps = [
  { step: '01', icon: MapPin,      title: 'Choose Your Route',   desc: 'Search available buses by origin, destination, and travel date.' },
  { step: '02', icon: Ticket,      title: 'Select Your Seat',    desc: 'Pick your preferred seat from an interactive seat map.' },
  { step: '03', icon: Smartphone,  title: 'Pay & Confirm',       desc: 'Complete payment securely via Mobile Money or card.' },
  { step: '04', icon: QrCode,      title: 'Travel with QR Code', desc: 'Download your digital ticket and board with a QR scan.' },
]

const features = [
  { icon: Shield,          title: 'Secure Payments',      desc: 'Bank-grade encryption on every transaction.' },
  { icon: Clock,           title: 'Instant Confirmation', desc: 'Receive your ticket within seconds of booking.' },
  { icon: QrCode,          title: 'Digital Tickets',      desc: 'PDF tickets with embedded QR codes — no printing needed.' },
  { icon: HeadphonesIcon,  title: '24/7 Support',         desc: 'Our team is always available to assist you.' },
  { icon: TrendingUp,      title: 'Real-time Seats',      desc: 'Live seat availability updated every second.' },
  { icon: CheckCircle,     title: 'Easy Cancellation',    desc: 'Cancel up to 3 hours before departure, hassle-free.' },
]

const testimonials = [
  { name: 'Amina Uwase',    role: 'Regular Commuter',  rating: 5, text: 'I book my weekly Nyanza–Kigali trip in under 2 minutes. The QR boarding is seamless — no queues!' },
  { name: 'Jean-Paul Nkusi', role: 'Business Traveler', rating: 5, text: 'Finally a Rwandan bus platform that feels world-class. Clean UI, instant tickets, and reliable buses.' },
  { name: 'Grace Mukamana', role: 'Student',            rating: 5, text: 'The cancellation policy is fair and the refund process is transparent. Highly recommend!' },
]

const route = {
  from: 'Nyanza',
  to: 'Kigali',
  stops: ['Nyanza', 'Ruhango', 'Muhanga', 'Kigali'],
  duration: '2h 30min',
  distance: '112 km',
  from_price: 2000,
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
      ))}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const navigate = useNavigate()
  const [origin, setOrigin] = useState('')
  const [date, setDate]     = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    navigate(`/search?origin=${encodeURIComponent(origin)}&date=${date}`)
  }

  return (
    <div className="overflow-x-hidden">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 overflow-hidden">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -top-32 -right-32 h-[600px] w-[600px] rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 h-[500px] w-[500px] rounded-full bg-primary-300/10 blur-3xl" />

        <div className="relative mx-auto w-full max-w-6xl px-4 py-24 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">

            {/* Left copy */}
            <div className="text-white">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-primary-100 backdrop-blur mb-6">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                Rwanda's #1 Online Bus Platform
              </span>
              <h1 className="text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
                Travel Smarter.<br />
                <span className="text-primary-200">Book Faster.</span>
              </h1>
              <p className="mt-6 text-lg text-primary-100 max-w-lg leading-relaxed">
                Search, book, and board your bus from Nyanza to Kigali — entirely online.
                No office visit. No queues. Just travel.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-primary-200">
                  <CheckCircle className="h-4 w-4 text-green-400" /> Instant e-ticket
                </div>
                <div className="flex items-center gap-2 text-sm text-primary-200">
                  <CheckCircle className="h-4 w-4 text-green-400" /> Mobile Money accepted
                </div>
                <div className="flex items-center gap-2 text-sm text-primary-200">
                  <CheckCircle className="h-4 w-4 text-green-400" /> Free cancellation
                </div>
              </div>
            </div>

            {/* Search card */}
            <div className="rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-900">
              <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">Find Your Bus</h2>
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      placeholder="e.g. Nyanza"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      placeholder="e.g. Kigali"
                      readOnly
                      defaultValue="Kigali"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Travel Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      value={date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>
                <Button type="submit" size="lg" className="w-full mt-2">
                  Search Available Buses <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
              <p className="mt-4 text-center text-xs text-gray-400">
                No account needed to search schedules
              </p>
            </div>
          </div>
        </div>

        {/* wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L1440 80L1440 40C1200 80 960 0 720 40C480 80 240 0 0 40L0 80Z" className="fill-white dark:fill-gray-950" />
          </svg>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-gray-950 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-4xl font-extrabold text-primary-600">{value}</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="bg-gray-50 dark:bg-gray-900 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-16 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary-600">Simple Process</span>
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Book in 4 Easy Steps
            </h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              From search to boarding, the entire journey takes less than 3 minutes.
            </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ step, icon: Icon, title, desc }, i) => (
              <div key={step} className="relative">
                {i < steps.length - 1 && (
                  <div className="absolute top-8 left-full hidden w-full border-t-2 border-dashed border-primary-200 dark:border-primary-800 lg:block" style={{ width: 'calc(100% - 4rem)', left: '4rem' }} />
                )}
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 shadow-lg shadow-primary-200 dark:shadow-primary-900">
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-primary-600 shadow dark:bg-gray-800">
                      {step}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Route Showcase ───────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-gray-950 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-16 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary-600">Our Route</span>
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Nyanza → Kigali
            </h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400">
              Serving Rwanda's most travelled corridor with comfort and reliability.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-primary-50 to-white p-8 shadow-sm dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              {/* Stop timeline */}
              <div className="flex-1">
                <div className="flex items-center gap-0">
                  {route.stops.map((stop, i) => (
                    <div key={stop} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div className={`h-4 w-4 rounded-full border-2 ${i === 0 || i === route.stops.length - 1 ? 'border-primary-600 bg-primary-600' : 'border-primary-400 bg-white dark:bg-gray-800'}`} />
                        <span className="mt-2 text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{stop}</span>
                      </div>
                      {i < route.stops.length - 1 && (
                        <div className="mb-4 h-0.5 w-16 bg-primary-300 dark:bg-primary-700 sm:w-24" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Route meta */}
              <div className="flex flex-wrap gap-6 lg:flex-col lg:gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
                    <Clock className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{route.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
                    <TrendingUp className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Distance</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{route.distance}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
                    <Ticket className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">From</p>
                    <p className="font-semibold text-primary-600">RWF {route.from_price.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <Button size="lg" onClick={() => navigate('/search')} className="shrink-0">
                Book This Route <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ────────────────────────────────────────────────── */}
      <section className="bg-gray-50 dark:bg-gray-900 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-16 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary-600">Why Choose Us</span>
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Built for Modern Travelers
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 transition-colors group-hover:bg-primary-600 dark:bg-primary-900/30">
                  <Icon className="h-6 w-6 text-primary-600 transition-colors group-hover:text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-gray-950 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-16 text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary-600">Testimonials</span>
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Loved by Thousands
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {testimonials.map(({ name, role, rating, text }) => (
              <div key={name} className="rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
                <StarRating count={rating} />
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">"{text}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{name}</p>
                    <p className="text-xs text-gray-500">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Badges ─────────────────────────────────────────────────── */}
      <section className="border-y border-gray-200 bg-gray-50 py-12 dark:border-gray-700 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-10 text-gray-400 dark:text-gray-500">
            {[
              { icon: Shield,      label: 'SSL Secured' },
              { icon: Users,       label: '50,000+ Users' },
              { icon: CheckCircle, label: 'Verified Operator' },
              { icon: Star,        label: '4.9 App Rating' },
              { icon: Clock,       label: '24/7 Available' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm font-medium">
                <Icon className="h-5 w-5 text-primary-500" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-primary-700 to-primary-500 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to Travel?
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            Join thousands of Rwandans who book their bus tickets online every day.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              className="bg-white text-primary-700 hover:bg-primary-50 focus:ring-white"
              onClick={() => navigate('/search')}
            >
              Search Schedules <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="border border-white/40 text-white hover:bg-white/10"
              onClick={() => navigate('/register')}
            >
              Create Free Account
            </Button>
          </div>
        </div>
      </section>

    </div>
  )
}
