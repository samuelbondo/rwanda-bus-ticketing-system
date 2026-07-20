import { Link } from 'react-router-dom'
import { Bus, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useSettings } from '@/contexts/SettingsContext'

export default function Footer() {
  const { user } = useAuth()
  const { siteName, supportPhone, supportEmail, supportAddress, facebookUrl, twitterUrl, instagramUrl } = useSettings()

  const accountLinks = user
    ? [
        { label: 'Dashboard', to: user.role === 'ADMIN' ? '/admin' : user.role === 'AGENT' ? '/agent' : '/dashboard' },
        { label: 'My Bookings', to: '/bookings' },
      ]
    : [
        { label: 'Login', to: '/login' },
        { label: 'Register', to: '/register' },
      ]

  const socials = [
    { Icon: Facebook, url: facebookUrl },
    { Icon: Twitter, url: twitterUrl },
    { Icon: Instagram, url: instagramUrl },
  ]

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        {/* Main grid */}
        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-5">

          {/* Brand col */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600">
                <Bus className="h-5 w-5 text-white" />
              </div>
              {siteName}
            </Link>
            <p className="mt-4 text-sm leading-relaxed">
              Rwanda's online bus ticketing platform. Book your seat in seconds, travel with confidence.
            </p>
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary-500 shrink-0" />
                {supportAddress}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary-500 shrink-0" />
                {supportPhone}
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary-500 shrink-0" />
                {supportEmail}
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              {socials.map(({ Icon, url }, i) => (
                <a
                  key={i}
                  href={url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 text-gray-400 transition hover:bg-primary-600 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Travel */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white">Travel</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/search" className="transition hover:text-primary-400">Search Schedules</Link></li>
              <li><Link to="/search" className="transition hover:text-primary-400">Nyanza → Kigali</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white">Account</h4>
            <ul className="space-y-2 text-sm">
              {accountLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="transition hover:text-primary-400">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="transition hover:text-primary-400">Privacy Policy</a></li>
              <li><a href="#" className="transition hover:text-primary-400">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-800 py-6 text-xs sm:flex-row">
          <p>© {new Date().getFullYear()} {siteName} Ticketing System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
