import type { Seat } from '@/types'

interface SeatMapProps {
  seats: Seat[]
  selectedSeat: Seat | null
  onSelect: (seat: Seat | null) => void
}

export default function SeatMap({ seats, selectedSeat, onSelect }: SeatMapProps) {
  return (
    <>
      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-green-100 border border-green-300" />Available
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-primary-600" />Selected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded bg-gray-200 dark:bg-gray-700" />Taken
        </span>
      </div>

      {/* Front indicator */}
      <div className="mb-3 flex items-center gap-2 text-xs text-gray-400">
        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
        <span>FRONT</span>
        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
      </div>

      <div className="grid grid-cols-5 gap-2">
        {seats.map((seat) => {
          const isSelected = selectedSeat?.id === seat.id
          const isTaken = !seat.isAvailable
          return (
            <button
              key={seat.id}
              disabled={isTaken}
              onClick={() => onSelect(isSelected ? null : seat)}
              className={[
                'rounded-lg border py-2.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-primary-500',
                isTaken
                  ? 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-500'
                  : isSelected
                  ? 'border-primary-600 bg-primary-600 text-white shadow-md'
                  : 'border-green-300 bg-green-50 text-green-700 hover:border-primary-400 hover:bg-primary-50 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400',
              ].join(' ')}
            >
              {seat.seatNumber}
            </button>
          )
        })}
      </div>
    </>
  )
}
