import { useEffect, useState } from 'react'
import { AlertCircle, BadgeCheck, Clock, Link2, ShieldCheck, Users, Wallet } from 'lucide-react'
import { DashboardLayout } from '../../components/DashboardLayout'
import { fetchAdminProfiles, updateUserLevel, verifyProfile } from '../../lib/admin'
import { extractErrorMessage } from '../../lib/errors'
import type { AmbassadorProfile, User } from '../../types'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'
import { InfoTooltip } from '../../components/ui/Tooltip'

interface Row extends AmbassadorProfile {
  user: User
}

export function ProfilesPage() {
  const [profiles, setProfiles] = useState<Row[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  function load() {
    fetchAdminProfiles().then((res) => setProfiles(res.data as Row[]))
  }

  useEffect(load, [])

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
        <h2 className="text-xl font-bold text-slate-900">پروفایل سفیرها</h2>
        <p className="mt-0.5 text-sm text-slate-400">تایید پروفایل و مدیریت سطح سفیرها</p>
      </div>

      {error && (
        <p className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </p>
      )}

      {profiles === null && <Spinner label="در حال بارگذاری..." />}

      {profiles?.length === 0 && <EmptyState icon={ShieldCheck} title="هنوز سفیری ثبت‌نام نکرده" />}

      <div className="grid gap-4">
        {profiles?.map((profile) => (
          <Card key={profile.id} className="animate-fade-in-up flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                <h3 className="font-medium text-slate-900">{profile.user.name}</h3>
                <a
                  href={profile.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-sm text-slate-500 hover:text-brand-600"
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
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Users className="size-3.5 text-slate-400" />
                  {profile.follower_count.toLocaleString('fa-IR')} فالوور
                </span>
                <span>میانگین بازدید: {profile.avg_views_7d.toLocaleString('fa-IR')}</span>
                <span className="flex items-center gap-1.5">
                  <Wallet className="size-3.5 text-slate-400" />
                  {Number(profile.wallet_balance).toLocaleString('fa-IR')} تومان
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-xs text-slate-500">
                سطح
                <InfoTooltip>
                  سطح ۱: حداکثر ۱ کمپین هم‌زمان. سطح ۲: تا ۳ کمپین. سطح ۳: نامحدود. سفیرها با تایید شدن بازدیدهاشون
                  خودکار ارتقا می‌گیرن؛ این‌جا می‌تونی دستی هم تغییرش بدی.
                </InfoTooltip>
              </label>
              <select
                value={profile.user.level}
                onChange={(e) => handleLevelChange(profile, Number(e.target.value))}
                disabled={busyId === profile.id}
                className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              >
                <option value={1}>۱</option>
                <option value={2}>۲</option>
                <option value={3}>۳</option>
              </select>

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
    </DashboardLayout>
  )
}
