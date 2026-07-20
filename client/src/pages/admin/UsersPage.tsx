import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Search, UserPlus, Edit2, KeyRound, X } from 'lucide-react'
import { userService } from '@/services/adminService'
import { uploadService } from '@/services/uploadService'
import { Badge, Button, Card, CardBody, CardHeader, Input, Skeleton } from '@/components/ui'
import type { User } from '@/types'

const roleVariant: Record<string, 'info' | 'success' | 'warning' | 'default'> = {
  ADMIN: 'info', AGENT: 'warning', CUSTOMER: 'success', GUEST: 'default',
}

// ── Shared modal shell ──────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

// ── Avatar helper ───────────────────────────────────────────────────────────
function Avatar({ user, size = 'md' }: { user: User; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'sm' ? 'h-7 w-7 text-xs' : size === 'lg' ? 'h-12 w-12 text-lg' : 'h-9 w-9 text-sm'
  return user.avatarUrl
    ? <img src={user.avatarUrl} alt={user.name} className={`${sizeClass} rounded-full object-cover shrink-0`} />
    : (
      <div className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-primary-100 font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-400`}>
        {user.name.charAt(0).toUpperCase()}
      </div>
    )
}

// ── Create / Edit modal ─────────────────────────────────────────────────────
function UserFormModal({
  initial,
  onClose,
  onSave,
}: {
  initial?: User
  onClose: () => void
  onSave: (data: Partial<User> & { password?: string }) => Promise<void>
}) {
  const isEdit = !!initial
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    email: initial?.email ?? '',
    phone: initial?.phone ?? '',
    role: initial?.role ?? 'CUSTOMER',
    password: '',
    avatarUrl: initial?.avatarUrl ?? '',
  })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  function set(k: string, v: string) { setForm((p) => ({ ...p, [k]: v })) }

  async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadService.uploadImage(file, 'avatars')
      set('avatarUrl', url)
    } catch { toast.error('Avatar upload failed') }
    finally { setUploading(false) }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email) { toast.error('Name and email are required'); return }
    if (!isEdit && form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setSaving(true)
    try {
      const payload: Partial<User> & { password?: string } = {
        name: form.name, email: form.email, phone: form.phone || undefined,
        role: form.role as User['role'], avatarUrl: form.avatarUrl || undefined,
      }
      if (!isEdit) payload.password = form.password
      await onSave(payload)
    } finally { setSaving(false) }
  }

  return (
    <Modal title={isEdit ? 'Edit User' : 'Create User'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0">
            {form.avatarUrl
              ? <img src={form.avatarUrl} alt="avatar" className="h-16 w-16 rounded-full object-cover" />
              : <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                  {form.name.charAt(0).toUpperCase() || '?'}
                </div>
            }
          </div>
          <div>
            <label className="cursor-pointer rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
              {uploading ? 'Uploading…' : 'Upload Photo'}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} disabled={uploading} />
            </label>
            {form.avatarUrl && (
              <button type="button" onClick={() => set('avatarUrl', '')} className="ml-2 text-xs text-red-500 hover:underline">Remove</button>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Full name" value={form.name} onChange={(e) => set('name', e.target.value)} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
          <Input label="Phone" type="tel" placeholder="+250 7XX XXX XXX" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              value={form.role}
              onChange={(e) => set('role', e.target.value)}
            >
              {['CUSTOMER', 'AGENT', 'ADMIN'].map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {!isEdit && (
          <Input label="Password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={(e) => set('password', e.target.value)} required />
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>{isEdit ? 'Save changes' : 'Create user'}</Button>
        </div>
      </form>
    </Modal>
  )
}

// ── Reset password modal ────────────────────────────────────────────────────
function ResetPasswordModal({ user, onClose }: { user: User; onClose: () => void }) {
  const [password, setPassword] = useState('')
  const [sendEmail, setSendEmail] = useState(false)
  const [saving, setSaving] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setSaving(true)
    try {
      if (sendEmail) {
        await userService.sendPasswordReset(user.id, password)
        toast.success('Password reset and email sent to user')
      } else {
        await userService.resetPassword(user.id, password)
        toast.success('Password reset successfully')
      }
      onClose()
    } catch { toast.error('Failed to reset password') }
    finally { setSaving(false) }
  }

  return (
    <Modal title={`Reset Password — ${user.name}`} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Input
          label="New password"
          type="password"
          placeholder="Min. 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            className="rounded border-gray-300"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
          />
          Send new password to user via email
        </label>
        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={saving}>Reset Password</Button>
        </div>
      </form>
    </Modal>
  )
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function UsersPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [createOpen, setCreateOpen] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [resetUser, setResetUser] = useState<User | null>(null)

  const { data: users = [], isLoading } = useQuery({ queryKey: ['users'], queryFn: userService.getAll })

  const createMutation = useMutation({
    mutationFn: (payload: Partial<User> & { password: string }) => userService.create(payload),
    onSuccess: () => { toast.success('User created'); qc.invalidateQueries({ queryKey: ['users'] }); setCreateOpen(false) },
    onError: (e: { response?: { data?: { message?: string } } }) =>
      toast.error(e?.response?.data?.message ?? 'Failed to create user'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => userService.update(id, data),
    onSuccess: () => { toast.success('User updated'); qc.invalidateQueries({ queryKey: ['users'] }); setEditUser(null) },
    onError: () => toast.error('Failed to update user'),
  })

  const toggleActive = useMutation<void, Error, { id: string; active: boolean }>({
    mutationFn: async ({ id, active }) => {
      await (active ? userService.remove(id) : userService.update(id, { isActive: true }))
    },
    onSuccess: () => { toast.success('User updated'); qc.invalidateQueries({ queryKey: ['users'] }) },
    onError: () => toast.error('Failed to update user'),
  })

  const filtered = (users as User[]).filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    return matchSearch && (roleFilter === 'ALL' || u.role === roleFilter)
  })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">{(users as User[]).length} total users</p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <UserPlus className="mr-1.5 h-4 w-4" />Create User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                className="w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              {['ADMIN', 'AGENT', 'CUSTOMER', 'GUEST'].map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-400">No users found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {['User', 'Email', 'Phone', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar user={u} size="md" />
                          <span className="font-medium text-gray-900 dark:text-white">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{u.email}</td>
                      <td className="px-4 py-3 text-gray-500">{u.phone || '—'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={roleVariant[u.role] ?? 'default'}>{u.role}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={u.isActive ? 'success' : 'danger'}>{u.isActive ? 'Active' : 'Inactive'}</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            title="Edit user"
                            onClick={() => setEditUser(u)}
                            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-700"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            title="Reset password"
                            onClick={() => setResetUser(u)}
                            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-yellow-600 dark:hover:bg-gray-700"
                          >
                            <KeyRound className="h-4 w-4" />
                          </button>
                          <Button
                            size="sm"
                            variant={u.isActive ? 'danger' : 'secondary'}
                            onClick={() => toggleActive.mutate({ id: u.id, active: u.isActive })}
                          >
                            {u.isActive ? 'Deactivate' : 'Reactivate'}
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

      {createOpen && (
        <UserFormModal
          onClose={() => setCreateOpen(false)}
          onSave={async (data) => {
            await createMutation.mutateAsync(data as Partial<User> & { password: string })
          }}
        />
      )}

      {editUser && (
        <UserFormModal
          initial={editUser}
          onClose={() => setEditUser(null)}
          onSave={async (data) => {
            await updateMutation.mutateAsync({ id: editUser.id, data })
          }}
        />
      )}

      {resetUser && (
        <ResetPasswordModal user={resetUser} onClose={() => setResetUser(null)} />
      )}
    </div>
  )
}
