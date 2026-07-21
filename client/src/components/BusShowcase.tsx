import { useQuery } from '@tanstack/react-query'
import { Bus as BusIcon, Hash, Users } from 'lucide-react'
import { busService } from '@/services/busService'
import { Skeleton } from '@/components/ui'
import type { Bus } from '@/types'

export default function BusShowcase() {
  const { data: buses = [], isLoading } = useQuery({
    queryKey: ['buses-public'],
    queryFn: busService.getAll,
    staleTime: 5 * 60_000,
  })

  const active = buses.filter((b: Bus) => b.isActive)

  return (
    <section className="bg-gray-50 dark:bg-gray-950 py-10 sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-6 text-center">
          <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">Our Fleet</h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">The buses you'll actually board</p>
        </div>

        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-52 w-full rounded-2xl" />)}
          </div>
        )}

        {!isLoading && active.length === 0 && (
          <p className="text-center text-sm text-gray-400">No buses available at the moment.</p>
        )}

        {!isLoading && active.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((bus: Bus) => (
              <div
                key={bus.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
              >
                {/* Image */}
                <div className="relative h-40 w-full bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-700 dark:to-gray-600">
                  {bus.imageUrl ? (
                    <img
                      src={bus.imageUrl}
                      alt={bus.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <BusIcon className="h-16 w-16 text-primary-200 dark:text-gray-500" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{bus.name}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Hash className="h-3.5 w-3.5 shrink-0" />
                      {bus.plateNumber}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      {bus.capacity} seats
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
