import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import {
  MapPin, Calendar, Users, ArrowRight, Clock,
  QrCode, Shield, CheckCircle, ChevronRight, Bus,
} from 'lucide-react'
import { scheduleService } from '@/services/scheduleService'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Skeleton } from '@/components/ui'
import type { Schedule } from '@/types'
import HeroSlideshow from '@/components/HeroSlideshow'
import RouteJourneyStrip from '@/components/RouteJourneyStrip'
import BusShowcase from '@/components/BusShowcase'

const today = new Date().toISOString().split('T')[0]
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

const whyUs = [
  { icon: Shield,      title: 'Secure & Trusted',      desc: 'Every transaction is encrypted. Your data stays private.' },
  { icon: Clock,       title: 'Real-time Availability', desc: 'Seat counts update live — no surprises at the terminal.' },
  { icon: QrCode,      title: 'Paperless Tickets',      desc: 'Your PDF ticket with QR code arrives instantly by email.' },
  { icon: CheckCircle, title: 'Easy Cancellation',      desc: 'Cancel up to 3 hours before departure, no hassle.' },
]

function ScheduleCard({ s, onBook }: { s: Schedule; onBook: () => void }) {
  const dep = new Date(s.departureTime)
  const timeStr = dep.toLocaleTimeString('en-RW', { hour: '2-digit', minute: '2-digit' })
  const dateStr = dep.toLocaleDateString('en-RW', { weekday: 'short', month: 'short', day: 'numeric' })
  const full = s.availableSeats === 0
  const cancelled = s.status === 'CANCELLED'

  return (
    <div className={`flex flex-col rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md dark:bg-gray-800 ${
      cancelled ? 'border-red-200 opacity-60 dark:border-red-900' : 'border-gray-200 dark:border-gray-700'
    }`}>
      <div className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-white">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-primary-600" />
        <span className="truncate text-sm">{s.route.origin} → {s.route.destination}</span>
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
        <Clock className="h-3.5 w-3.5 shrink-0" />
        <span className="font-medium text-gray-800 dark:text-gray-200">{timeStr}</span>
        <span>·</span>
        <span>{dateStr}</span>
      </div>
      <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1"><Bus className="h-3.5 w-3.5 shrink-0" />{s.bus.name}</span>
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5 shrink-0" />
          {full ? <span className="text-red-500 font-medium">Full</span> : <>{s.availableSeats} left</>}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-base font-bold text-primary-600">RWF {Number(s.price).toLocaleString()}</span>
        {cancelled ? (
          <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">Cancelled</span>
        ) : (
          <Button size="sm" disabled={full} onClick={onBook}>{full ? 'Full' : 'Book'}</Button>
        )}
      </div>
    </div>
  )
}

const STOPS = ['Nyanza', 'Ruhango', 'Muhanga', 'Kigali']

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [origin, setOrigin] = useState('Nyanza')
  const [destination, setDestination] = useState('Kigali')
  const [date, setDate] = useState(today)
  const [dateError, setDateError] = useState('')

  function handleDateChange(val: string) {
    if (val < today) {
      setDateError('Please select today or a future date.')
      setDate(today)
    } else {
      setDateError('')
      setDate(val)
    }
  }

  const { data: todayData, isLoading: loadingToday } = useQuery({
    queryKey: ['schedules-home', today],
    queryFn: () => scheduleService.search({ date: today }),
    staleTime: 60_000,
  })
  const { data: tomorrowData, isLoading: loadingTomorrow } = useQuery({
    queryKey: ['schedules-home', tomorrow],
    queryFn: () => scheduleService.search({ date: tomorrow }),
    staleTime: 60_000,
  })

  const todaySchedules: Schedule[] = (todayData as { data: Schedule[] })?.data ?? []
  const tomorrowSchedules: Schedule[] = (tomorrowData as { data: Schedule[] })?.data ?? []
  const allSchedules = [...todaySchedules, ...tomorrowSchedules].slice(0, 3)
  const loading = loadingToday || loadingTomorrow

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const p = new URLSearchParams()
    if (origin) p.set('origin', origin)
    if (destination) p.set('destination', destination)
    if (date) p.set('date', date)
    navigate(`/search?${p.toString()}`)
  }

  return (
    <div className="overflow-x-hidden">

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0f2d6b] via-[#1a4db8] to-[#2563eb]">
        <HeroSlideshow />
        <div className="pointer-events-none absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-20 lg:py-24">
          <div className="grid gap-6 sm:gap-10 lg:grid-cols-[1fr_420px] lg:items-start lg:gap-14">

            {/* Left */}
            <div className="text-white">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-100 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
                Rwanda's Online Bus Ticketing Platform
              </div>

              <h1 className="text-2xl font-extrabold leading-[1.15] tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl">
                Book Your Bus Ticket<br />
                <span className="text-blue-200">From Anywhere.</span>
              </h1>

              <p className="mt-3 max-w-md text-sm sm:text-base text-blue-100 leading-relaxed">
                Travel the Nyanza–Kigali corridor without visiting a ticket office.
                Search schedules, pick your seat, pay with Mobile Money, and board with a QR code.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {['No office visit', 'Instant e-ticket', 'Cancel anytime'].map((t) => (
                  <span key={t} className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs text-blue-100">
                    <CheckCircle className="h-3 w-3 text-green-400 shrink-0" /> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Search card — desktop only inside hero */}
            <div className="hidden sm:block w-full rounded-2xl bg-white shadow-2xl dark:bg-gray-900 overflow-hidden">
              <div className="bg-primary-600 px-5 py-3">
                <h2 className="text-base font-bold text-white">Find a Bus</h2>
                <p className="text-xs text-blue-100 mt-0.5">Search available departures</p>
              </div>
              <form onSubmit={handleSearch} className="p-4 sm:p-5 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">From</label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                    <select
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-2.5 text-sm text-gray-900 transition focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      value={origin}
                      onChange={(e) => { setOrigin(e.target.value); if (e.target.value === destination) setDestination('') }}
                    >
                      {STOPS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">To</label>
                  <div className="relative">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                    <select
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-2.5 text-sm text-gray-900 transition focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    >
                      <option value="">Select destination</option>
                      {STOPS.filter((s) => s !== origin).map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Travel Date</label>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      className={`w-full rounded-lg border bg-gray-50 pl-9 pr-3 py-2.5 text-sm text-gray-900 transition focus:bg-white focus:outline-none focus:ring-2 dark:bg-gray-800 dark:text-white dark:[color-scheme:dark] ${
                        dateError
                          ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20'
                          : 'border-gray-200 focus:border-primary-500 focus:ring-primary-500/20 dark:border-gray-700'
                      }`}
                      value={date}
                      min={today}
                      onChange={(e) => handleDateChange(e.target.value)}
                    />
                  </div>
                  {dateError && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                      <Calendar className="h-3 w-3 shrink-0" />{dateError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:scale-[0.98]"
                >
                  Search Buses <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH CARD — mobile only, below hero */}
      <div className="block sm:hidden bg-white dark:bg-gray-900 px-4 py-5 shadow-md">
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">From</label>
              <select
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                value={origin}
                onChange={(e) => { setOrigin(e.target.value); if (e.target.value === destination) setDestination('') }}
              >
                {STOPS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">To</label>
              <select
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              >
                <option value="">Select</option>
                {STOPS.filter((s) => s !== origin).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Travel Date</label>
            <input
              type="date"
              className={`w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:outline-none dark:bg-gray-800 dark:text-white dark:[color-scheme:dark] ${
                dateError
                  ? 'border-red-400 focus:border-red-400'
                  : 'border-gray-200 focus:border-primary-500 dark:border-gray-700'
              }`}
              value={date}
              min={today}
              onChange={(e) => handleDateChange(e.target.value)}
            />
          </div>
          {dateError && (
            <p className="flex items-center gap-1 text-xs text-red-500">
              <Calendar className="h-3 w-3 shrink-0" />{dateError}
            </p>
          )}
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 active:scale-[0.98]"
          >
            Search Buses <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* LIVE DEPARTURES */}
      <section className="bg-gray-50 dark:bg-gray-950 py-10 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">Upcoming Departures</h2>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Next available trips — live from our system</p>
            </div>
            <button
              onClick={() => navigate('/search')}
              className="flex shrink-0 items-center gap-1 text-xs sm:text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              View all <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {loading && (
            <div className="grid gap-3 sm:grid-cols-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-36 w-full rounded-xl" />)}
            </div>
          )}

          {!loading && allSchedules.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white py-10 text-center dark:border-gray-700 dark:bg-gray-800">
              <Bus className="mx-auto mb-3 h-8 w-8 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No departures scheduled for today or tomorrow.</p>
              <button onClick={() => navigate('/search')} className="mt-3 text-sm font-medium text-primary-600 hover:underline">Search other dates</button>
            </div>
          )}

          {!loading && allSchedules.length > 0 && (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                {allSchedules.map((s) => (
                  <ScheduleCard
                    key={s.id}
                    s={s}
                    onBook={() => user
                      ? navigate(`/book/${s.id}`)
                      : navigate('/login', { state: { scheduleId: s.id } })
                    }
                  />
                ))}
              </div>
              <div className="mt-5 text-center">
                <Button variant="secondary" onClick={() => navigate('/search')}>
                  See all schedules <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      <RouteJourneyStrip />
      <BusShowcase />

      {/* WHY US */}
      <section className="bg-gray-50 dark:bg-gray-950 py-10 sm:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="mb-6 text-center text-base sm:text-xl font-bold text-gray-900 dark:text-white">
            Why Travelers Choose Us
          </h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {whyUs.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/30">
                  <Icon className="h-4 w-4 text-primary-600" />
                </div>
                <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
                <p className="mt-1 hidden text-xs text-gray-500 dark:text-gray-400 leading-relaxed sm:block">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600 py-10 sm:py-16">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="text-lg sm:text-2xl font-extrabold text-white">
            Ready to book your next trip?
          </h2>
          <p className="mt-2 text-sm sm:text-base text-blue-100">
            Create a free account and manage all your bookings in one place.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => navigate('/register')}
              className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary-700 transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
            >
              Create Free Account
            </button>
            <button
              onClick={() => navigate('/search')}
              className="rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus:outline-none"
            >
              Browse Schedules
            </button>
          </div>
        </div>
      </section>

    </div>
  )
}
