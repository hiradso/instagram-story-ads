import { Link } from 'react-router-dom'
import { Camera, Heart, Megaphone, ShieldCheck, Target, Users } from 'lucide-react'
import { PublicLayout } from '../components/PublicLayout'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

const values = [
  {
    icon: Target,
    title: 'شفافیت',
    description: 'هر تخصیص، هر پرداخت و هر بازدید قابل پیگیریه — چیزی پشت پرده نمی‌مونه.',
  },
  {
    icon: ShieldCheck,
    title: 'اعتماد دوطرفه',
    description: 'آگهی‌دهنده فقط بابت نتیجه‌ی تاییدشده پرداخت می‌کنه، سفیر هم مطمئنه درآمدش قابل برداشته.',
  },
  {
    icon: Users,
    title: 'ارتباط مستقیم',
    description: 'بدون واسطه‌ی گرون و کند — برند و صاحب پیج مستقیم از طریق پلتفرم به هم وصل می‌شن.',
  },
]

export function About() {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 ring-1 ring-brand-200 dark:bg-brand-500/10 dark:text-brand-400 dark:ring-brand-500/20">
          <Heart className="size-3.5" />
          درباره‌ی ادیار
        </span>
        <h1 className="text-3xl font-extrabold text-heading sm:text-4xl">یه پل ساده بین برند و مخاطب واقعی</h1>
        <p className="mt-4 text-base leading-relaxed text-subtle">
          ادیار برای حل یه مشکل ساده ساخته شده: برندها برای دیده‌شدن به صاحبان پیج‌های اینستاگرام نیاز دارن، و
          صاحبان پیج هم به‌دنبال راهی مطمئن برای کسب درآمد از محتواشون‌ان. ما این دو طرف رو بدون نیاز به چانه‌زنی،
          پیگیری دستی یا نگرانی از پرداخت‌نشدن، به هم وصل می‌کنیم.
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="grid gap-6 sm:grid-cols-2">
          <Card className="flex flex-col gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              <Megaphone className="size-5" strokeWidth={1.75} />
            </span>
            <h2 className="font-bold text-heading">برای آگهی‌دهنده‌ها</h2>
            <p className="text-sm leading-relaxed text-subtle">
              دیگه لازم نیست دستی دنبال صاحب پیج مرتبط بگردی و رو قول شفاهی حساب کنی. کمپینت رو بساز، ادیار
              اون رو به سفیرهای واقعاً مرتبط با حوزه‌ی کسب‌وکارت تخصیص می‌ده، و تو فقط بابت بازدید واقعی و
              تاییدشده هزینه می‌کنی.
            </p>
          </Card>

          <Card className="flex flex-col gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-accent-400/10 text-accent-500">
              <Camera className="size-5" strokeWidth={1.75} />
            </span>
            <h2 className="font-bold text-heading">برای سفیرها</h2>
            <p className="text-sm leading-relaxed text-subtle">
              اگه پیج اینستاگرامت مخاطب واقعی داره، ادیار راهی مستقیم برای تبدیل اون مخاطب به درآمده — بدون
              واسطه، بدون تاخیر تو پرداخت، و با کمپین‌هایی که واقعاً به حوزه‌ی پیجت مرتبطن.
            </p>
          </Card>
        </div>
      </section>

      <section className="bg-slate-100/60 py-16 dark:bg-slate-900/40">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-heading">اصولی که کارمون رو شکل می‌ده</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {values.map((value) => (
              <Card key={value.title} className="text-center">
                <span className="mx-auto mb-3 flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-slate-200/70 dark:bg-brand-500/10 dark:text-brand-400 dark:ring-slate-800">
                  <value.icon className="size-5" strokeWidth={1.75} />
                </span>
                <p className="font-medium text-heading">{value.title}</p>
                <p className="mt-1 text-sm text-subtle">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h2 className="text-xl font-bold text-heading">دوست داری همکاری کنیم؟</h2>
        <p className="mt-2 text-sm text-subtle">همین حالا ثبت‌نام کن، چه آگهی‌دهنده‌ای چه سفیر.</p>
        <div className="mt-6 flex justify-center">
          <Link to="/register">
            <Button size="md">شروع کن</Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  )
}
