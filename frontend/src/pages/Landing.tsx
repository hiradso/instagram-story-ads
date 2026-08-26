import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  BadgeCheck,
  Camera,
  CreditCard,
  MessageCircle,
  Megaphone,
  ShieldCheck,
  Sparkles,
  Wallet,
  Zap,
} from 'lucide-react'
import { PublicLayout } from '../components/PublicLayout'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

const advertiserSteps = [
  { title: 'ثبت‌نام و شارژ کیف‌پول', description: 'حساب آگهی‌دهنده بساز و کیف‌پولت رو از طریق زرین‌پال شارژ کن.' },
  { title: 'ساخت کمپین', description: 'موضوع، بودجه و استان‌های هدف کمپینت رو مشخص کن و تصویر تبلیغاتی رو آپلود کن.' },
  { title: 'تخصیص خودکار', description: 'سیستم به‌صورت خودکار کمپینت رو به سفیرهای مرتبط با همون دسته‌بندی و استان تخصیص می‌ده.' },
  { title: 'پرداخت بر اساس نتیجه', description: 'فقط بابت بازدیدهای واقعی و تاییدشده از بودجه‌ات کم می‌شه، نه قبلش.' },
]

const ambassadorSteps = [
  { title: 'ثبت‌نام و تکمیل پروفایل', description: 'پیج اینستاگرامت رو معرفی کن: دسته‌بندی، استان، تعداد فالوور و میانگین بازدید.' },
  { title: 'تخصیص کمپین', description: 'کمپین‌های مرتبط با حوزه‌ی پیجت به‌صورت خودکار بهت تخصیص داده می‌شه.' },
  { title: 'انتشار استوری', description: 'استوری تبلیغاتی رو منتشر کن و اسکرین‌شات بازدیدش رو تو پنل ثبت کن.' },
  { title: 'دریافت درآمد', description: 'بعد از تایید ادمین، مبلغ به کیف‌پولت اضافه می‌شه و می‌تونی برداشت کنی.' },
]

const features = [
  {
    icon: Zap,
    title: 'تخصیص هوشمند',
    description: 'موتور تخصیص خودکار، کمپین‌ها رو بر اساس دسته‌بندی، استان و سطح سفیر جفت می‌کنه — بدون جست‌وجوی دستی.',
  },
  {
    icon: ShieldCheck,
    title: 'پرداخت بر اساس نتیجه',
    description: 'آگهی‌دهنده فقط بابت بازدید واقعی و تاییدشده توسط ادمین پرداخت می‌کنه، نه قبل از اثبات.',
  },
  {
    icon: MessageCircle,
    title: 'اطلاع‌رسانی لحظه‌ای',
    description: 'از تخصیص کمپین تا تایید پرداخت، هر اتفاق مهم فوراً با پیامک به اطلاعت می‌رسه.',
  },
  {
    icon: Wallet,
    title: 'کیف‌پول و برداشت آسون',
    description: 'سفیرها درآمدشون رو تو کیف‌پول جمع می‌کنن و هر وقت خواستن درخواست برداشت می‌دن.',
  },
  {
    icon: CreditCard,
    title: 'شارژ امن با زرین‌پال',
    description: 'آگهی‌دهنده‌ها کیف‌پولشون رو مستقیم و امن از طریق درگاه پرداخت زرین‌پال شارژ می‌کنن.',
  },
  {
    icon: BadgeCheck,
    title: 'پنل مدیریت شفاف',
    description: 'هر کمپین، هر تخصیص و هر تراکنش قابل پیگیریه — هیچی تو ابهام نمی‌مونه.',
  },
]

export function Landing() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-gradient-to-br from-brand-400/30 to-accent-400/20 blur-3xl dark:from-brand-500/20 dark:to-accent-500/10" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 size-96 rounded-full bg-gradient-to-tr from-accent-400/20 to-brand-500/20 blur-3xl dark:from-accent-500/10 dark:to-brand-600/15" />

        <div className="animate-fade-in-up relative mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
          <span className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 ring-1 ring-brand-200 dark:bg-brand-500/10 dark:text-brand-400 dark:ring-brand-500/20">
            <Sparkles className="size-3.5" />
            تبلیغات استوری اینستاگرام، بدون واسطه
          </span>

          <h1 className="text-3xl font-extrabold leading-tight text-heading sm:text-5xl">
            برندت رو به دست
            <span className="bg-gradient-to-l from-brand-600 to-accent-500 bg-clip-text text-transparent"> سفیرهای واقعی </span>
            اینستاگرام برسون
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base text-subtle sm:text-lg">
            معتبرترین پلتفرم تبلیغات در شبکه‌های اجتماعی
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/register?role=advertiser">
              <Button size="md" icon={<Megaphone className="size-4" />} className="w-full sm:w-auto">
                ثبت‌نام به‌عنوان آگهی‌دهنده
              </Button>
            </Link>
            <Link to="/register?role=ambassador">
              <Button variant="secondary" size="md" icon={<Camera className="size-4" />} className="w-full sm:w-auto">
                ثبت‌نام به‌عنوان سفیر
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-heading">ادیار چطور کار می‌کنه؟</h2>
          <p className="mt-2 text-sm text-faint">هم برای آگهی‌دهنده‌ها، هم برای سفیرها — یه مسیر ساده و شفاف</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <Megaphone className="size-4" />
              </span>
              <h3 className="font-bold text-heading">برای آگهی‌دهنده‌ها</h3>
            </div>
            <div className="space-y-3">
              {advertiserSteps.map((step, i) => (
                <Card key={step.title} className="flex items-start gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-tl from-brand-600 to-accent-500 text-xs font-bold text-white">
                    {(i + 1).toLocaleString('fa-IR')}
                  </span>
                  <div>
                    <p className="font-medium text-heading">{step.title}</p>
                    <p className="mt-0.5 text-sm text-subtle">{step.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-accent-400/10 text-accent-500">
                <Camera className="size-4" />
              </span>
              <h3 className="font-bold text-heading">برای سفیرها (صاحبان پیج)</h3>
            </div>
            <div className="space-y-3">
              {ambassadorSteps.map((step, i) => (
                <Card key={step.title} className="flex items-start gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-tl from-accent-500 to-brand-500 text-xs font-bold text-white">
                    {(i + 1).toLocaleString('fa-IR')}
                  </span>
                  <div>
                    <p className="font-medium text-heading">{step.title}</p>
                    <p className="mt-0.5 text-sm text-subtle">{step.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-100/60 py-16 dark:bg-slate-900/40">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-heading">همه‌چیز برای یه همکاری مطمئن</h2>
            <p className="mt-2 text-sm text-faint">امکاناتی که به هر دو طرف اطمینان می‌ده</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} hover>
                <span className="mb-3 flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-50 to-accent-400/10 text-brand-500 ring-1 ring-slate-200/70 dark:from-brand-500/10 dark:to-accent-500/5 dark:text-brand-400 dark:ring-slate-800">
                  <feature.icon className="size-5" strokeWidth={1.75} />
                </span>
                <p className="font-medium text-heading">{feature.title}</p>
                <p className="mt-1 text-sm text-subtle">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-heading sm:text-3xl">آماده‌ای شروع کنی؟</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-subtle sm:text-base">
          همین حالا ثبت‌نام کن — چه به دنبال معرفی برندت به مخاطب واقعی باشی، چه بخوای از پیج اینستاگرامت درآمد کسب کنی.
        </p>
        <div className="mt-7 flex justify-center">
          <Link to="/register">
            <Button size="md">
              ثبت‌نام رایگان
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  )
}
