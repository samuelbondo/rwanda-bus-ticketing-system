import { Link, useNavigate } from 'react-router-dom'
import { Bus, Moon, Sun, LogOut, ChevronDown, Menu } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'

const roleColors: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  AGENT: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  CUSTOMER: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
}

interface DashboardHeaderProps {
  navItems: { label: string; to: string; icon: React.ElementType }[]
  onMenuClick?: () => void
}

export default function DashboardHeader({ navItems, onMenuClick }: DashboardHeaderProps) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  const profilePath =
    user?.role === 'ADMIN' ? '/admin/profile'
    : user?.role === 'AGENT' ? '/agent/profile'
    : '/profile'

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/95 backdrop-blur-md dark:border-gray-700/80 dark:bg-gray-900/95">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">

        {/* Brand */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <Bus className="h-[18px] w-[18px] text-white" />
            </div>
            <span className="hidden text-sm font-extrabold tracking-tight text-gray-900 dark:text-white sm:block">
              Rwanda<span className="text-primary-600">Bus</span>
            </span>
          </Link>
          {user && (
            <span className={`hidden rounded-full px-2.5 py-0.5 text-xs font-semibold sm:inline-flex ${roleColors[user.role] ?? ''}`}>
              {user.role.charAt(0) + user.role.slice(1).toLowerCase()} Panel
            </span>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
          </button>

          {/* User dropdown — desktop */}
          {user && (
            <div className="relative hidden md:block">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-lg border border-gray-200 px-2.5 py-1.5 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="max-w-[120px] truncate text-sm font-medium text-gray-900 dark:text-white">
                    {user.name.split(' ')[0]}
                  </p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-700">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                      <p className="truncate text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className="p-1">
                      <Link
                        to={profilePath}
                        onClick={() => setDropdownOpen(false)}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        Manage Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Mobile hamburger — triggers sidebar drawer */}
          <button
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 md:hidden"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>


    </header>
  )
}
