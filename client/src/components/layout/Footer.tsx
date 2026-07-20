import { Link } from 'react-router-dom'
import { Bus, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react'

const links = {
  Company:  [{ label: 'About Us', to: '/' }, { label: 'Careers', to: '/' }, { label: 'Press', to: '/' }],
  Travel:   [{ label: 'Search Schedules', to: '/search' }, { label: 'Routes', to: '/search' }, { label: 'Timetable', to: '/search' }],
  Support:  [{ label: 'Help Center', to: '/' }, { label: 'Contact Us', to: '/' }, { label: 'Refund Policy', to: '/' }],
  Account:  [{ label: 'Login', to: '/login' }, { label: 'Register', to: '/register' }, { label: 'My Bookings', to: '/dashboard' }],
}

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        {/* Main grid */}
        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-6">

          {/* Brand col */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600">
                <Bus className="h-5 w-5 text-white" />
              </div>
              Rwanda Bus
            </Link>
            <p className="mt-4 text-sm leading-relaxed">
              Rwanda's most trusted online bus ticketing platform. Book your seat in seconds, travel with confidence.
            </p>
            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary-500 shrink-0" />
                KG 7 Ave, Kigali, Rwanda
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary-500 shrink-0" />
                +250 788 000 000
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary-500 shrink-0" />
                support@rwandabus.rw
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 text-gray-400 transition hover:bg-primary-600 hover:text-white">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([heading, items]) => (
            <div key={heading}>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white">{heading}</h4>
              <ul className="space-y-2 text-sm">
                {items.map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className="transition hover:text-primary-400">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-800 py-6 text-xs sm:flex-row">
          <p>© {new Date().getFullYear()} Rwanda Bus Ticketing System. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary-400 transition">Privacy Policy</a>
            <a href="#" className="hover:text-primary-400 transition">Terms of Service</a>
            <a href="#" className="hover:text-primary-400 transition">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
