import { Link, useNavigate } from 'react-router-dom'
import { Bus, Moon, Sun, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui'

export default function Header() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  const dashboardPath =
    user?.role === 'ADMIN' ? '/admin' : user?.role === 'AGENT' ? '/agent' : '/dashboard'

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-700 dark:bg-gray-900/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-primary-600">
          <Bus className="h-6 w-6" />
          <span className="hidden sm:inline">Rwanda Bus</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link to="/search" className="text-gray-600 hover:text-primary-600 dark:text-gray-300">Search</Link>
          {user && <Link to={dashboardPath} className="text-gray-600 hover:text-primary-600 dark:text-gray-300">Dashboard</Link>}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              <span className="text-sm text-gray-600 dark:text-gray-300">{user.name}</span>
              <Button variant="secondary" size="sm" onClick={handleLogout}>Logout</Button>
            </div>
          ) : (
            <div className="hidden gap-2 md:flex">
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Login</Button>
              <Button size="sm" onClick={() => navigate('/register')}>Register</Button>
            </div>
          )}
          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900 md:hidden">
          <div className="flex flex-col gap-3 text-sm">
            <Link to="/search" onClick={() => setMenuOpen(false)} className="text-gray-600 dark:text-gray-300">Search</Link>
            {user ? (
              <>
                <Link to={dashboardPath} onClick={() => setMenuOpen(false)} className="text-gray-600 dark:text-gray-300">Dashboard</Link>
                <button onClick={handleLogout} className="text-left text-red-500">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="text-gray-600 dark:text-gray-300">Login</Link>
                <Link to="/register" onClick={() => setMenuOpen(false)} className="text-primary-600 font-medium">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
