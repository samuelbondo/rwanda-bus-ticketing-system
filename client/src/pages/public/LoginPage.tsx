import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { Bus } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input, Card, CardBody } from '@/components/ui'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Where to go after login — honour scheduleId from Book button
  const state = location.state as { scheduleId?: string; from?: string } | null
  const scheduleId = state?.scheduleId

  if (user) {
    const dest = scheduleId
      ? `/book/${scheduleId}`
      : state?.from ?? (user.role === 'ADMIN' ? '/admin' : user.role === 'AGENT' ? '/agent' : '/dashboard')
    navigate(dest, { replace: true })
    return null
  }

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    try {
      await login(data.email, data.password)
      toast.success('Welcome back!')
      // navigation happens via the user check above on re-render
    } catch {
      toast.error('Invalid email or password')
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardBody className="space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600">
              <Bus className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {scheduleId ? 'Sign in to complete your booking' : 'Sign in to your Rwanda Bus account'}
            </p>
          </div>

          {scheduleId && (
            <div className="rounded-lg bg-primary-50 border border-primary-200 px-4 py-3 text-sm text-primary-700 dark:bg-primary-900/20 dark:border-primary-800 dark:text-primary-300">
              You'll be redirected to complete your booking after signing in.
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <Button type="submit" className="w-full" loading={isSubmitting}>
              Sign in
            </Button>
          </form>

          <div className="space-y-3">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" state={state} className="font-medium text-primary-600 hover:underline">
                Register
              </Link>
            </p>
            <p className="text-center text-xs text-gray-400 dark:text-gray-500">
              <Link to="/forgot-password" className="hover:text-primary-600">Forgot your password?</Link>
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
