import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Save, Globe, Phone, Bot, Wrench, Share2, Eye, EyeOff } from 'lucide-react'
import { settingsService, type FullSettings } from '@/services/settingsService'

const schema = z.object({
  siteName:           z.string().min(1),
  supportPhone:       z.string(),
  supportEmail:       z.string().email(),
  supportAddress:     z.string(),
  whatsappNumber:     z.string(),
  whatsappMessage:    z.string(),
  whatsappEnabled:    z.boolean(),
  maintenanceMode:    z.boolean(),
  maintenanceMessage: z.string(),
  geminiApiKey:       z.string(),
  aiModel:            z.string(),
  aiEnabled:          z.boolean(),
  aiWelcomeMessage:   z.string(),
  facebookUrl:        z.string(),
  twitterUrl:         z.string(),
  instagramUrl:       z.string(),
})

type FormData = z.infer<typeof schema>

function Section({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-5 flex items-center gap-2 text-gray-900 dark:text-white">
        <Icon className="h-5 w-5 text-primary-600" />
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

const inputCls = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showKey, setShowKey] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    settingsService.get()
      .then((s: FullSettings) => { reset(s); setLoading(false) })
      .catch(() => { toast.error('Failed to load settings'); setLoading(false) })
  }, [reset])

  async function onSubmit(data: FormData) {
    setSaving(true)
    try {
      await settingsService.update(data)
      toast.success('Settings saved successfully')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Platform Settings</h1>
          <p className="text-sm text-gray-500">Manage site-wide configuration</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>

      <Section icon={Globe} title="General">
        <Field label="Site Name" error={errors.siteName?.message}>
          <input {...register('siteName')} className={inputCls} />
        </Field>
        <Field label="Support Phone" error={errors.supportPhone?.message}>
          <input {...register('supportPhone')} className={inputCls} />
        </Field>
        <Field label="Support Email" error={errors.supportEmail?.message}>
          <input {...register('supportEmail')} className={inputCls} />
        </Field>
        <Field label="Support Address" error={errors.supportAddress?.message}>
          <input {...register('supportAddress')} className={inputCls} />
        </Field>
      </Section>

      <Section icon={Phone} title="WhatsApp">
        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-center gap-3">
            <input type="checkbox" {...register('whatsappEnabled')} className="h-4 w-4 rounded border-gray-300 text-primary-600" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Show WhatsApp button on the site</span>
          </label>
        </div>
        <Field label="WhatsApp Number" error={errors.whatsappNumber?.message}>
          <input {...register('whatsappNumber')} placeholder="+250794047261" className={inputCls} />
        </Field>
        <Field label="Pre-filled Message" error={errors.whatsappMessage?.message}>
          <input {...register('whatsappMessage')} className={inputCls} />
        </Field>
      </Section>

      <Section icon={Wrench} title="Maintenance Mode">
        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-center gap-3">
            <input type="checkbox" {...register('maintenanceMode')} className="h-4 w-4 rounded border-gray-300 text-primary-600" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Enable maintenance mode (shows banner to all non-admin users)</span>
          </label>
        </div>
        <div className="sm:col-span-2">
          <Field label="Maintenance Message" error={errors.maintenanceMessage?.message}>
            <input {...register('maintenanceMessage')} className={inputCls} />
          </Field>
        </div>
      </Section>

      <Section icon={Bot} title="AI Chat Assistant">
        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-center gap-3">
            <input type="checkbox" {...register('aiEnabled')} className="h-4 w-4 rounded border-gray-300 text-primary-600" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Enable AI chat assistant</span>
          </label>
        </div>
        <Field label="Gemini API Key" error={errors.geminiApiKey?.message}>
          <div className="relative">
            <input {...register('geminiApiKey')} type={showKey ? 'text' : 'password'} placeholder="AQ.Ab8RN6..." className={`${inputCls} pr-10`} />
            <button type="button" onClick={() => setShowKey((v) => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>
        <Field label="AI Model" error={errors.aiModel?.message}>
          <input {...register('aiModel')} placeholder="gemini-1.5-flash" className={inputCls} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Welcome Message" error={errors.aiWelcomeMessage?.message}>
            <input {...register('aiWelcomeMessage')} className={inputCls} />
          </Field>
        </div>
      </Section>

      <Section icon={Share2} title="Social Links">
        <Field label="Facebook URL" error={errors.facebookUrl?.message}>
          <input {...register('facebookUrl')} placeholder="https://facebook.com/..." className={inputCls} />
        </Field>
        <Field label="Twitter / X URL" error={errors.twitterUrl?.message}>
          <input {...register('twitterUrl')} placeholder="https://twitter.com/..." className={inputCls} />
        </Field>
        <Field label="Instagram URL" error={errors.instagramUrl?.message}>
          <input {...register('instagramUrl')} placeholder="https://instagram.com/..." className={inputCls} />
        </Field>
      </Section>
    </form>
  )
}
