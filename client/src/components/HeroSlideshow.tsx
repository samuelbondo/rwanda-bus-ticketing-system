import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { slideshowService } from '@/services/slideshowService'
import type { HeroSlide } from '@/types'

export default function HeroSlideshow() {
  const { data } = useQuery({
    queryKey: ['slideshow-public'],
    queryFn: slideshowService.getPublic,
    staleTime: 60_000,
  })

  const slides: HeroSlide[] = data?.slides ?? []
  const interval = data?.config?.interval ?? 5000
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (slides.length < 2) return
    const t = setInterval(() => setCurrent((c) => (c + 1) % slides.length), interval)
    return () => clearInterval(t)
  }, [slides.length, interval])

  if (!slides.length) return null

  return (
    <div className="absolute inset-0 overflow-hidden">
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${i === current ? 'opacity-40' : 'opacity-0'}`}
        >
          {slide.imageUrl && (
            <img
              src={slide.imageUrl}
              alt={slide.title}
              className="h-full w-full object-contain object-center"
            />
          )}
        </div>
      ))}

      {/* Slide label overlay */}
      {slides[current] && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 pointer-events-none">
          <p className="text-xs font-semibold text-white/80 drop-shadow">{slides[current].title}</p>
          {slides[current].subtitle && (
            <p className="text-xs text-white/60 drop-shadow">{slides[current].subtitle}</p>
          )}
          {/* Dots */}
          <div className="mt-1 flex gap-1.5">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
