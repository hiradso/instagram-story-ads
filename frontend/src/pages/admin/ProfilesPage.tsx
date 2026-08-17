import { useEffect, useState } from 'react'
import { DashboardLayout } from '../../components/DashboardLayout'
import { fetchAdminProfiles, updateUserLevel, verifyProfile } from '../../lib/admin'
import { extractErrorMessage } from '../../lib/errors'
import type { AmbassadorProfile, User } from '../../types'

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
      <h2 className="mb-6 text-lg font-bold text-slate-900">پروفایل سفیرها</h2>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="grid gap-4">
        {profiles?.map((profile) => (
          <div
            key={profile.id}
            className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
          >
            <div>
              <div className="mb-1 flex items-center gap-2">
                <h3 className="font-medium text-slate-900">{profile.user.name}</h3>
                <a
                  href={profile.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-slate-500 hover:underline"
                >
                  @{profile.instagram_username}
                </a>
                {profile.verified_at ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    تاییدشده
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                    تاییدنشده
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500">
                فالوور: {profile.follower_count.toLocaleString('fa-IR')} · میانگین بازدید:{' '}
                {profile.avg_views_7d.toLocaleString('fa-IR')} · موجودی کیف‌پول:{' '}
                {Number(profile.wallet_balance).toLocaleString('fa-IR')} تومان
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500">سطح</label>
              <select
                value={profile.user.level}
                onChange={(e) => handleLevelChange(profile, Number(e.target.value))}
                disabled={busyId === profile.id}
                className="rounded-lg border border-slate-300 px-2 py-1 text-sm outline-none focus:border-slate-500"
              >
                <option value={1}>۱</option>
                <option value={2}>۲</option>
                <option value={3}>۳</option>
              </select>

              {!profile.verified_at && (
                <button
                  onClick={() => handleVerify(profile)}
                  disabled={busyId === profile.id}
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
                >
                  تایید پروفایل
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  )
}
