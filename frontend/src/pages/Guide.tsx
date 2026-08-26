import { useState } from 'react'
import {
  BadgeCheck,
  Camera,
  CheckCircle2,
  Clock,
  CreditCard,
  ImagePlus,
  Megaphone,
  UserPlus,
  Wallet,
} from 'lucide-react'
import { PublicLayout } from '../components/PublicLayout'
import { Card } from '../components/ui/Card'

type Audience = 'advertiser' | 'ambassador'

const advertiserGuide = [
  {
    icon: UserPlus,
    title: '۱. ثبت‌نام و ورود',
    description:
      'از صفحه‌ی ثبت‌نام، حساب «آگهی‌دهنده» بساز. ایمیل و رمز عبور کافیه؛ شماره موبایل رو هم بذار چون پیامک‌های اطلاع‌رسانی (تخصیص، تایید بازدید و...) از همون طریق ارسال می‌شه.',
  },
  {
    icon: CreditCard,
    title: '۲. شارژ کیف‌پول',
    description:
      'از منوی «کیف‌پول»، مبلغ دلخواه رو وارد کن و از طریق درگاه پرداخت زرین‌پال شارژ کن. این موجودی برای تامین بودجه‌ی کمپین‌هات استفاده می‌شه.',
  },
  {
    icon: Megaphone,
    title: '۳. ساخت کمپین',
    description:
      'از «کمپین‌ها → کمپین جدید»، عنوان، توضیحات، تصویر تبلیغاتی، دسته‌بندی، قیمت هر ۱۰۰۰ بازدید، بودجه‌ی کل و استان‌های هدف رو مشخص کن.',
  },
  {
    icon: Clock,
    title: '۴. بررسی و فعال‌سازی',
    description:
      'کمپین ابتدا به‌صورت پیش‌نویسه. بعد از ثبت نهایی، ادمین بررسیش می‌کنه و در صورت تایید، فعالش می‌کنه — از همون لحظه موتور تخصیص خودکار شروع به کار می‌کنه.',
  },
  {
    icon: BadgeCheck,
    title: '۵. پیگیری نتایج',
    description:
      'از صفحه‌ی جزئیات کمپین، لیست سفیرهای تخصیص‌داده‌شده، وضعیت هرکدوم (تخصیص‌شده، پست‌شده، در انتظار بررسی، تاییدشده) و بازدید تحویل‌شده رو لحظه‌به‌لحظه می‌بینی.',
  },
]

const ambassadorGuide = [
  {
    icon: UserPlus,
    title: '۱. ثبت‌نام و ورود',
    description: 'حساب «سفیر» بساز. شماره موبایلت رو حتماً وارد کن — تخصیص کمپین و نتیجه‌ی بررسی از همون طریق اطلاع‌رسانی می‌شه.',
  },
  {
    icon: Camera,
    title: '۲. تکمیل پروفایل پیج',
    description:
      'از «پروفایل»، نام‌کاربری اینستاگرام، دسته‌بندی محتوا، استان و شهر، تعداد فالوور و میانگین بازدید استوری‌هاتو ثبت کن. این اطلاعات مبنای تخصیص خودکار کمپینه.',
  },
  {
    icon: Clock,
    title: '۳. منتظر تخصیص باش',
    description:
      'به‌محض این‌که کمپینی متناسب با دسته‌بندی، استان و سطح حسابت فعال بشه، به‌صورت خودکار بهت تخصیص داده می‌شه و پیامک تخصیص رو دریافت می‌کنی.',
  },
  {
    icon: ImagePlus,
    title: '۴. انتشار استوری و ثبت اسکرین‌شات',
    description:
      'استوری تبلیغاتی رو تا مهلت تعیین‌شده منتشر کن، بعد از گذشت چند ساعت از صفحه‌ی «کمپین‌های من»، اسکرین‌شات بازدید استوری رو همراه با عدد بازدید ثبت کن.',
  },
  {
    icon: Wallet,
    title: '۵. دریافت و برداشت درآمد',
    description:
      'وقتی ادمین بازدیدت رو تایید کرد، مبلغ متناسب باهاش به کیف‌پولت اضافه می‌شه. هر وقت خواستی از «کیف‌پول»، درخواست برداشت بده تا بعد از تایید ادمین واریز بشه.',
  },
]

const faqs = [
  {
    question: 'کمپین‌ها چطور به سفیرها تخصیص داده می‌شن؟',
    answer:
      'به‌صورت خودکار و بر اساس تطابق دسته‌بندی پیج و استان هدف کمپین. سفیرهایی که فعلاً ظرفیت خالی دارن (بر اساس سطح حسابشون) در اولویت‌ان.',
  },
  {
    question: 'پرداخت‌ها چطور محاسبه می‌شه؟',
    answer:
      'بر اساس «قیمت هر ۱۰۰۰ بازدید» که آگهی‌دهنده موقع ساخت کمپین تعیین کرده، ضرب در تعداد بازدید تاییدشده توسط ادمین — نه عدد اعلام‌شده توسط سفیر.',
  },
  {
    question: 'سطح حساب سفیر چه فرقی می‌کنه؟',
    answer:
      'سطح بالاتر یعنی می‌تونی هم‌زمان تو کمپین‌های بیشتری شرکت کنی. با تایید شدن بازدیدهات به‌صورت خودکار ارتقا می‌گیری.',
  },
  {
    question: 'اگه اسکرین‌شاتم رد بشه چی می‌شه؟',
    answer:
      'دلیل رد رو تو پنل می‌بینی و هم پیامک اطلاع‌رسانی دریافت می‌کنی. تخصیص اون کمپین بسته می‌شه، ولی حساب و سطحت تحت‌تاثیر قرار نمی‌گیره.',
  },
]

export function Guide() {
  const [audience, setAudience] = useState<Audience>('advertiser')
  const steps = audience === 'advertiser' ? advertiserGuide : ambassadorGuide

  return (
    <PublicLayout>
      <section className="mx-auto max-w-3xl px-6 py-14 text-center">
        <h1 className="text-3xl font-extrabold text-heading">راهنمای استفاده از ادیار</h1>
        <p className="mt-3 text-sm text-subtle sm:text-base">
          یه مسیر گام‌به‌گام برای شروع، چه آگهی‌دهنده باشی چه سفیر
        </p>

        <div className="mx-auto mt-8 grid max-w-sm grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setAudience('advertiser')}
            className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
              audience === 'advertiser'
                ? 'border-brand-400 bg-brand-50 text-brand-700 ring-2 ring-brand-100 dark:bg-brand-500/10 dark:text-brand-400'
                : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600'
            }`}
          >
            <Megaphone className="size-4" />
            آگهی‌دهنده‌ها
          </button>
          <button
            type="button"
            onClick={() => setAudience('ambassador')}
            className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
              audience === 'ambassador'
                ? 'border-brand-400 bg-brand-50 text-brand-700 ring-2 ring-brand-100 dark:bg-brand-500/10 dark:text-brand-400'
                : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600'
            }`}
          >
            <Camera className="size-4" />
            سفیرها
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pb-16">
        <div className="animate-fade-in space-y-4">
          {steps.map((step) => (
            <Card key={step.title} className="flex items-start gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-slate-200/70 dark:bg-brand-500/10 dark:text-brand-400 dark:ring-slate-800">
                <step.icon className="size-5" strokeWidth={1.75} />
              </span>
              <div>
                <p className="font-medium text-heading">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-subtle">{step.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-slate-100/60 py-16 dark:bg-slate-900/40">
        <div className="mx-auto max-w-3xl px-6">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-heading">سوالات پرتکرار</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <Card key={faq.question} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-500 dark:text-brand-400" strokeWidth={1.75} />
                <div>
                  <p className="font-medium text-heading">{faq.question}</p>
                  <p className="mt-1 text-sm leading-relaxed text-subtle">{faq.answer}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
