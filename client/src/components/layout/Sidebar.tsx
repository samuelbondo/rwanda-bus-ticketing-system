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
      <div className="sticky top-20">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">{title}</p>
        <nav className="flex flex-col gap-1">
          {items.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  )
}
