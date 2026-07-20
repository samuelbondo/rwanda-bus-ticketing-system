import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Bus, Moon, Sun, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui'
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
  }

  const dashboardPath =
    user?.role === 'ADMIN' ? '/admin' : user?.role === 'AGENT' ? '/agent' : '/dashboard'

  function navLink(to: string, label: string) {
    const active = location.pathname === to
    return (
      <Link
        to={to}
        className={clsx(
          'text-sm font-medium transition-colors',
          active
            ? 'text-primary-600 dark:text-primary-400'
            : 'text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400'
        )}
      >
        {label}
      </Link>
    )
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 backdrop-blur-md dark:border-gray-700/80 dark:bg-gray-900/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 font-bold text-gray-900 dark:text-white">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 shrink-0">
            <Bus className="h-[18px] w-[18px] text-white" />
          </div>
          <span className="hidden sm:inline">
            Rwanda <span className="text-primary-600">Bus</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {navLink('/', 'Home')}
          {navLink('/search', 'Search')}
          {user && navLink(dashboardPath, 'Dashboard')}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Toggle theme"
          >
            {theme === 'dark'
              ? <Sun className="h-[18px] w-[18px]" />
              : <Moon className="h-[18px] w-[18px]" />
            }
          </button>

          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5 dark:border-gray-700">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate text-sm text-gray-700 dark:text-gray-300">
                  {user.name}
                </span>
              </div>
              <Button variant="secondary" size="sm" onClick={handleLogout}>Logout</Button>
            </div>
          ) : (
            <div className="hidden gap-2 md:flex">
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Login</Button>
              <Button size="sm" onClick={() => navigate('/register')}>Get Started</Button>
            </div>
          )}

          <button
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-4 dark:border-gray-700 dark:bg-gray-900 md:hidden">
          <div className="flex flex-col gap-4 text-sm">
            <Link to="/" onClick={() => setMenuOpen(false)} className={clsx('font-medium', location.pathname === '/' ? 'text-primary-600' : 'text-gray-700 dark:text-gray-300')}>
              Home
            </Link>
            <Link to="/search" onClick={() => setMenuOpen(false)} className={clsx('font-medium', location.pathname === '/search' ? 'text-primary-600' : 'text-gray-700 dark:text-gray-300')}>
              Search Schedules
            </Link>
            {user ? (
              <>
                <Link to={dashboardPath} onClick={() => setMenuOpen(false)} className="font-medium text-gray-700 dark:text-gray-300">
                  Dashboard
                </Link>
                <div className="border-t border-gray-100 pt-3 dark:border-gray-800">
                  <p className="mb-2 text-xs text-gray-400">Signed in as {user.name}</p>
                  <button onClick={handleLogout} className="text-left font-medium text-red-500">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-3 border-t border-gray-100 pt-3 dark:border-gray-800">
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => { navigate('/login'); setMenuOpen(false) }}>
                  Login
                </Button>
                <Button size="sm" className="flex-1" onClick={() => { navigate('/register'); setMenuOpen(false) }}>
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
