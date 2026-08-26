import { useState } from 'react'
import { Download, Laptop, Monitor, Share, Smartphone, SquarePlus, Wifi, Zap } from 'lucide-react'
import { PublicLayout } from '../components/PublicLayout'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useInstallPrompt } from '../hooks/useInstallPrompt'

type Platform = 'android' | 'ios' | 'desktop'

const platforms: { id: Platform; label: string; icon: typeof Smartphone }[] = [
  { id: 'android', label: 'اندروید', icon: Smartphone },
  { id: 'ios', label: 'آیفون / آیپد', icon: Smartphone },
  { id: 'desktop', label: 'کامپیوتر', icon: Laptop },
]

const benefits = [
  { icon: Zap, title: 'سریع‌تر', description: 'بدون نیاز به باز کردن مرورگر — یه ضربه تا اجرا.' },
  { icon: Wifi, title: 'حتی با اینترنت ضعیف', description: 'صفحات قبلاً بازدیدشده بدون نیاز به لود دوباره باز می‌شن.' },
  { icon: SquarePlus, title: 'روی صفحه اصلی', description: 'دقیقاً مثل یه اپلیکیشن نصب‌شده، بدون نوار آدرس مرورگر.' },
]

const androidSteps = [
  'ادیار رو با مرورگر Chrome باز کن (این صفحه رو همین‌جا).',
  'روی آیکون سه‌نقطه بالای مرورگر بزن.',
  'گزینه‌ی «نصب برنامه» یا «Add to Home screen» رو انتخاب کن.',
  'تایید کن — آیکون ادیار به صفحه اصلی گوشیت اضافه می‌شه.',
]

const iosSteps = [
  'ادیار رو با مرورگر Safari باز کن (نه Chrome — روی آیفون فقط Safari این قابلیت رو داره).',
  'روی آیکون Share (مربع با فلش رو به بالا) پایین صفحه بزن.',
  'تو لیست گزینه‌ها اسکرول کن و «Add to Home Screen» رو بزن.',
  'روی «Add» بالا سمت راست بزن — آیکون ادیار به صفحه اصلی اضافه می‌شه.',
]

const desktopSteps = [
  'ادیار رو با Chrome یا Edge باز کن.',
  'سمت راست نوار آدرس، دنبال آیکون نصب (یه مانیتور با فلش) بگرد.',
  'روش کلیک کن و «نصب» رو بزن.',
  'ادیار به‌عنوان یه برنامه‌ی مستقل، جدا از مرورگر، روی سیستمت باز می‌شه.',
]

const stepsByPlatform: Record<Platform, string[]> = {
  android: androidSteps,
  ios: iosSteps,
  desktop: desktopSteps,
}

export function Install() {
  const [platform, setPlatform] = useState<Platform>('android')
  const { canPromptNatively, isStandalone, promptInstall } = useInstallPrompt()

  return (
    <PublicLayout>
      <section className="mx-auto max-w-3xl px-6 py-20 text-center sm:py-24">
        <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 ring-1 ring-brand-200 dark:bg-brand-500/10 dark:text-brand-400 dark:ring-brand-500/20">
          <Download className="size-3.5" />
          نصب ادیار
        </span>
        <h1 className="text-3xl font-extrabold text-heading sm:text-4xl">ادیار رو مثل یه اپلیکیشن نصب کن</h1>
        <p className="mt-4 text-base leading-relaxed text-subtle">
          نیازی به گوگل‌پلی یا اپ‌استور نیست — همین سایت رو مستقیم روی گوشی یا کامپیوترت نصب کن، بدون فضای اضافه
          و بدون آپدیت دستی.
        </p>

        {isStandalone ? (
          <p className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
            ادیار همین الان روی این دستگاه نصب شده ✓
          </p>
        ) : (
          canPromptNatively && (
            <div className="mt-6">
              <Button size="md" icon={<Download className="size-4" />} onClick={() => promptInstall()}>
                همین الان نصب کن
              </Button>
            </div>
          )
        )}
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20 sm:pb-24">
        <div className="grid gap-4 sm:grid-cols-3">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="text-center">
              <span className="mx-auto mb-3 flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-slate-200/70 dark:bg-brand-500/10 dark:text-brand-400 dark:ring-slate-800">
                <benefit.icon className="size-5" strokeWidth={1.75} />
              </span>
              <p className="font-medium text-heading">{benefit.title}</p>
              <p className="mt-1 text-sm text-subtle">{benefit.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-slate-100/60 py-20 sm:py-24 dark:bg-slate-900/40">
        <div className="mx-auto max-w-2xl px-6">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-heading">مراحل نصب</h2>
            <p className="mt-2 text-sm text-subtle">دستگاهت رو انتخاب کن:</p>
          </div>

          <div className="mb-8 flex justify-center gap-2">
            {platforms.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPlatform(p.id)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  platform === p.id
                    ? 'bg-brand-600 text-white'
                    : 'bg-surface text-slate-500 ring-1 ring-slate-200/70 hover:text-slate-900 dark:!bg-slate-800 dark:text-slate-400 dark:ring-slate-800 dark:hover:!bg-slate-700 dark:hover:text-white'
                }`}
              >
                <p.icon className="size-3.5" strokeWidth={1.75} />
                {p.label}
              </button>
            ))}
          </div>

          <Card>
            <ol className="space-y-4">
              {stepsByPlatform[platform].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <p className="pt-0.5 text-sm leading-relaxed text-subtle">{step}</p>
                </li>
              ))}
            </ol>
          </Card>

          {platform === 'ios' && (
            <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-faint">
              <Share className="size-3.5" />
              دکمه‌ی Share تو Safari معمولاً پایین صفحه‌ست؛ روی آیپد ممکنه بالای صفحه باشه.
            </p>
          )}
          {platform === 'desktop' && (
            <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-faint">
              <Monitor className="size-3.5" />
              اگه آیکون نصب رو نمی‌بینی، یعنی یا قبلاً نصب کردی یا مرورگرت ازین قابلیت پشتیبانی نمی‌کنه (فایرفاکس هنوز نداره).
            </p>
          )}
        </div>
      </section>
    </PublicLayout>
  )
}
