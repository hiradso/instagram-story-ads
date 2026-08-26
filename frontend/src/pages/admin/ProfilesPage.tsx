import { useEffect, useState } from 'react'
import { AlertCircle, BadgeCheck, Clock, Link2, Search, ShieldCheck, Users, Wallet } from 'lucide-react'
import { DashboardLayout } from '../../components/DashboardLayout'
import { fetchAdminProfiles, updateUserLevel, verifyProfile, type ProfileFilters } from '../../lib/admin'
import { extractErrorMessage } from '../../lib/errors'
import { staggerStyle } from '../../lib/animation'
import type { AmbassadorProfile, User } from '../../types'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'
import { InfoTooltip } from '../../components/ui/Tooltip'
import { Pagination } from '../../components/ui/Pagination'
import { Select, TextInput } from '../../components/ui/Field'

interface Row extends AmbassadorProfile {
  user: User
}

const verifiedFilterOptions: { value: ProfileFilters['verified'] | 'all'; label: string }[] = [
  { value: 'all', label: 'همه' },
  { value: 'yes', label: 'تاییدشده' },
  { value: 'no', label: 'تاییدنشده' },
]

export function ProfilesPage() {
  const [profiles, setProfiles] = useState<Row[] | null>(null)
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [verified, setVerified] = useState<ProfileFilters['verified'] | 'all'>('all')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  function load() {
    fetchAdminProfiles({
      verified: verified === 'all' ? undefined : verified,
      search: search || undefined,
      page,
    }).then((res) => {
      setProfiles(res.data as Row[])
      setLastPage(res.last_page)
      setTotal(res.total)
    })
  }

  useEffect(load, [verified, search, page])

  // Debounce the search box so we don't fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  function handleVerifiedFilterChange(value: ProfileFilters['verified'] | 'all') {
    setVerified(value)
    setPage(1)
  }

  async function handleVerify(profile: Row) {
    setError(null)
    setBusyId(profile.id)
    try {
      await verifyProfile(profile.id)
      load()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  async function handleLevelChange(profile: Row, level: number) {
    setError(null)
    setBusyId(profile.id)
    try {
      await updateUserLevel(profile.user_id, level)
      load()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-heading">پروفایل سفیرها</h2>
        <p className="mt-0.5 text-sm text-faint">تایید پروفایل و مدیریت سطح سفیرها</p>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <TextInput
          icon={Search}
          placeholder="جست‌وجوی نام یا نام‌کاربری اینستاگرام..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="min-w-48 flex-1"
        />
        <Select
          value={verified}
          onChange={(e) => handleVerifiedFilterChange(e.target.value as ProfileFilters['verified'] | 'all')}
          className="w-auto shrink-0"
        >
          {verifiedFilterOptions.map((opt) => (
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

      {profiles === null && <Spinner label="در حال بارگذاری..." />}

      {profiles?.length === 0 && (
        <EmptyState
          icon={ShieldCheck}
          title={verified !== 'all' || search ? 'سفیری با این فیلتر پیدا نشد' : 'هنوز سفیری ثبت‌نام نکرده'}
        />
      )}

      <div className="grid gap-4">
        {profiles?.map((profile, i) => (
          <Card key={profile.id} style={staggerStyle(i)} className="animate-fade-in-up flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <h3 className="font-medium text-heading">{profile.user.name}</h3>
                <a
                  href={profile.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-sm text-subtle hover:text-brand-600 dark:hover:text-brand-400"
                >
                  <Link2 className="size-3.5" />@{profile.instagram_username}
                </a>
                {profile.verified_at ? (
                  <Badge tone="emerald" icon={<BadgeCheck className="size-3.5" />}>
                    تاییدشده
                  </Badge>
                ) : (
                  <Badge tone="amber" icon={<Clock className="size-3.5" />}>
                    تاییدنشده
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-subtle">
                <span className="flex items-center gap-1.5">
                  <Users className="size-3.5 text-faint" />
                  {profile.follower_count.toLocaleString('fa-IR')} فالوور
                </span>
                <span>میانگین بازدید: {profile.avg_views_7d.toLocaleString('fa-IR')}</span>
                <span className="flex items-center gap-1.5">
                  <Wallet className="size-3.5 text-faint" />
                  {Number(profile.wallet_balance).toLocaleString('fa-IR')} تومان
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-xs text-subtle">
                سطح
                <InfoTooltip>
                  سطح ۱: حداکثر ۱ کمپین هم‌زمان. سطح ۲: تا ۳ کمپین. سطح ۳: نامحدود. سفیرها با تایید شدن بازدیدهاشون
                  خودکار ارتقا می‌گیرن؛ این‌جا می‌تونی دستی هم تغییرش بدی.
                </InfoTooltip>
              </label>
              <Select
                value={profile.user.level}
                onChange={(e) => handleLevelChange(profile, Number(e.target.value))}
                disabled={busyId === profile.id}
                className="w-auto shrink-0"
              >
                <option value={1}>۱</option>
                <option value={2}>۲</option>
                <option value={3}>۳</option>
              </Select>

              {!profile.verified_at && (
                <Button
                  size="sm"
                  onClick={() => handleVerify(profile)}
                  loading={busyId === profile.id}
                  icon={<BadgeCheck className="size-3.5" />}
                >
                  تایید پروفایل
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {profiles && profiles.length > 0 && (
        <Pagination currentPage={page} lastPage={lastPage} total={total} onPageChange={setPage} />
      )}
    </DashboardLayout>
  )
}
