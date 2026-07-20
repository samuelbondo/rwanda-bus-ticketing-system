import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { authService } from '@/services/authService'
import { Button, Input, Card, CardBody } from '@/components/ui'

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name ?? '', phone: user?.phone ?? '' },
  })

  async function onSubmit(data: FormData) {
    try {
      const updated = await authService.updateProfile(data)
      updateUser(updated)
      toast.success('Profile updated')
    } catch {
      toast.error('Failed to update profile')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
      <Card className="max-w-md">
        <CardBody>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Full name" error={errors.name?.message} {...register('name')} />
            <Input label="Email" value={user?.email ?? ''} disabled />
            <Input label="Phone" type="tel" {...register('phone')} />
            <Button type="submit" loading={isSubmitting}>Save changes</Button>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
