import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Search, UserPlus, Edit2, KeyRound, X, Eye, MoreVertical, ShieldCheck, UserX } from 'lucide-react'
import { userService } from '@/services/adminService'
import { uploadService } from '@/services/uploadService'
import { Badge, Button, Input, Skeleton } from '@/components/ui'
import type { User } from '@/types'

const roleVariant: Record<string, 'info' | 'success' | 'warning' | 'default'> = {
  ADMIN: 'info', AGENT: 'warning', CUSTOMER: 'success', GUEST: 'default',
}

// ── Modal shell ─────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className={`w-full ${wide ? 'max-w-2xl' : 'max-w-md'} rounded-2xl bg-white shadow-2xl dark:bg-gray-800 my-4`}>
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

// ── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ user, size = 'md' }: { user: User; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const cls = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-12 w-12 text-base', xl: 'h-20 w-20 text-2xl' }[size]
  return user.avatarUrl
    ? <img src={user.avatarUrl} alt={user.name} className={`${cls} rounded-full object-cover shrink-0`} />
    : (
      <div className={`${cls} flex shrink-0 items-center justify-center rounded-full bg-primary-100 font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-400`}>
        {user.name.charAt(0).toUpperCase()}
      </div>
    )
}

// ── View User Modal ──────────────────────────────────────────────────────────
function ViewUserModal({ user, onClose, onEdit, onReset }: { user: User; onClose: () => void; onEdit: () => void; onReset: () => void }) {
  return (
    <Modal title="User Details" onClose={onClose} wide>
      <div className="space-y-6">
        {/* Profile header */}
        <div className="flex items-center gap-4">
          <Avatar user={user} size="xl" />
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant={roleVariant[user.role] ?? 'default'}>{user.role}</Badge>
              <Badge variant={user.isActive ? 'success' : 'danger'}>{user.isActive ? 'Active' : 'Inactive'}</Badge>
            </div>
          </div>
        </div>

        {/* Details grid */}
        <div className="grid gap-4 rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50 sm:grid-cols-2">
          {[
            { label: 'Full Name', value: user.name },
            { label: 'Email Address', value: user.email },
            { label: 'Phone', value: user.phone || '—' },
            { label: 'Role', value: user.role },
            { label: 'Status', value: user.isActive ? 'Active' : 'Inactive' },
            { label: 'Member Since', value: new Date(user.createdAt).toLocaleDateString('en-RW', { year: 'numeric', month: 'long', day: 'numeric' }) },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">{label}</p>
              <p className="mt-0.5 text-sm font-medium text-gray-900 dark:text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-1">
          <Button onClick={onEdit}><Edit2 className="mr-1.5 h-4 w-4" />Edit User</Button>
          <Button variant="secondary" onClick={onReset}><KeyRound className="mr-1.5 h-4 w-4" />Reset Password</Button>
          <Button variant="secondary" onClick={onClose} className="ml-auto">Close</Button>
        </div>
      </div>
    </Modal>
  )
}

// ── Create / Edit Modal ──────────────────────────────────────────────────────
function UserFormModal({ initial, onClose, onSave }: {
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
    try { set('avatarUrl', await uploadService.uploadImage(file, 'avatars')) }
    catch { toast.error('Avatar upload failed') }
    finally { setUploading(false) }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email) { toast.error('Name and email are required'); return }
    if (!isEdit && form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setSaving(true)
    try {
      const payload: Partial<User> & { password?: string } = {
        name: form.name, email: form.email,
        phone: form.phone || undefined,
        role: form.role as User['role'],
        avatarUrl: form.avatarUrl || undefined,
      }
      if (!isEdit) payload.password = form.password
      await onSave(payload)
    } finally { setSaving(false) }
  }

  return (
    <Modal title={isEdit ? 'Edit User' : 'Create User'} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-5">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            {form.avatarUrl
              ? <img src={form.avatarUrl} alt="avatar" className="h-16 w-16 rounded-full object-cover" />
              : <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-2xl font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                  {form.name.charAt(0).toUpperCase() || '?'}
                </div>
            }
          </div>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
              {uploading ? 'Uploading…' : 'Upload Photo'}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} disabled={uploading} />
            </label>
            {form.avatarUrl && (
              <button type="button" onClick={() => set('avatarUrl', '')} className="text-xs text-red-500 hover:underline">Remove</button>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
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

// ── Reset Password Modal ─────────────────────────────────────────────────────
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
        toast.success('Password reset and email sent')
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
        <Input label="New password" type="password" placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input type="checkbox" className="rounded border-gray-300" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} />
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

// ── Row actions dropdown ─────────────────────────────────────────────────────
function RowActions({ user, onView, onEdit, onReset, onToggle, toggling }: {
  user: User
  onView: () => void
  onEdit: () => void
  onReset: () => void
  onToggle: () => void
  toggling: boolean
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-white"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-44 rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="p-1">
              <button onClick={() => { setOpen(false); onView() }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                <Eye className="h-4 w-4 text-gray-400" /> View Details
              </button>
              <button onClick={() => { setOpen(false); onEdit() }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                <Edit2 className="h-4 w-4 text-gray-400" /> Edit User
              </button>
              <button onClick={() => { setOpen(false); onReset() }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                <KeyRound className="h-4 w-4 text-gray-400" /> Reset Password
              </button>
              <div className="my-1 border-t border-gray-100 dark:border-gray-700" />
              <button
                onClick={() => { setOpen(false); onToggle() }}
                disabled={toggling}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm ${user.isActive ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'}`}
              >
                {user.isActive
                  ? <><UserX className="h-4 w-4" /> Deactivate</>
                  : <><ShieldCheck className="h-4 w-4" /> Reactivate</>
                }
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function UsersPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [createOpen, setCreateOpen] = useState(false)
  const [viewUser, setViewUser] = useState<User | null>(null)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [resetUser, setResetUser] = useState<User | null>(null)

  const { data: users = [], isLoading } = useQuery({ queryKey: ['users'], queryFn: userService.getAll })

  const createMutation = useMutation({
    mutationFn: (payload: Partial<User> & { password: string }) => userService.create(payload),
    onSuccess: () => { toast.success('User created'); qc.invalidateQueries({ queryKey: ['users'] }); setCreateOpen(false) },
    onError: (e: { response?: { data?: { message?: string } } }) => toast.error(e?.response?.data?.message ?? 'Failed to create user'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => userService.update(id, data),
    onSuccess: () => { toast.success('User updated'); qc.invalidateQueries({ queryKey: ['users'] }); setEditUser(null) },
    onError: () => toast.error('Failed to update user'),
  })

  const toggleMutation = useMutation<void, Error, { id: string; active: boolean }>({
    mutationFn: async ({ id, active }) => {
      await (active ? userService.remove(id) : userService.update(id, { isActive: true }))
    },
    onSuccess: () => { toast.success('User updated'); qc.invalidateQueries({ queryKey: ['users'] }) },
    onError: () => toast.error('Failed to update user'),
  })

  const filtered = (users as User[]).filter((u) =>
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())) &&
    (roleFilter === 'ALL' || u.role === roleFilter)
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="mt-0.5 text-sm text-gray-500">{(users as User[]).length} total users</p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <UserPlus className="mr-1.5 h-4 w-4" />Create User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="ALL">All Roles</option>
          {['ADMIN', 'AGENT', 'CUSTOMER', 'GUEST'].map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* User list */}
      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white py-16 text-center text-sm text-gray-400 dark:border-gray-700 dark:bg-gray-800">
          No users found
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          {/* Desktop table header */}
          <div className="hidden border-b border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/80 sm:grid sm:grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] sm:gap-4">
            {['User', 'Email', 'Role', 'Status', 'Joined', ''].map((h) => (
              <p key={h} className="text-xs font-semibold uppercase tracking-wide text-gray-400">{h}</p>
            ))}
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filtered.map((u) => (
              <div
                key={u.id}
                className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 sm:grid-cols-[2fr_2fr_1fr_1fr_1fr_auto] sm:gap-4"
              >
                {/* User info */}
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar user={u} size="md" />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-gray-900 dark:text-white">{u.name}</p>
                    {/* Email shown here on mobile only */}
                    <p className="truncate text-xs text-gray-500 sm:hidden">{u.email}</p>
                    <div className="mt-1 flex flex-wrap gap-1 sm:hidden">
                      <Badge variant={roleVariant[u.role] ?? 'default'}>{u.role}</Badge>
                      <Badge variant={u.isActive ? 'success' : 'danger'}>{u.isActive ? 'Active' : 'Inactive'}</Badge>
                    </div>
                  </div>
                </div>

                {/* Email — desktop only */}
                <p className="hidden truncate text-sm text-gray-500 sm:block">{u.email}</p>

                {/* Role — desktop only */}
                <div className="hidden sm:block">
                  <Badge variant={roleVariant[u.role] ?? 'default'}>{u.role}</Badge>
                </div>

                {/* Status — desktop only */}
                <div className="hidden sm:block">
                  <Badge variant={u.isActive ? 'success' : 'danger'}>{u.isActive ? 'Active' : 'Inactive'}</Badge>
                </div>

                {/* Joined — desktop only */}
                <p className="hidden text-sm text-gray-500 sm:block whitespace-nowrap">
                  {new Date(u.createdAt).toLocaleDateString()}
                </p>

                {/* Actions */}
                <RowActions
                  user={u}
                  onView={() => setViewUser(u)}
                  onEdit={() => setEditUser(u)}
                  onReset={() => setResetUser(u)}
                  onToggle={() => toggleMutation.mutate({ id: u.id, active: u.isActive })}
                  toggling={toggleMutation.isPending}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {createOpen && (
        <UserFormModal
          onClose={() => setCreateOpen(false)}
          onSave={async (data) => { await createMutation.mutateAsync(data as Partial<User> & { password: string }) }}
        />
      )}

      {viewUser && (
        <ViewUserModal
          user={viewUser}
          onClose={() => setViewUser(null)}
          onEdit={() => { setEditUser(viewUser); setViewUser(null) }}
          onReset={() => { setResetUser(viewUser); setViewUser(null) }}
        />
      )}

      {editUser && (
        <UserFormModal
          initial={editUser}
          onClose={() => setEditUser(null)}
          onSave={async (data) => { await updateMutation.mutateAsync({ id: editUser.id, data }) }}
        />
      )}

      {resetUser && (
        <ResetPasswordModal user={resetUser} onClose={() => setResetUser(null)} />
      )}
    </div>
  )
}
