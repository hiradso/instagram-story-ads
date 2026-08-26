import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Ban, CheckCircle2, Plus, Search, UserCog } from 'lucide-react'
import { DashboardLayout } from '../../components/DashboardLayout'
import { fetchAdminUsers, updateUserStatus, type UserFilters } from '../../lib/admin'
import { extractErrorMessage } from '../../lib/errors'
import { roleLabel, userStatusLabel, userStatusTone } from '../../lib/labels'
import { staggerStyle } from '../../lib/animation'
import type { User } from '../../types'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'
import { Pagination } from '../../components/ui/Pagination'
import { Select, TextInput } from '../../components/ui/Field'

const roleFilterOptions: { value: UserFilters['role'] | 'all'; label: string }[] = [
  { value: 'all', label: 'همه‌ی نقش‌ها' },
  { value: 'advertiser', label: 'آگهی‌دهنده' },
  { value: 'ambassador', label: 'سفیر' },
]

const statusFilterOptions: { value: UserFilters['status'] | 'all'; label: string }[] = [
  { value: 'all', label: 'همه‌ی وضعیت‌ها' },
  { value: 'active', label: 'فعال' },
  { value: 'suspended', label: 'مسدودشده' },
]

export function UsersPage() {
  const [users, setUsers] = useState<User[] | null>(null)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [role, setRole] = useState<UserFilters['role'] | 'all'>('all')
  const [status, setStatus] = useState<UserFilters['status'] | 'all'>('all')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  function load() {
    fetchAdminUsers({
      role: role === 'all' ? undefined : role,
      status: status === 'all' ? undefined : status,
      search: search || undefined,
      page,
    }).then((res) => {
      setUsers(res.data)
      setLastPage(res.last_page)
      setTotal(res.total)
    })
  }

  useEffect(() => {
    setUsers(null)
    load()
  }, [role, status, search, page]) // eslint-disable-line react-hooks/exhaustive-deps

  // Debounce the search box so we don't fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  function handleRoleFilterChange(value: UserFilters['role'] | 'all') {
    setRole(value)
    setPage(1)
  }

  function handleStatusFilterChange(value: UserFilters['status'] | 'all') {
    setStatus(value)
    setPage(1)
  }

  async function handleStatusToggle(user: User) {
    setError(null)
    setBusyId(user.id)
    try {
      await updateUserStatus(user.id, user.status === 'active' ? 'suspended' : 'active')
      load()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-heading">کاربران</h2>
          <p className="mt-0.5 text-sm text-faint">مدیریت حساب آگهی‌دهنده‌ها و سفیرها</p>
        </div>
        <Link to="/admin/users/new">
          <Button icon={<Plus className="size-4" />}>افزودن کاربر</Button>
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <TextInput
          icon={Search}
          placeholder="جست‌وجوی نام یا ایمیل..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="min-w-48 flex-1"
        />
        <Select
          value={role}
          onChange={(e) => handleRoleFilterChange(e.target.value as UserFilters['role'] | 'all')}
          className="w-auto shrink-0"
        >
          {roleFilterOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
        <Select
          value={status}
          onChange={(e) => handleStatusFilterChange(e.target.value as UserFilters['status'] | 'all')}
          className="w-auto shrink-0"
        >
          {statusFilterOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>

      {error && (
        <p className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </p>
      )}

      {users === null && <Spinner label="در حال بارگذاری..." />}

      {users?.length === 0 && (
        <EmptyState
          icon={UserCog}
          title={role !== 'all' || status !== 'all' || search ? 'کاربری با این فیلتر پیدا نشد' : 'هنوز کاربری ثبت نشده'}
          action={
            <Link to="/admin/users/new">
              <Button size="sm" icon={<Plus className="size-4" />}>
                افزودن کاربر
              </Button>
            </Link>
          }
        />
      )}

      <div className="grid gap-4">
        {users?.map((user, i) => (
          <Card key={user.id} style={staggerStyle(i)} className="animate-fade-in-up flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <h3 className="font-medium text-heading">{user.name}</h3>
                <Badge tone="slate">{roleLabel[user.role]}</Badge>
                <Badge tone={userStatusTone[user.status]}>{userStatusLabel[user.status]}</Badge>
              </div>
              <p className="text-sm text-subtle">
                {user.email}
                {user.phone && ` · ${user.phone}`}
              </p>
            </div>

            <Button
              variant={user.status === 'active' ? 'danger' : 'success'}
              size="sm"
              onClick={() => handleStatusToggle(user)}
              loading={busyId === user.id}
              icon={user.status === 'active' ? <Ban className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
            >
              {user.status === 'active' ? 'مسدود کردن' : 'رفع مسدودی'}
            </Button>
          </Card>
        ))}
      </div>

      {users && users.length > 0 && (
        <Pagination currentPage={page} lastPage={lastPage} total={total} onPageChange={setPage} />
      )}
    </DashboardLayout>
  )
}
