import { NavLink } from 'react-router-dom'
import { clsx } from 'clsx'
import { X } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

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

function SidebarContent({ title, items, onClose }: { title: string; items: NavItem[]; onClose?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">{title}</p>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        <NavLinks items={items} onClose={onClose} />
      </div>
    </div>
  )
}

export default function Sidebar({ items, title, mobileOpen = false, onMobileClose }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar — always visible, fixed left column */}
      <aside className="hidden w-56 shrink-0 border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 md:block">
        <div className="sticky top-0 h-full">
          <SidebarContent title={title} items={items} />
        </div>
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 shadow-2xl">
            <SidebarContent title={title} items={items} onClose={onMobileClose} />
          </aside>
        </div>
      )}
    </>
  )
}
