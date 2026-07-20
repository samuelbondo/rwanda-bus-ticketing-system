import { Bus } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-8 dark:border-gray-700 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-primary-600 font-bold">
            <Bus className="h-5 w-5" />
            Rwanda Bus Ticketing
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Rwanda Bus Ticketing System. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
