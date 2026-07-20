import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Bus, MailCheck } from 'lucide-react'
import { toast } from 'sonner'
import { authService } from '@/services/authService'
import { Button, Input, Card, CardBody } from '@/components/ui'

const schema = z.object({ email: z.string().email('Enter a valid email') })
type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    try {
      await authService.forgotPassword(data.email)
      setSent(true)
    } catch {
      toast.error('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardBody className="space-y-6">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600">
              {sent ? <MailCheck className="h-6 w-6 text-white" /> : <Bus className="h-6 w-6 text-white" />}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {sent ? 'Check your email' : 'Forgot password?'}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {sent
                ? 'If that email is registered, a reset link has been sent. Check your inbox (and spam folder).'
                : "Enter your account email and we'll send you a reset link."}
            </p>
          </div>

          {!sent && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register('email')}
              />
              <Button type="submit" className="w-full" loading={isSubmitting}>
                Send Reset Link
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            <Link to="/login" className="font-medium text-primary-600 hover:underline">
              Back to sign in
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  )
}
