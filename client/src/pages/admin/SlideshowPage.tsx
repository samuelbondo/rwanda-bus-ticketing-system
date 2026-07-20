import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Trash2, X, Images } from 'lucide-react'
import { slideshowService } from '@/services/slideshowService'
import { Button, Input, Card, CardBody, CardHeader, Badge, Skeleton } from '@/components/ui'
import ImageUpload from '@/components/ui/ImageUpload'
import type { HeroSlide, SlideshowSource } from '@/types'

const slideSchema = z.object({
  title: z.string().min(1, 'Title required'),
  subtitle: z.string().optional(),
  imageUrl: z.string().url('Valid image URL required'),
  sortOrder: z.coerce.number().int().optional(),
})
type SlideForm = z.infer<typeof slideSchema>

const SOURCES: { value: SlideshowSource; label: string; desc: string }[] = [
  { value: 'CUSTOM', label: 'Custom Slides', desc: 'Use manually added slides below' },
  { value: 'BUSES', label: 'Bus Images', desc: 'Auto-use first 5 active buses with photos' },
  { value: 'ROUTES', label: 'Route Cards', desc: 'Auto-use first 5 active routes' },
]

function AddSlideForm({ onDone }: { onDone: () => void }) {
  const qc = useQueryClient()
  const { register, handleSubmit, control, formState: { errors } } = useForm<SlideForm>({
    resolver: zodResolver(slideSchema),
    defaultValues: { sortOrder: 0 },
  })
  const mutation = useMutation({
    mutationFn: slideshowService.createSlide,
    onSuccess: () => { toast.success('Slide added'); qc.invalidateQueries({ queryKey: ['slideshow-slides'] }); onDone() },
    onError: () => toast.error('Failed to add slide'),
  })
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <p className="font-semibold text-gray-900 dark:text-white">Add Slide</p>
        <button onClick={onDone} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Title" placeholder="Nyanza → Kigali" error={errors.title?.message} {...register('title')} />
            <Input label="Subtitle (optional)" placeholder="From RWF 2,000" {...register('subtitle')} />
            <Input label="Sort Order" type="number" placeholder="0" {...register('sortOrder')} />
          </div>
          <Controller
            name="imageUrl"
            control={control}
            render={({ field }) => (
              <ImageUpload
                label="Slide Image"
                folder="slideshow"
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
          {errors.imageUrl && <p className="text-xs text-red-500">{errors.imageUrl.message}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onDone}>Cancel</Button>
            <Button type="submit" loading={mutation.isPending}>Add Slide</Button>
          </div>
        </form>
      </CardBody>
    </Card>
  )
}

export default function SlideshowPage() {
  const qc = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)

  const { data: config, isLoading: loadingConfig } = useQuery({
    queryKey: ['slideshow-config'],
    queryFn: slideshowService.getConfig,
  })

  const { data: slides = [], isLoading: loadingSlides } = useQuery({
    queryKey: ['slideshow-slides'],
    queryFn: slideshowService.getSlides,
  })

  const configMutation = useMutation({
    mutationFn: slideshowService.updateConfig,
    onSuccess: () => { toast.success('Settings saved'); qc.invalidateQueries({ queryKey: ['slideshow-config'] }) },
    onError: () => toast.error('Failed to save settings'),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      slideshowService.updateSlide(id, { isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['slideshow-slides'] }),
    onError: () => toast.error('Failed to update slide'),
  })

  const deleteMutation = useMutation({
    mutationFn: slideshowService.deleteSlide,
    onSuccess: () => { toast.success('Slide deleted'); qc.invalidateQueries({ queryKey: ['slideshow-slides'] }) },
    onError: () => toast.error('Failed to delete slide'),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Homepage Slideshow</h1>
          <p className="text-sm text-gray-500 mt-0.5">Control the hero background slideshow</p>
        </div>
      </div>

      {/* Source & Interval Config */}
      <Card>
        <CardHeader><p className="font-semibold text-gray-900 dark:text-white">Slideshow Settings</p></CardHeader>
        <CardBody className="space-y-4">
          {loadingConfig ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Image Source</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {SOURCES.map(({ value, label, desc }) => (
                    <button
                      key={value}
                      onClick={() => configMutation.mutate({ source: value })}
                      className={`rounded-xl border p-4 text-left transition ${
                        config?.source === value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                      }`}
                    >
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
                      <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-48">
                  <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                    Slide Interval (ms)
                  </label>
                  <input
                    type="number"
                    min={1000}
                    max={30000}
                    step={500}
                    defaultValue={config?.interval ?? 5000}
                    onBlur={(e) => configMutation.mutate({ interval: Number(e.target.value) })}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <p className="mt-5 text-xs text-gray-400">e.g. 5000 = 5 seconds per slide</p>
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* Custom Slides — only relevant when source = CUSTOM */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Custom Slides</p>
            <p className="text-xs text-gray-500 mt-0.5">Used when source is set to "Custom Slides"</p>
          </div>
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="mr-1.5 h-4 w-4" />Add Slide
          </Button>
        </CardHeader>
        <CardBody className="space-y-4">
          {showAdd && <AddSlideForm onDone={() => setShowAdd(false)} />}

          {loadingSlides ? (
            <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : (slides as HeroSlide[]).length === 0 ? (
            <div className="py-10 text-center">
              <Images className="mx-auto mb-3 h-8 w-8 text-gray-300" />
              <p className="text-sm text-gray-400">No custom slides yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {['Image', 'Title', 'Subtitle', 'Order', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {(slides as HeroSlide[]).map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <img src={s.imageUrl} alt={s.title} className="h-10 w-16 rounded-lg object-cover" />
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{s.title}</td>
                      <td className="px-4 py-3 text-gray-500">{s.subtitle ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{s.sortOrder}</td>
                      <td className="px-4 py-3">
                        <Badge variant={s.isActive ? 'success' : 'danger'}>{s.isActive ? 'Active' : 'Hidden'}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant={s.isActive ? 'secondary' : 'secondary'}
                            onClick={() => toggleMutation.mutate({ id: s.id, isActive: !s.isActive })}
                          >
                            {s.isActive ? 'Hide' : 'Show'}
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => deleteMutation.mutate(s.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
