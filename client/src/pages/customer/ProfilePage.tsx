import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { User, Mail, Phone, Shield, Calendar } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/services/authService'
import { Button, Input, Card, CardBody, CardHeader, Badge } from '@/components/ui'
import ImageUpload from '@/components/ui/ImageUpload'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Minimum 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type ProfileData = z.infer<typeof profileSchema>
type PasswordData = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '')

  const profileForm = useForm<ProfileData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', phone: user?.phone ?? '' },
  })

  const passwordForm = useForm<PasswordData>({
    resolver: zodResolver(passwordSchema),
  })

  const newPassword = passwordForm.watch('newPassword') ?? ''

  const passwordStrength = useMemo(() => {
    if (!newPassword) return 0
    let score = 0
    if (newPassword.length >= 8) score++
    if (/[A-Z]/.test(newPassword)) score++
    if (/[0-9]/.test(newPassword)) score++
    if (/[^A-Za-z0-9]/.test(newPassword)) score++
    return score
  }, [newPassword])

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength]
  const strengthColor = ['', 'bg-red-500', 'bg-yellow-400', 'bg-blue-500', 'bg-green-500'][passwordStrength]
  const strengthText = ['', 'text-red-500', 'text-yellow-500', 'text-blue-500', 'text-green-500'][passwordStrength]

  async function onProfileSubmit(data: ProfileData) {
    try {
      const updated = await authService.updateProfile({ ...data, avatarUrl: avatarUrl || undefined })
      updateUser(updated)
      toast.success('Profile updated')
    } catch {
      toast.error('Failed to update profile')
    }
  }

  async function onPasswordSubmit(data: PasswordData) {
    try {
      await authService.changePassword(data.currentPassword, data.newPassword)
      toast.success('Password changed')
      passwordForm.reset()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to change password'
      toast.error(msg)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">

      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Manage your account information and security</p>
      </div>

      {/* Account overview */}
      <Card>
        <CardBody>
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={user?.name} className="h-16 w-16 rounded-2xl object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-600 text-2xl font-bold text-white">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{user?.name}</p>
                <Badge variant="success">Customer</Badge>
                <Badge variant={user?.isActive ? 'success' : 'danger'}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="mt-0.5 text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 border-t border-gray-100 dark:border-gray-700 pt-5">
            <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400">
              <Mail className="h-4 w-4 shrink-0 text-gray-400" />{user?.email}
            </div>
            <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400">
              <Phone className="h-4 w-4 shrink-0 text-gray-400" />{user?.phone || 'No phone added'}
            </div>
            <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400">
              <Shield className="h-4 w-4 shrink-0 text-gray-400" />Customer account
            </div>
            <div className="flex items-center gap-2.5 text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
              Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-RW', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Edit profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <p className="font-semibold text-gray-900 dark:text-white">Personal Information</p>
          </div>
        </CardHeader>
        <CardBody>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Full name"
                error={profileForm.formState.errors.name?.message}
                {...profileForm.register('name')}
              />
              <Input
                label="Email address"
                value={user?.email ?? ''}
                disabled
                className="cursor-not-allowed opacity-60"
              />
            </div>
            <Input
              label="Phone number"
              type="tel"
              placeholder="+250 7XX XXX XXX"
              {...profileForm.register('phone')}
            />
            <ImageUpload
              label="Profile Photo"
              folder="avatars"
              shape="circle"
              value={avatarUrl}
              onChange={(url) => setAvatarUrl(url)}
            />
            <div className="flex justify-end">
              <Button type="submit" loading={profileForm.formState.isSubmitting}>
                Save changes
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-gray-400" />
            <p className="font-semibold text-gray-900 dark:text-white">Change Password</p>
          </div>
        </CardHeader>
        <CardBody>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
            <Input
              label="Current password"
              type="password"
              placeholder="••••••••"
              error={passwordForm.formState.errors.currentPassword?.message}
              {...passwordForm.register('currentPassword')}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Input
                  label="New password"
                  type="password"
                  placeholder="Min. 8 characters"
                  error={passwordForm.formState.errors.newPassword?.message}
                  {...passwordForm.register('newPassword')}
                />
                {newPassword.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            i <= passwordStrength ? strengthColor : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${strengthText}`}>{strengthLabel}</p>
                  </div>
                )}
              </div>
              <Input
                label="Confirm new password"
                type="password"
                placeholder="Re-enter new password"
                error={passwordForm.formState.errors.confirmPassword?.message}
                {...passwordForm.register('confirmPassword')}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" loading={passwordForm.formState.isSubmitting}>
                Update password
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

    </div>
  )
}
