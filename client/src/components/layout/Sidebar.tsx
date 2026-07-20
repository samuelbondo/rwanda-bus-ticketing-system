import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import { LucideIcon } from 'lucide-react'

interface NavItem {
  label: string
  to: string
  icon: LucideIcon
}

interface SidebarProps {
  items: NavItem[]
  title: string
}

export default function Sidebar({ items, title }: SidebarProps) {
  return (
    <aside className="hidden w-56 shrink-0 md:block">
      <div className="sticky top-20 rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
        {/* Sidebar header */}
        <div className="border-b border-gray-100 dark:border-gray-700 px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">{title}</p>
        </div>
        {/* Nav links */}
        <nav className="flex flex-col gap-0.5 p-2">
          {items.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
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
      </div>
    </aside>
  )
}
