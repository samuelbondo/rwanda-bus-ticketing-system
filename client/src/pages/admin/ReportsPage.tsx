import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid,
} from 'recharts'
import { reportService } from '@/services/adminService'
import { Card, CardBody, CardHeader, Skeleton, Button } from '@/components/ui'
import {
  TrendingUp, Users, DollarSign, XCircle, Download, FileText,
  Calendar, BarChart2, MapPin, Eye, X,
} from 'lucide-react'
import { toast } from 'sonner'

const PERIODS = [
  { value: 'daily',   label: 'Today' },
  { value: 'weekly',  label: 'This Week' },
  { value: 'monthly', label: 'This Month' },
  { value: 'yearly',  label: 'This Year' },
  { value: 'custom',  label: 'Custom Range' },
]

const MODULES = [
  { value: 'analytics', label: 'Analytics',       icon: BarChart2  },
  { value: 'bookings',  label: 'Bookings Report',  icon: FileText   },
  { value: 'users',     label: 'Users Report',     icon: Users      },
  { value: 'revenue',   label: 'Revenue Report',   icon: DollarSign },
]

type ModuleType = 'analytics' | 'bookings' | 'users' | 'revenue'
type ModuleRow = Record<string, string | number>

const MODULE_HEADERS: Record<string, string[]> = {
  bookings: ['ticket', 'passenger', 'email', 'route', 'from', 'to', 'seat', 'departure', 'bookedAt', 'status', 'price'],
  users:    ['name', 'email', 'role', 'phone', 'status', 'bookings', 'joinedAt'],
  revenue:  ['ticket', 'passenger', 'route', 'amount', 'method', 'status', 'reference', 'paidAt'],
}

function PeriodBar({
  period, setPeriod, from, setFrom, to, setTo, data,
}: {
  period: string
  setPeriod: (v: string) => void
  from: string
  setFrom: (v: string) => void
  to: string
  setTo: (v: string) => void
  data?: { from: string; to: string }
}) {
  return (
    <Card>
      <CardBody className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">Period</label>
          <div className="flex flex-wrap gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-900">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  period === p.value
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        {period === 'custom' && (
          <div className="flex items-end gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                <Calendar className="mr-1 inline h-3 w-3" />From
              </label>
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">To</label>
              <input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white" />
            </div>
          </div>
        )}
        {data && (
          <p className="ml-auto text-xs text-gray-400">
            {new Date(data.from).toLocaleDateString()} – {new Date(data.to).toLocaleDateString()}
          </p>
        )}
      </CardBody>
    </Card>
  )
}

function PreviewModal({
  title, headers, rows, onClose, onDownload, downloading,
}: {
  title: string
  headers: string[]
  rows: ModuleRow[]
  onClose: () => void
  onDownload: (fmt: 'pdf' | 'csv') => void
  downloading: 'pdf' | 'csv' | null
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-6xl flex-col rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">{title}</h2>
            <p className="text-xs text-gray-500">{rows.length} records</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => onDownload('csv')} loading={downloading === 'csv'} disabled={!!downloading}>
              <Download className="mr-1.5 h-3.5 w-3.5" />CSV
            </Button>
            <Button size="sm" onClick={() => onDownload('pdf')} loading={downloading === 'pdf'} disabled={!!downloading}>
              <FileText className="mr-1.5 h-3.5 w-3.5" />PDF
            </Button>
            <button onClick={onClose} className="ml-2 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
          {rows.length === 0 ? (
            <p className="py-16 text-center text-sm text-gray-400">No data for this period.</p>
          ) : (
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800">
                <tr>
                  {headers.map((h) => (
                    <th key={h} className="px-4 py-2.5 text-left font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {rows.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    {headers.map((h) => (
                      <td key={h} className="px-4 py-2 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {h === 'price' || h === 'amount'
                          ? `RWF ${Number(row[h]).toLocaleString()}`
                          : String(row[h] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color, loading }: {
  label: string; value: string; icon: React.ElementType; color: string; loading: boolean
}) {
  return (
    <Card>
      <CardBody className="flex items-center gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="min-w-0">
          {loading ? (
            <><Skeleton className="mb-1 h-7 w-24" /><Skeleton className="h-4 w-32" /></>
          ) : (
            <><p className="truncate text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p></>
          )}
        </div>
      </CardBody>
    </Card>
  )
}

export default function ReportsPage() {
  const [period, setPeriod]   = useState('monthly')
  const [from, setFrom]       = useState('')
  const [to, setTo]           = useState('')
  const [module, setModule]   = useState<ModuleType>('analytics')
  const [preview, setPreview] = useState<{ rows: ModuleRow[]; headers: string[]; title: string } | null>(null)
  const [exporting, setExporting] = useState<'pdf' | 'csv' | null>(null)
  const [downloading, setDownloading] = useState<'pdf' | 'csv' | null>(null)

  const isCustom   = period === 'custom'
  const queryFrom  = isCustom ? from : undefined
  const queryTo    = isCustom ? to   : undefined
  const enabled    = !isCustom || (!!from && !!to)

  // Analytics data
  const { data, isLoading } = useQuery({
    queryKey: ['reports', period, queryFrom, queryTo],
    queryFn: () => reportService.get(period, queryFrom, queryTo),
    enabled: enabled && module === 'analytics',
  })

  async function handleAnalyticsExport(format: 'pdf' | 'csv') {
    if (isCustom && (!from || !to)) { toast.error('Select both dates first.'); return }
    setExporting(format)
    try {
      const blob = await reportService.export(period, format, queryFrom, queryTo)
      triggerDownload(blob, `report-${period}.${format}`)
      toast.success(`Exported as ${format.toUpperCase()}`)
    } catch { toast.error('Export failed.') }
    finally { setExporting(null) }
  }

  async function handlePreview() {
    if (isCustom && (!from || !to)) { toast.error('Select both dates first.'); return }
    if (module === 'analytics') return
    try {
      const rows = await reportService.getModule(module as 'bookings' | 'users' | 'revenue', period, queryFrom, queryTo)
      const mod = MODULES.find((m) => m.value === module)!
      setPreview({ rows, headers: MODULE_HEADERS[module], title: `${mod.label} — ${period}` })
    } catch { toast.error('Failed to load preview.') }
  }

  async function handleModuleDownload(fmt: 'pdf' | 'csv') {
    if (!preview) return
    setDownloading(fmt)
    try {
      const blob = await reportService.exportModule(module as 'bookings' | 'users' | 'revenue', period, fmt, queryFrom, queryTo)
      triggerDownload(blob, `${module}-report-${period}.${fmt}`)
      toast.success(`Downloaded as ${fmt.toUpperCase()}`)
    } catch { toast.error('Download failed.') }
    finally { setDownloading(null) }
  }

  function triggerDownload(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }

  const stats = [
    { label: 'Total Bookings',    value: data ? String(data.totalBookings) : '—',                              icon: Users,     color: 'bg-blue-600'   },
    { label: 'Total Revenue',     value: data ? `RWF ${Number(data.totalRevenue).toLocaleString()}` : '—',     icon: DollarSign, color: 'bg-emerald-600' },
    { label: 'Cancellation Rate', value: data ? `${Number(data.cancellationRate).toFixed(1)}%` : '—',          icon: XCircle,   color: 'bg-red-500'    },
    { label: 'Seat Occupancy',    value: data ? `${Number(data.seatOccupancy).toFixed(1)}%` : '—',             icon: TrendingUp, color: 'bg-violet-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
        </div>
        {module === 'analytics' ? (
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => handleAnalyticsExport('csv')} loading={exporting === 'csv'} disabled={!!exporting}>
              <Download className="mr-1.5 h-4 w-4" />CSV
            </Button>
            <Button size="sm" onClick={() => handleAnalyticsExport('pdf')} loading={exporting === 'pdf'} disabled={!!exporting}>
              <FileText className="mr-1.5 h-4 w-4" />PDF
            </Button>
          </div>
        ) : (
          <Button size="sm" onClick={handlePreview}>
            <Eye className="mr-1.5 h-4 w-4" />Preview & Download
          </Button>
        )}
      </div>

      {/* Module tabs */}
      <div className="flex flex-wrap gap-2">
        {MODULES.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setModule(value as ModuleType)}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${
              module === value
                ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
      </div>

      {/* Period filter */}
      <PeriodBar period={period} setPeriod={setPeriod} from={from} setFrom={setFrom} to={to} setTo={setTo} data={data} />

      {/* Analytics content */}
      {module === 'analytics' && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((s) => <StatCard key={s.label} {...s} loading={isLoading} />)}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><p className="font-semibold text-gray-900 dark:text-white">Bookings Over Time</p></CardHeader>
              <CardBody>
                {isLoading ? <Skeleton className="h-56 w-full" /> : data?.bookingsPerDay?.length ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.bookingsPerDay} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                      <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                      <Tooltip formatter={(v: number) => [v, 'Bookings']} labelFormatter={(l) => `Date: ${l}`} />
                      <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <p className="py-10 text-center text-sm text-gray-400">No data for this period</p>}
              </CardBody>
            </Card>

            <Card>
              <CardHeader><p className="font-semibold text-gray-900 dark:text-white">Revenue Over Time (RWF)</p></CardHeader>
              <CardBody>
                {isLoading ? <Skeleton className="h-56 w-full" /> : data?.bookingsPerDay?.length ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={data.bookingsPerDay} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: number) => [`RWF ${Number(v).toLocaleString()}`, 'Revenue']} labelFormatter={(l) => `Date: ${l}`} />
                      <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#revenueGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <p className="py-10 text-center text-sm text-gray-400">No data for this period</p>}
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              <p className="font-semibold text-gray-900 dark:text-white">Top Routes</p>
            </CardHeader>
            <CardBody className="p-0">
              {isLoading ? (
                <div className="space-y-2 p-6">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
              ) : data?.popularRoutes?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                        {['#', 'Route', 'Origin', 'Destination', 'Bookings', 'Share'].map((h) => (
                          <th key={h} className="px-6 py-3 text-left font-medium text-gray-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.popularRoutes.map((r, i) => {
                        const share = data.totalBookings > 0 ? ((r.count / data.totalBookings) * 100).toFixed(1) : '0.0'
                        return (
                          <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                            <td className="px-6 py-3 text-gray-400">{i + 1}</td>
                            <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">{r.route}</td>
                            <td className="px-6 py-3 text-gray-600 dark:text-gray-300">{r.origin}</td>
                            <td className="px-6 py-3 text-gray-600 dark:text-gray-300">{r.destination}</td>
                            <td className="px-6 py-3 text-right font-semibold text-blue-600">{r.count}</td>
                            <td className="px-6 py-3 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                  <div className="h-full rounded-full bg-blue-600" style={{ width: `${share}%` }} />
                                </div>
                                <span className="w-10 text-xs text-gray-500">{share}%</span>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : <p className="py-10 text-center text-sm text-gray-400">No route data for this period</p>}
            </CardBody>
          </Card>
        </>
      )}

      {/* Non-analytics modules — instruction card */}
      {module !== 'analytics' && (
        <Card>
          <CardBody className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-900/20">
              {(() => { const Icon = MODULES.find((m) => m.value === module)!.icon; return <Icon className="h-7 w-7 text-blue-600" /> })()}
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {MODULES.find((m) => m.value === module)?.label}
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Select a period above, then click <strong>Preview & Download</strong> to see the data before exporting.
            </p>
            <Button className="mt-4" onClick={handlePreview}>
              <Eye className="mr-1.5 h-4 w-4" />Preview Report
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Preview modal */}
      {preview && (
        <PreviewModal
          title={preview.title}
          headers={preview.headers}
          rows={preview.rows}
          onClose={() => setPreview(null)}
          onDownload={handleModuleDownload}
          downloading={downloading}
        />
      )}
    </div>
  )
}
