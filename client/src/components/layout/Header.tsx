import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Bus, Moon, Sun, Menu, X, MapPin } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { clsx } from 'clsx'

export default function Header() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/')
    setMenuOpen(false)
  }

  const dashboardPath =
    user?.role === 'ADMIN' ? '/admin' : user?.role === 'AGENT' ? '/agent' : '/dashboard'

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/80 dark:bg-gray-900/95 dark:border-gray-700/80">
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
            <Bus className="h-[18px] w-[18px] text-white" />
          </div>
          <div className="hidden sm:block">
            <span className="text-sm font-extrabold text-gray-900 dark:text-white tracking-tight">
              Rwanda<span className="text-primary-600">Bus</span>
            </span>
          </div>
        </Link>

        {/* Route pill — center, desktop only */}
        <div className="hidden md:flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-xs font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
          <MapPin className="h-3.5 w-3.5 text-primary-500 shrink-0" />
          Nyanza
          <span className="mx-1 text-gray-300 dark:text-gray-600">→</span>
          Kigali
        </div>

        {/* Desktop nav + actions */}
        <div className="hidden md:flex items-center gap-1">
          <Link
            to="/"
            className={clsx(
              'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive('/') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
            )}
          >
            Home
          </Link>
          <Link
            to="/search"
            className={clsx(
              'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive('/search') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
            )}
          >
            Schedules
          </Link>
          {user && (
            <Link
              to={dashboardPath}
              className={clsx(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                location.pathname.startsWith(dashboardPath) ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
              )}
            >
              Dashboard
            </Link>
          )}

          <div className="mx-2 h-5 w-px bg-gray-200 dark:bg-gray-700" />

          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>

          {user ? (
            <div className="flex items-center gap-2 ml-1">
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-2.5 py-1.5 dark:border-gray-700">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-[11px] font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate text-sm text-gray-700 dark:text-gray-300">
                  {user.name.split(' ')[0]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-1">
              <button
                onClick={() => navigate('/login')}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="rounded-lg bg-primary-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1"
              >
                Get Started
              </button>
            </div>
          )}
        </div>

        {/* Mobile right */}
        <div className="flex items-center gap-1 md:hidden">
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>
          <button
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 md:hidden">
          <nav className="flex flex-col px-4 py-3 gap-1">
            {[
              { to: '/', label: 'Home' },
              { to: '/search', label: 'Search Schedules' },
              ...(user ? [{ to: dashboardPath, label: 'Dashboard' }] : []),
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                className={clsx(
                  'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive(to)
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-gray-100 px-4 py-3 dark:border-gray-800">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role.toLowerCase()}</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="text-sm font-medium text-red-500 hover:text-red-600">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => { navigate('/login'); setMenuOpen(false) }}
                  className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
                >
                  Login
                </button>
                <button
                  onClick={() => { navigate('/register'); setMenuOpen(false) }}
                  className="flex-1 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
