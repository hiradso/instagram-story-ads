import { useState } from 'react'
import { Check, ChevronDown, Copy, Link2 } from 'lucide-react'
import { Label, TextInput } from './Field'

/**
 * Client-only UTM link generator — appends utm_source/utm_medium/
 * utm_campaign to a target URL so an ambassador or advertiser can track
 * click-throughs from a specific story placement (e.g. in Google Campaign
 * Manager). No external API involved, just string building.
 */
export function UtmLinkBuilder({ defaultCampaign, defaultSource }: { defaultCampaign: string; defaultSource: string }) {
  const [open, setOpen] = useState(false)
  const [targetUrl, setTargetUrl] = useState('')
  const [source, setSource] = useState(defaultSource)
  const [medium, setMedium] = useState('instagram-story')
  const [campaign, setCampaign] = useState(defaultCampaign)
  const [copied, setCopied] = useState(false)

  let generatedUrl = ''
  if (targetUrl.trim()) {
    try {
      const url = new URL(targetUrl.trim())
      if (source) url.searchParams.set('utm_source', source)
      if (medium) url.searchParams.set('utm_medium', medium)
      if (campaign) url.searchParams.set('utm_campaign', campaign)
      generatedUrl = url.toString()
    } catch {
      generatedUrl = ''
    }
  }

  function copy() {
    if (!generatedUrl) return
    navigator.clipboard.writeText(generatedUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300"
      >
        <span className="flex items-center gap-1.5">
          <Link2 className="size-4" />
          ساخت لینک ردیابی (UTM)
        </span>
        <ChevronDown className={`size-4 text-faint transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="animate-fade-in space-y-3 border-t border-slate-200 p-3.5 dark:border-slate-700">
          <div>
            <Label>لینک مقصد</Label>
            <TextInput
              type="url"
              placeholder="https://example.com/product"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label>utm_source</Label>
              <TextInput value={source} onChange={(e) => setSource(e.target.value)} />
            </div>
            <div>
              <Label>utm_medium</Label>
              <TextInput value={medium} onChange={(e) => setMedium(e.target.value)} />
            </div>
            <div>
              <Label>utm_campaign</Label>
              <TextInput value={campaign} onChange={(e) => setCampaign(e.target.value)} />
            </div>
          </div>

          {generatedUrl && (
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
              <p className="flex-1 truncate text-xs text-subtle" dir="ltr">
                {generatedUrl}
              </p>
              <button
                type="button"
                onClick={copy}
                className="flex shrink-0 items-center gap-1 rounded-lg bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copied ? 'کپی شد' : 'کپی'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
