import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { MapPin, ArrowRight, Bus as BusIcon } from 'lucide-react'
import { routeService } from '@/services/routeService'
import { Skeleton } from '@/components/ui'
import type { Route } from '@/types'

export default function RouteCards() {
  const navigate = useNavigate()

  const { data: routes = [], isLoading } = useQuery({
    queryKey: ['routes-public'],
    queryFn: routeService.getAll,
    staleTime: 5 * 60_000,
  })

  const active = (routes as Route[]).filter((r) => r.isActive)

  return (
    <section className="bg-gray-50 dark:bg-gray-950 py-10 sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="mb-6 text-center">
          <h2 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">Our Routes</h2>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Real buses, real fares — click to book</p>
        </div>

        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2].map((i) => <Skeleton key={i} className="h-72 w-full rounded-2xl" />)}
          </div>
        )}

        {!isLoading && active.length === 0 && (
          <p className="text-center text-sm text-gray-400">No active routes available.</p>
        )}

        {!isLoading && active.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {active.map((route) => {
              const stops = [...route.stops].sort((a, b) => a.stopOrder - b.stopOrder)
              return (
                <div
                  key={route.id}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-lg dark:border-gray-700 dark:bg-gray-800"
                >
                  {/* Cover image */}
                  <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-primary-100 to-blue-200 dark:from-gray-700 dark:to-gray-600">
                    {route.imageUrl ? (
                      <img
                        src={route.imageUrl}
                        alt={route.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <BusIcon className="h-16 w-16 text-primary-200 dark:text-gray-500" />
                      </div>
                    )}

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    {/* Route label on image */}
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                      <span className="text-sm font-bold text-white drop-shadow">
                        {route.origin} → {route.destination}
                      </span>
                      <span className="rounded-full bg-primary-600 px-2.5 py-0.5 text-xs font-semibold text-white shadow">
                        From RWF {Number(route.basePrice).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-4">
                    {stops.length > 0 ? (
                      <div className="flex items-center overflow-x-auto pb-1">
                        {stops.map((stop, idx) => (
                          <div key={stop.id} className="flex items-center">
                            <div className="flex flex-col items-center min-w-[72px]">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 shadow-sm">
                                <MapPin className="h-3 w-3 text-white" />
                              </div>
                              <span className="mt-1 text-center text-[11px] font-semibold text-gray-800 dark:text-gray-200 leading-tight">
                                {stop.name}
                              </span>
                              <span className="text-center text-[10px] text-primary-600 font-medium">
                                {Number(stop.priceFromOrigin) === 0
                                  ? 'Start'
                                  : `RWF ${Number(stop.priceFromOrigin).toLocaleString()}`}
                              </span>
                            </div>
                            {idx < stops.length - 1 && (
                              <div className="mx-0.5 flex items-center">
                                <div className="h-px w-4 bg-primary-200 dark:bg-primary-800" />
                                <ArrowRight className="h-3 w-3 text-primary-400 shrink-0" />
                                <div className="h-px w-4 bg-primary-200 dark:bg-primary-800" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <MapPin className="h-3.5 w-3.5" />{route.origin}
                        <ArrowRight className="h-3 w-3" />{route.destination}
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      {route.distanceKm && (
                        <span className="text-xs text-gray-400">{Number(route.distanceKm)} km</span>
                      )}
                      <button
                        onClick={() => navigate(`/search?origin=${route.origin}&destination=${route.destination}`)}
                        className="ml-auto flex items-center gap-1.5 rounded-lg border border-primary-600 px-3 py-1.5 text-xs font-semibold text-primary-600 transition hover:bg-primary-50 dark:hover:bg-primary-900/20 active:scale-[0.97]"
                      >
                        View Schedules <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
