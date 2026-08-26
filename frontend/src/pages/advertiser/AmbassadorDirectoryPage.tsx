import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, Search, Users } from 'lucide-react'
import { DashboardLayout } from '../../components/DashboardLayout'
import { fetchAmbassadorDirectory, type DirectoryFilters } from '../../lib/directory'
import { fetchCategories, fetchProvinces } from '../../lib/campaigns'
import { formatNumber } from '../../lib/labels'
import type { AmbassadorProfile, Category, Province } from '../../types'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spinner } from '../../components/ui/Spinner'
import { Pagination } from '../../components/ui/Pagination'
import { Select, TextInput } from '../../components/ui/Field'

export function AmbassadorDirectoryPage() {
  const [profiles, setProfiles] = useState<AmbassadorProfile[] | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [provinces, setProvinces] = useState<Province[]>([])
  const [lastPage, setLastPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [categoryId, setCategoryId] = useState<number | 'all'>('all')
  const [provinceId, setProvinceId] = useState<number | 'all'>('all')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([fetchCategories(), fetchProvinces()]).then(([cats, provs]) => {
      setCategories(cats)
      setProvinces(provs)
    })
  }, [])

  function load() {
    const filters: DirectoryFilters = { page }
    if (categoryId !== 'all') filters.category_id = categoryId
    if (provinceId !== 'all') filters.province_id = provinceId
    if (search) filters.search = search

    fetchAmbassadorDirectory(filters).then((res) => {
      setProfiles(res.data)
      setLastPage(res.last_page)
      setTotal(res.total)
    })
  }

  useEffect(load, [categoryId, provinceId, search, page]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-heading">پیدا کردن سفیر</h2>
        <p className="mt-0.5 text-sm text-faint">
          پروفایل سفیرهای تاییدشده رو ببین، باهاشون گفت‌وگو کن و خودت انتخاب کن باهاش همکاری کنی
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <TextInput
          icon={Search}
          placeholder="جست‌وجوی نام‌کاربری اینستاگرام..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="min-w-48 flex-1"
        />
        <Select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value === 'all' ? 'all' : Number(e.target.value))
            setPage(1)
          }}
          className="w-auto shrink-0"
        >
          <option value="all">همه‌ی دسته‌بندی‌ها</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select
          value={provinceId}
          onChange={(e) => {
            setProvinceId(e.target.value === 'all' ? 'all' : Number(e.target.value))
            setPage(1)
          }}
          className="w-auto shrink-0"
        >
          <option value="all">همه‌ی استان‌ها</option>
          {provinces.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </div>

      {profiles === null && <Spinner label="در حال بارگذاری..." />}

      {profiles?.length === 0 && (
        <EmptyState
          icon={Users}
          title={categoryId !== 'all' || provinceId !== 'all' || search ? 'سفیری با این فیلتر پیدا نشد' : 'هنوز سفیر تاییدشده‌ای نیست'}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {profiles?.map((profile) => (
          <Card key={profile.id} hover className="animate-fade-in-up flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex size-10 items-center justify-center rounded-full bg-gradient-to-tl from-brand-500 to-accent-400 text-sm font-bold text-white">
                {profile.instagram_username.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate font-medium text-heading">@{profile.instagram_username}</p>
                <p className="text-xs text-faint">
                  {profile.category?.name} · {profile.province?.name}
                </p>
              </div>
            </div>

            {profile.bio && <p className="line-clamp-2 text-sm text-subtle">{profile.bio}</p>}

            <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-subtle dark:border-slate-800">
              <span>{formatNumber(profile.follower_count)} فالوور</span>
              <span>میانگین بازدید: {formatNumber(profile.avg_views_7d)}</span>
            </div>

            <Link to={`/advertiser/ambassadors/${profile.id}`}>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <Eye className="size-3.5" />
                مشاهده‌ی پروفایل
              </button>
            </Link>
          </Card>
        ))}
      </div>

      {profiles && profiles.length > 0 && (
        <Pagination currentPage={page} lastPage={lastPage} total={total} onPageChange={setPage} />
      )}
    </DashboardLayout>
  )
}
