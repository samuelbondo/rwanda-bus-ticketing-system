import { NavLink, Link, useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import { X, LogOut } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface NavItem {
  label: string
  to: string
  icon: LucideIcon
}

interface SidebarProps {
  items: NavItem[]
  title: string
  mobileOpen?: boolean
  onMobileClose?: () => void
}

function NavLinks({ items, onClose }: { items: NavItem[]; onClose?: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5 p-2">
      {items.map(({ label, to, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end
          onClick={onClose}
          className={({ isActive }) =>
            clsx(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
            )
          }
        >
          <Icon className="h-4 w-4 shrink-0" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

function UserFooter({ onClose }: { onClose?: () => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  const profilePath =
    user.role === 'ADMIN' ? '/admin/profile'
    : user.role === 'AGENT' ? '/agent/profile'
    : '/profile'

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <div className="border-t border-gray-100 p-3 dark:border-gray-700">
      <Link
        to={profilePath}
        onClick={onClose}
        className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full">
          {user.avatarUrl
            ? <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
            : <div className="flex h-full w-full items-center justify-center bg-primary-600 text-sm font-bold text-white">{user.name.charAt(0).toUpperCase()}</div>
          }
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
          <p className="truncate text-xs text-gray-400">{user.email}</p>
        </div>
      </Link>
      <button
        onClick={handleLogout}
        className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </div>
  )
}

export default function Sidebar({ items, title, mobileOpen = false, onMobileClose }: SidebarProps) {
  return (
    <>
      <aside
        className={clsx(
          'flex h-full w-56 shrink-0 flex-col border-r border-border bg-card transition-transform duration-300 md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'absolute inset-y-0 left-0 z-40 md:relative md:z-auto'
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">{title}</p>
          <button
            onClick={onMobileClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-muted md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <NavLinks items={items} onClose={onMobileClose} />
        </div>

        <UserFooter onClose={onMobileClose} />
      </aside>

      {mobileOpen && (
        <div
          className="absolute inset-0 z-30 bg-black/40 md:hidden"
          onClick={onMobileClose}
        />
      )}
    </>
  )
}
