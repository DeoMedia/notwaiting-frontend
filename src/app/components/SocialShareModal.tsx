import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export type SharePlatform = 'twitter' | 'linkedin' | 'facebook' | 'instagram'

interface Props {
  open: boolean
  platform: SharePlatform | null
  onContinue: () => void
  onCancel: () => void
}

const PLATFORM_LABEL: Record<SharePlatform, string> = {
  twitter: 'X (Twitter)',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  instagram: 'Instagram',
}

export function SocialShareModal({ open, platform, onContinue, onCancel }: Props) {
  const { t } = useTranslation()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onCancel])

  if (!open || !platform) return null

  const platformName = PLATFORM_LABEL[platform]
  // Twitter still accepts pre-filled text via URL params, so its body
  // copy differs — no paste step is needed for X.
  const prefilled = platform === 'twitter'
  const bodyKey = prefilled ? 'share.modal.bodyPrefilled' : 'share.modal.bodyCopied'
  const bodyFallback = prefilled
    ? `Your story is ready to post on ${platformName}. Click Continue to open ${platformName} — your story will be pre-filled.`
    : `Your story has been copied. Click Continue to open ${platformName}, then paste it into the post window (Cmd / Ctrl + V on desktop, long-press → Paste on mobile).`

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      onClick={onCancel}
    >
      <div
        className="bg-white max-w-md w-full p-6 border-2 border-[#0C0C0A] shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="share-modal-title"
          className="text-2xl font-black uppercase tracking-tight mb-3"
        >
          {t('share.modal.title', { defaultValue: 'Almost there' })}
        </h2>
        <p className="font-mono text-sm text-[#0C0C0A]/80 leading-relaxed">
          {t(bodyKey, { platform: platformName, defaultValue: bodyFallback })}
        </p>

        {!prefilled && (
          <ul className="mt-4 space-y-2 font-mono text-xs text-[#0C0C0A]/70 list-decimal list-inside">
            <li>{t('share.modal.step1', { platform: platformName, defaultValue: `${platformName} opens in a new tab.` })}</li>
            <li>{t('share.modal.step2', { defaultValue: 'Start a new post and paste your story (Cmd / Ctrl + V, or long-press → Paste).' })}</li>
            <li>{t('share.modal.step3', { defaultValue: 'Publish — done.' })}</li>
          </ul>
        )}

        <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border-2 border-[#0C0C0A] text-[#0C0C0A] font-mono font-bold text-sm uppercase tracking-wide hover:bg-[#0C0C0A] hover:text-white transition-colors"
          >
            {t('share.modal.cancel', { defaultValue: 'Cancel' })}
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="flex-1 px-4 py-2 bg-[#DD3935] text-white font-mono font-bold text-sm uppercase tracking-wide hover:bg-[#c42f2b] transition-colors"
          >
            {t('share.modal.continue', {
              platform: platformName,
              defaultValue: `Continue to ${platformName} →`,
            })}
          </button>
        </div>
      </div>
    </div>
  )
}
