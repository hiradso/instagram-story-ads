import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertCircle, CheckCircle2, FileText, Send, XCircle } from 'lucide-react'
import { DashboardLayout } from '../components/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { agreeConversation, declineConversation, fetchConversations, fetchMessages, sendMessage } from '../lib/conversations'
import { extractErrorMessage } from '../lib/errors'
import { storageUrl } from '../lib/storage'
import type { Conversation, Message } from '../types'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'

const POLL_INTERVAL_MS = 4000

export function ConversationChatPage() {
  const { id } = useParams()
  const conversationId = Number(id)
  const { user } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const lastIdRef = useRef(0)

  useEffect(() => {
    // There's no dedicated GET-one endpoint — the list is cheap and small
    // enough per user that filtering it client-side is simpler than adding
    // one just for this.
    fetchConversations().then((res) => {
      const found = res.data.find((c) => c.id === conversationId)
      setConversation(found ?? null)
    })
  }, [conversationId])

  useEffect(() => {
    let cancelled = false

    function poll() {
      fetchMessages(conversationId, lastIdRef.current || undefined).then((newMessages) => {
        if (cancelled || newMessages.length === 0) return
        lastIdRef.current = newMessages[newMessages.length - 1].id
        setMessages((prev) => [...prev, ...newMessages])
      })
    }

    poll()
    const interval = setInterval(poll, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e: FormEvent) {
    e.preventDefault()
    if (!body.trim()) return

    setSending(true)
    try {
      const message = await sendMessage(conversationId, body)
      lastIdRef.current = message.id
      setMessages((prev) => [...prev, message])
      setBody('')
    } catch (err) {
      showToast('error', extractErrorMessage(err))
    } finally {
      setSending(false)
    }
  }

  async function handleAgree() {
    setError(null)
    setBusy(true)
    try {
      await agreeConversation(conversationId)
      showToast('success', 'همکاری شروع شد. کمپین به سفیر تخصیص داده شد.')
      setConversation((c) => (c ? { ...c, status: 'agreed' } : c))
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function handleDecline() {
    setError(null)
    setBusy(true)
    try {
      const updated = await declineConversation(conversationId)
      setConversation(updated)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  if (!conversation) {
    return (
      <DashboardLayout>
        <Spinner label="در حال بارگذاری..." />
      </DashboardLayout>
    )
  }

  const other = user?.role === 'advertiser' ? conversation.ambassador : conversation.advertiser
  const isAdvertiser = user?.role === 'advertiser'
  const isOpen = conversation.status === 'open'

  return (
    <DashboardLayout>
      <button
        type="button"
        onClick={() => navigate('/conversations')}
        className="mb-4 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
      >
        ← بازگشت به گفت‌وگوها
      </button>

      <Card className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h2 className="font-bold text-heading">{other?.name}</h2>
            <p className="text-sm text-subtle">درباره‌ی کمپین «{conversation.campaign?.title}»</p>
          </div>

          <div className="flex items-center gap-2">
            {conversation.status === 'agreed' && (
              <Badge tone="emerald" icon={<CheckCircle2 className="size-3.5" />}>
                همکاری شروع شد
              </Badge>
            )}
            {conversation.status === 'declined' && (
              <Badge tone="red" icon={<XCircle className="size-3.5" />}>
                ردشده
              </Badge>
            )}
            {isOpen && isAdvertiser && (
              <Button variant="success" size="sm" onClick={handleAgree} loading={busy} icon={<CheckCircle2 className="size-3.5" />}>
                شروع همکاری
              </Button>
            )}
            {isOpen && (
              <Button variant="danger" size="sm" onClick={handleDecline} loading={busy} icon={<XCircle className="size-3.5" />}>
                رد کردن
              </Button>
            )}
          </div>
        </div>

        {conversation.brief_file_path && (
          <a
            href={storageUrl(conversation.brief_file_path)}
            target="_blank"
            rel="noreferrer"
            className="flex w-fit items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <FileText className="size-4" />
            فایل بریف تبلیغاتی
          </a>
        )}

        {error && (
          <p className="flex items-center gap-2 rounded-xl bg-red-50 dark:bg-red-500/10 px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
            <AlertCircle className="size-4 shrink-0" />
            {error}
          </p>
        )}

        <div className="flex h-96 flex-col gap-2 overflow-y-auto rounded-xl bg-slate-50 p-4 dark:bg-slate-950/40">
          {messages.map((m) => {
            const isMine = m.sender_id === user?.id
            return (
              <div key={m.id} className={`flex ${isMine ? 'justify-start' : 'justify-end'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                    isMine
                      ? 'bg-gradient-to-tl from-brand-600 to-accent-500 text-white'
                      : 'bg-surface text-body ring-1 ring-slate-200/70 dark:bg-slate-800 dark:ring-slate-700'
                  }`}
                >
                  {m.body}
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {isOpen ? (
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              type="text"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="پیامت رو بنویس..."
              className="w-full rounded-xl border border-slate-200 bg-surface px-3 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-brand-500 dark:focus:ring-brand-500/20"
            />
            <Button type="submit" loading={sending} icon={<Send className="size-4" />}>
              ارسال
            </Button>
          </form>
        ) : (
          <p className="text-center text-sm text-faint">این گفت‌وگو بسته شده و دیگه نمی‌شه پیام فرستاد.</p>
        )}
      </Card>
    </DashboardLayout>
  )
}
