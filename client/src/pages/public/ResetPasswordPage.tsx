import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { KeyRound } from 'lucide-react'
import { authService } from '@/services/authService'
import { Button, Input, Card, CardBody } from '@/components/ui'

const schema = z.object({
  password: z.string().min(8, 'At least 8 characters'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] })
type FormData = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    try {
      await authService.resetPassword(token, data.password)
      localStorage.removeItem('token')
      toast.success('Password reset! You can now sign in.')
      navigate('/login')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Reset link is invalid or has expired.')
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <p className="text-sm text-gray-500">Invalid reset link. <Link to="/forgot-password" className="text-primary-600 hover:underline">Request a new one.</Link></p>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardBody className="space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600">
              <KeyRound className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Set new password</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Choose a strong password for your account.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              error={errors.confirm?.message}
              {...register('confirm')}
            />
            <Button type="submit" className="w-full" loading={isSubmitting}>
              Reset Password
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            <Link to="/login" className="font-medium text-primary-600 hover:underline">Back to sign in</Link>
          </p>
        </CardBody>
      </Card>
    </div>
  )
}
