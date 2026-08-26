import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, MessageCircle, XCircle } from 'lucide-react'
import { DashboardLayout } from '../components/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import { fetchConversations } from '../lib/conversations'
import type { Conversation } from '../types'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { Spinner } from '../components/ui/Spinner'

const statusLabel: Record<Conversation['status'], string> = {
  open: 'در حال گفت‌وگو',
  agreed: 'همکاری شروع شد',
  declined: 'ردشده',
}

const statusTone: Record<Conversation['status'], 'amber' | 'emerald' | 'red'> = {
  open: 'amber',
  agreed: 'emerald',
  declined: 'red',
}

export function ConversationsPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[] | null>(null)

  useEffect(() => {
    fetchConversations().then((res) => setConversations(res.data))
  }, [])

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-heading">گفت‌وگوها</h2>
        <p className="mt-0.5 text-sm text-faint">
          {user?.role === 'advertiser'
            ? 'گفت‌وگوهات با سفیرهایی که برای همکاری دستی پیدا کردی'
            : 'گفت‌وگوهایی که آگهی‌دهنده‌ها باهات شروع کردن'}
        </p>
      </div>

      {conversations === null && <Spinner label="در حال بارگذاری..." />}

      {conversations?.length === 0 && (
        <EmptyState
          icon={MessageCircle}
          title="هنوز گفت‌وگویی نداری"
          description={
            user?.role === 'advertiser'
              ? 'از صفحه‌ی «پیدا کردن سفیر» یه سفیر رو انتخاب کن و گفت‌وگو رو شروع کن.'
              : 'وقتی آگهی‌دهنده‌ای برای همکاری دستی باهات تماس بگیره، این‌جا نشون داده می‌شه.'
          }
        />
      )}

      <div className="grid gap-3">
        {conversations?.map((c) => {
          const other = user?.role === 'advertiser' ? c.ambassador : c.advertiser
          return (
            <Link key={c.id} to={`/conversations/${c.id}`}>
              <Card hover className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="truncate font-medium text-heading">{other?.name}</h3>
                    <Badge
                      tone={statusTone[c.status]}
                      icon={
                        c.status === 'agreed' ? (
                          <CheckCircle2 className="size-3.5" />
                        ) : c.status === 'declined' ? (
                          <XCircle className="size-3.5" />
                        ) : undefined
                      }
                    >
                      {statusLabel[c.status]}
                    </Badge>
                  </div>
                  <p className="truncate text-sm text-subtle">درباره‌ی کمپین «{c.campaign?.title}»</p>
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </DashboardLayout>
  )
}
