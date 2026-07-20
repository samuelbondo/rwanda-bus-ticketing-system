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

export default function Sidebar({ items, title, mobileOpen = false, onMobileClose }: SidebarProps) {
  return (
    <>
      {/*
        Mobile sidebar — always in the DOM, slides in/out via translate.
        Width is w-56. When closed: -translate-x-full (hidden left).
        When open: translate-x-0 (visible, pushes main content).
        The parent layout uses overflow-hidden so the hidden sidebar doesn't cause scroll.
      */}
      <aside
        className={clsx(
          'flex h-full w-56 shrink-0 flex-col border-r border-gray-200 bg-white transition-transform duration-300 dark:border-gray-700 dark:bg-gray-900 md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          // On mobile: absolute so it doesn't take space when hidden; on md+: relative (normal flow)
          'absolute inset-y-0 left-0 z-40 md:relative md:z-auto'
        )}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">{title}</p>
          <button
            onClick={onMobileClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavLinks items={items} onClose={onMobileClose} />
        </div>
      </aside>

      {/* Backdrop — only on mobile when open, does NOT cover the sidebar */}
      {mobileOpen && (
        <div
          className="absolute inset-0 z-30 bg-black/40 md:hidden"
          onClick={onMobileClose}
        />
      )}
    </>
  )
}
