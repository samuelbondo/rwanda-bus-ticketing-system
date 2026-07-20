import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Ticket, QrCode, Clock, MapPin, Shield, Star,
  ArrowRight, CheckCircle, Smartphone, HeadphonesIcon,
  TrendingUp, Users, Calendar, ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui'

const stats = [
  { value: '50,000+', label: 'Happy Passengers' },
  { value: '200+',    label: 'Daily Trips' },
  { value: '4.9★',   label: 'Average Rating' },
  { value: '99.8%',  label: 'On-Time Rate' },
]

const steps = [
  { step: '01', icon: MapPin,     title: 'Choose Your Route',   desc: 'Search available buses by origin, destination, and travel date.' },
  { step: '02', icon: Ticket,     title: 'Select Your Seat',    desc: 'Pick your preferred seat from an interactive seat map.' },
  { step: '03', icon: Smartphone, title: 'Pay & Confirm',       desc: 'Complete payment securely via Mobile Money or card.' },
  { step: '04', icon: QrCode,     title: 'Travel with QR Code', desc: 'Download your digital ticket and board with a QR scan.' },
]

const features = [
  { icon: Shield,         title: 'Secure Payments',      desc: 'Bank-grade encryption on every transaction.' },
  { icon: Clock,          title: 'Instant Confirmation', desc: 'Receive your ticket within seconds of booking.' },
  { icon: QrCode,         title: 'Digital Tickets',      desc: 'PDF tickets with embedded QR codes — no printing needed.' },
  { icon: HeadphonesIcon, title: '24/7 Support',         desc: 'Our team is always available to assist you.' },
  { icon: TrendingUp,     title: 'Real-time Seats',      desc: 'Live seat availability updated every second.' },
  { icon: CheckCircle,    title: 'Easy Cancellation',    desc: 'Cancel up to 3 hours before departure, hassle-free.' },
]

const testimonials = [
  { name: 'Amina Uwase',     role: 'Regular Commuter',  rating: 5, text: 'I book my weekly Nyanza–Kigali trip in under 2 minutes. The QR boarding is seamless — no queues!' },
  { name: 'Jean-Paul Nkusi', role: 'Business Traveler', rating: 5, text: 'Finally a Rwandan bus platform that feels world-class. Clean UI, instant tickets, and reliable buses.' },
  { name: 'Grace Mukamana',  role: 'Student',           rating: 5, text: 'The cancellation policy is fair and the refund process is transparent. Highly recommend!' },
]

const routeStops = ['Nyanza', 'Ruhango', 'Muhanga', 'Kigali']

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
      ))}
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const [origin, setOrigin] = useState('')
  const [date, setDate] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (origin) params.set('origin', origin)
    if (date) params.set('date', date)
    navigate(`/search?${params.toString()}`)
  }

  return (
    <div className="overflow-x-hidden">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 overflow-hidden">
        <div className="pointer-events-none absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 h-[400px] w-[400px] rounded-full bg-primary-300/10 blur-3xl" />

        <div className="relative mx-auto w-full max-w-6xl px-4 py-16 sm:py-20 lg:py-28 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">

            {/* Left copy */}
            <div className="text-white">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary-100 backdrop-blur mb-5">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                Rwanda's #1 Online Bus Platform
              </span>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
                Travel Smarter.<br />
                <span className="text-primary-200">Book Faster.</span>
              </h1>
              <p className="mt-5 text-base sm:text-lg text-primary-100 max-w-lg leading-relaxed">
                Search, book, and board your bus from Nyanza to Kigali — entirely online.
                No office visit. No queues. Just travel.
              </p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-4">
                {['Instant e-ticket', 'Mobile Money accepted', 'Free cancellation'].map((t) => (
                  <div key={t} className="flex items-center gap-2 text-sm text-primary-200">
                    <CheckCircle className="h-4 w-4 shrink-0 text-green-400" /> {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Search card */}
            <div className="rounded-2xl bg-white p-5 sm:p-8 shadow-2xl dark:bg-gray-900">
              <h2 className="mb-5 text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Find Your Bus</h2>
              <form onSubmit={handleSearch} className="space-y-4">

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">From</label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                      placeholder="e.g. Nyanza"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">To</label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 py-3 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
                      value="Kigali"
                      readOnly
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Travel Date</label>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:[color-scheme:dark]"
                      value={date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full">
                  Search Available Buses <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
              <p className="mt-3 text-center text-xs text-gray-400">No account needed to search schedules</p>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 leading-none">
          <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" className="w-full block">
            <path d="M0 60L1440 60L1440 30C1200 60 960 0 720 30C480 60 240 0 0 30Z" className="fill-white dark:fill-gray-950" />
          </svg>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-gray-950 py-14 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl sm:text-4xl font-extrabold text-primary-600">{value}</p>
                <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section className="bg-gray-50 dark:bg-gray-900 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 sm:mb-16 text-center">
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-primary-600">Simple Process</span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white lg:text-4xl">
              Book in 4 Easy Steps
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              From search to boarding, the entire journey takes less than 3 minutes.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 shadow-lg shadow-primary-200 dark:shadow-primary-900/50">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-primary-600 shadow dark:bg-gray-800 dark:text-primary-400">
                    {step}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Route Showcase ────────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-gray-950 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 sm:mb-16 text-center">
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-primary-600">Our Route</span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white lg:text-4xl">
              Nyanza → Kigali
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-500 dark:text-gray-400">
              Serving Rwanda's most travelled corridor with comfort and reliability.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-primary-50 to-white p-6 sm:p-8 shadow-sm dark:border-gray-700 dark:from-gray-800 dark:to-gray-900">
            {/* Stop timeline — responsive: vertical on mobile, horizontal on sm+ */}
            <div className="mb-8">
              {/* Mobile: vertical list */}
              <div className="flex flex-col gap-0 sm:hidden">
                {routeStops.map((stop, i) => (
                  <div key={stop} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`h-4 w-4 rounded-full border-2 mt-0.5 ${i === 0 || i === routeStops.length - 1 ? 'border-primary-600 bg-primary-600' : 'border-primary-400 bg-white dark:bg-gray-800'}`} />
                      {i < routeStops.length - 1 && <div className="w-0.5 h-8 bg-primary-300 dark:bg-primary-700" />}
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 pt-0.5">{stop}</span>
                  </div>
                ))}
              </div>
              {/* Desktop: horizontal */}
              <div className="hidden sm:flex items-center justify-center">
                {routeStops.map((stop, i) => (
                  <div key={stop} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`h-4 w-4 rounded-full border-2 ${i === 0 || i === routeStops.length - 1 ? 'border-primary-600 bg-primary-600' : 'border-primary-400 bg-white dark:bg-gray-800'}`} />
                      <span className="mt-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">{stop}</span>
                    </div>
                    {i < routeStops.length - 1 && (
                      <div className="mb-5 h-0.5 w-16 sm:w-20 lg:w-28 bg-primary-300 dark:bg-primary-700" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-4 sm:gap-6">
                {[
                  { icon: Clock,      label: 'Duration', value: '2h 30min' },
                  { icon: TrendingUp, label: 'Distance', value: '112 km' },
                  { icon: Ticket,     label: 'From',     value: 'RWF 2,000', highlight: true },
                ].map(({ icon: Icon, label, value, highlight }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30 shrink-0">
                      <Icon className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className={`font-semibold text-sm ${highlight ? 'text-primary-600' : 'text-gray-900 dark:text-white'}`}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button size="lg" onClick={() => navigate('/search')} className="w-full sm:w-auto shrink-0">
                Book This Route <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Grid ─────────────────────────────────────────────────── */}
      <section className="bg-gray-50 dark:bg-gray-900 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 sm:mb-16 text-center">
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-primary-600">Why Choose Us</span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white lg:text-4xl">
              Built for Modern Travelers
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 transition-colors duration-200 group-hover:bg-primary-600 dark:bg-primary-900/30">
                  <Icon className="h-6 w-6 text-primary-600 transition-colors duration-200 group-hover:text-white" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-gray-950 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 sm:mb-16 text-center">
            <span className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-primary-600">Testimonials</span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white lg:text-4xl">
              Loved by Thousands
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {testimonials.map(({ name, role, rating, text }) => (
              <div key={name} className="rounded-2xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-800">
                <StarRating count={rating} />
                <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">"{text}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                    {name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{name}</p>
                    <p className="text-xs text-gray-500">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Badges ──────────────────────────────────────────────────── */}
      <section className="border-y border-gray-200 bg-gray-50 py-10 dark:border-gray-700 dark:bg-gray-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {[
              { icon: Shield,      label: 'SSL Secured' },
              { icon: Users,       label: '50,000+ Users' },
              { icon: CheckCircle, label: 'Verified Operator' },
              { icon: Star,        label: '4.9 App Rating' },
              { icon: Clock,       label: '24/7 Available' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary-500 shrink-0" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-primary-700 to-primary-500 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white lg:text-4xl">
            Ready to Travel?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-primary-100">
            Join thousands of Rwandans who book their bus tickets online every day.
          </p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
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
