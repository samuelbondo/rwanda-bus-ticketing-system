import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Bus, Eye, EyeOff } from 'lucide-react'
import { authService } from '@/services/authService'
import { Button, Input, Card, CardBody } from '@/components/ui'

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  if (!token) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardBody className="space-y-4 py-10">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">Invalid reset link</p>
            <p className="text-sm text-gray-500">This link is missing a token. Please request a new one.</p>
            <Link to="/login" className="inline-block text-sm font-medium text-primary-600 hover:underline">Back to Login</Link>
          </CardBody>
        </Card>
      </div>
    )
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    if (password !== confirm) { toast.error('Passwords do not match'); return }
    setLoading(true)
    try {
      await authService.resetPassword(token, password)
      setDone(true)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg ?? 'Reset link is invalid or has expired')
    } finally {
      setLoading(false)
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {done ? 'Password Reset!' : 'Set New Password'}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {done ? 'Your password has been updated.' : 'Choose a strong password for your account.'}
            </p>
          </div>

          {done ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-3xl">✅</div>
              <p className="text-sm text-gray-500">You can now sign in with your new password.</p>
              <Button className="w-full" onClick={() => navigate('/login')}>Go to Login</Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="relative">
                <Input
                  label="New password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Input
                label="Confirm password"
                type={showPw ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" loading={loading}>Reset Password</Button>
              <p className="text-center text-xs text-gray-400">
                <Link to="/login" className="hover:text-primary-600 hover:underline">Back to Login</Link>
              </p>
            </form>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
