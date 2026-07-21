import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MapPin, ArrowRight } from 'lucide-react'
import { routeService } from '@/services/routeService'
import { Skeleton } from '@/components/ui'
import type { Route } from '@/types'

export default function RouteJourneyStrip() {
  const navigate = useNavigate()

  const { data: routes = [], isLoading } = useQuery({
    queryKey: ['routes-public'],
    queryFn: routeService.getAll,
    staleTime: 5 * 60_000,
  })

  const active = routes.filter((r: Route) => r.isActive)

  return (
    <section className="bg-white dark:bg-gray-900 py-10 sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-6 text-center">
          <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">Our Routes</h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Journey map with fares at every stop</p>
        </div>

        {isLoading && (
          <div className="space-y-4">
            {[1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
          </div>
        )}

        {!isLoading && active.length === 0 && (
          <p className="text-center text-sm text-gray-400">No active routes available.</p>
        )}

        <div className="space-y-4">
          {active.map((route: Route) => {
            const stops = [...route.stops].sort((a, b) => a.stopOrder - b.stopOrder)
            return (
              <div
                key={route.id}
                className="rounded-2xl border border-gray-200 bg-gray-50 p-4 sm:p-6 dark:border-gray-700 dark:bg-gray-800"
              >
                {/* Route name + price */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{route.name}</span>
                    {route.distanceKm && (
                      <span className="ml-2 text-xs text-gray-400">{Number(route.distanceKm)} km</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      From <span className="font-semibold text-primary-600">RWF {Number(route.basePrice).toLocaleString()}</span>
                    </span>
                    <button
                      onClick={() => navigate(`/search?origin=${route.origin}&destination=${route.destination}`)}
                      className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-700 active:scale-[0.97]"
                    >
                      Book Now <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Stop strip */}
                {stops.length > 0 ? (
                  <div className="flex items-center gap-0 overflow-x-auto pb-1">
                    {stops.map((stop, idx) => (
                      <div key={stop.id} className="flex items-center">
                        <div className="flex flex-col items-center min-w-[80px] sm:min-w-[100px]">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 shadow-md shadow-primary-200 dark:shadow-primary-900/40">
                            <MapPin className="h-3.5 w-3.5 text-white" />
                          </div>
                          <span className="mt-1.5 text-center text-xs font-semibold text-gray-800 dark:text-gray-200 leading-tight">
                            {stop.name}
                          </span>
                          <span className="mt-0.5 text-center text-[10px] text-primary-600 font-medium">
                            {Number(stop.priceFromOrigin) === 0
                              ? 'Origin'
                              : `RWF ${Number(stop.priceFromOrigin).toLocaleString()}`}
                          </span>
                        </div>
                        {idx < stops.length - 1 && (
                          <div className="mx-1 flex-1 flex items-center">
                            <div className="h-0.5 w-6 sm:w-10 bg-primary-200 dark:bg-primary-800" />
                            <ArrowRight className="h-3 w-3 text-primary-400 shrink-0" />
                            <div className="h-0.5 w-6 sm:w-10 bg-primary-200 dark:bg-primary-800" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <MapPin className="h-3.5 w-3.5" />
                    {route.origin}
                    <ArrowRight className="h-3 w-3" />
                    {route.destination}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
