/**
 * Gregorian <-> Jalali (Persian/Hijri-Shamsi) calendar conversion, based
 * on the well-known algorithm by Kazimierz M. Borkowski (as widely used
 * in the jalaali-js library). Implemented directly here — no dependency —
 * since the app has no calendar/date library installed and this is the
 * only place that needs one.
 */

function div(a: number, b: number): number {
  return ~~(a / b)
}

function mod(a: number, b: number): number {
  return a - ~~(a / b) * b
}

const breaks = [-61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192, 2262, 2324, 2394, 2456, 3178]

function jalCal(jy: number) {
  const bl = breaks.length
  const gy = jy + 621
  let leapJ = -14
  let jp = breaks[0]

  if (jy < jp || jy >= breaks[bl - 1]) throw new Error(`Invalid Jalali year ${jy}`)

  let jump = 0
  for (let i = 1; i < bl; i += 1) {
    const jm = breaks[i]
    jump = jm - jp
    if (jy < jm) break
    leapJ = leapJ + div(jump, 33) * 8 + div(mod(jump, 33), 4)
    jp = jm
  }

  let n = jy - jp
  leapJ = leapJ + div(n, 33) * 8 + div(mod(n, 33) + 3, 4)
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1

  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150
  const march = 20 + leapJ - leapG

  if (jump - n < 6) n = n - jump + div(jump, 33) * 33
  let leap = mod(mod(n + 1, 33) - 1, 4)
  if (leap === -1) leap = 4

  return { leap, gy, march }
}

function g2d(gy: number, gm: number, gd: number): number {
  let d =
    div((gy + div(gm - 8, 6) + 100100) * 1461, 4) + div(153 * mod(gm + 9, 12) + 2, 5) + gd - 34840408
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752
  return d
}

function d2g(jdn: number): { gy: number; gm: number; gd: number } {
  let j = 4 * jdn + 139361631
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908
  const i = div(mod(j, 1461), 4) * 5 + 308
  const gd = div(mod(i, 153), 5) + 1
  const gm = mod(div(i, 153), 12) + 1
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6)
  return { gy, gm, gd }
}

function j2d(jy: number, jm: number, jd: number): number {
  const r = jalCal(jy)
  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1
}

function d2j(jdn: number): { jy: number; jm: number; jd: number } {
  const gy = d2g(jdn).gy
  let jy = gy - 621
  const r = jalCal(jy)
  const jdn1f = g2d(gy, 3, r.march)
  let jd: number
  let jm: number
  let k = jdn - jdn1f

  if (k >= 0) {
    if (k <= 185) {
      jm = 1 + div(k, 31)
      jd = mod(k, 31) + 1
      return { jy, jm, jd }
    }
    k -= 186
  } else {
    jy -= 1
    k += 179
    if (r.leap === 1) k += 1
  }

  jm = 7 + div(k, 30)
  jd = mod(k, 30) + 1
  return { jy, jm, jd }
}

export interface JalaliDate {
  year: number
  month: number // 1-12
  day: number
}

export function gregorianToJalali(gy: number, gm: number, gd: number): JalaliDate {
  const { jy, jm, jd } = d2j(g2d(gy, gm, gd))
  return { year: jy, month: jm, day: jd }
}

export function jalaliToGregorian(jy: number, jm: number, jd: number): { year: number; month: number; day: number } {
  const { gy, gm, gd } = d2g(j2d(jy, jm, jd))
  return { year: gy, month: gm, day: gd }
}

export function isLeapJalaliYear(jy: number): boolean {
  return jalCal(jy).leap === 0
}

export function jalaliMonthLength(jy: number, jm: number): number {
  if (jm <= 6) return 31
  if (jm <= 11) return 30
  return isLeapJalaliYear(jy) ? 30 : 29
}

export const jalaliMonthNames = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
]

export const jalaliWeekdayNames = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']

/** ISO date string (YYYY-MM-DD, Gregorian) -> Jalali, or null if empty/invalid. */
export function isoToJalali(iso: string): JalaliDate | null {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return null
  return gregorianToJalali(y, m, d)
}

/** Jalali -> ISO date string (YYYY-MM-DD, Gregorian) for the API. */
export function jalaliToIso(jy: number, jm: number, jd: number): string {
  const { year, month, day } = jalaliToGregorian(jy, jm, jd)
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** Day-of-week for a Jalali date, Saturday-first (0 = شنبه ... 6 = جمعه). */
export function jalaliWeekday(jy: number, jm: number, jd: number): number {
  const { year, month, day } = jalaliToGregorian(jy, jm, jd)
  // getUTCDay(): 0=Sunday..6=Saturday -> rotate so Saturday=0.
  const gregorianDow = new Date(Date.UTC(year, month - 1, day)).getUTCDay()
  return (gregorianDow + 1) % 7
}

export function formatJalali(date: JalaliDate | null): string {
  if (!date) return ''
  return `${date.year.toLocaleString('fa-IR', { useGrouping: false })} ${jalaliMonthNames[date.month - 1]} ${date.day.toLocaleString('fa-IR')}`
}
