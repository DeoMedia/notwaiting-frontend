import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { claimSignerSession, publishStory, ApiError } from '../utils/api'

type ClaimStatus = 'pending' | 'success' | 'invalid' | 'error'

const PENDING_STORY_KEY = 'nw_pending_story'

// Drains and posts a story stashed in sessionStorage by the manifesto form.
// Best-effort: any failure leaves the stash in place so the user can retry
// (e.g. by re-clicking the magic link). Returns true when a story is
// successfully published this call.
async function publishPendingStory(signerId: string): Promise<boolean> {
  let raw: string | null = null
  try { raw = sessionStorage.getItem(PENDING_STORY_KEY) } catch { return false }
  if (!raw) return false
  let pending: { caption?: unknown; waveTag?: unknown }
  try { pending = JSON.parse(raw) } catch { return false }
  const caption = typeof pending.caption === 'string' ? pending.caption.trim() : ''
  const waveTag = typeof pending.waveTag === 'string' ? pending.waveTag : ''
  if (!caption || !waveTag) {
    try { sessionStorage.removeItem(PENDING_STORY_KEY) } catch { /* ignore */ }
    return false
  }
  try {
    await publishStory({ signerId, caption, waveTag })
    try { sessionStorage.removeItem(PENDING_STORY_KEY) } catch { /* ignore */ }
    return true
  } catch {
    return false
  }
}

// /welcome — the landing page reached by clicking the magic link in the
// confirmation email. Reads ?t=<token>&id=<signerId>, posts them to the
// /api/manifesto/claim endpoint, and on success the backend sets the
// HttpOnly nw_signer cookie. From this point on the SPA is "claimed":
// publishStory and trackAction work as normal.
export default function Welcome() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<ClaimStatus>('pending')
  const [firstName, setFirstName] = useState<string>('')
  const [storyOutcome, setStoryOutcome] = useState<'none' | 'published' | 'failed'>('none')
  // Avoid double-claiming in React 18 StrictMode (effects run twice in dev).
  const hasAttempted = useRef(false)

  useEffect(() => {
    if (hasAttempted.current) return
    hasAttempted.current = true

    const token = searchParams.get('t') ?? ''
    const signerId = searchParams.get('id') ?? ''

    if (!token || !signerId) {
      setStatus('invalid')
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const result = await claimSignerSession({ signerId, token })
        if (cancelled) return
        setFirstName(result.firstName ?? '')
        try { sessionStorage.setItem('nw_first_name', result.firstName ?? '') } catch { /* ignore */ }
        // If the user typed a story on the manifesto form before verifying,
        // publish it now — we finally have the cookie /api/stories needs.
        const hadPending = (() => {
          try { return Boolean(sessionStorage.getItem(PENDING_STORY_KEY)) } catch { return false }
        })()
        if (hadPending) {
          const published = await publishPendingStory(result.signerId)
          if (!cancelled) setStoryOutcome(published ? 'published' : 'failed')
        }
        if (!cancelled) setStatus('success')
      } catch (err) {
        if (cancelled) return
        if (err instanceof ApiError && err.status === 401) {
          setStatus('invalid')
        } else {
          setStatus('error')
        }
      }
    })()

    return () => { cancelled = true }
  }, [searchParams])

  // ── States ────────────────────────────────────────────────
  if (status === 'pending') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-8 h-8 border-2 border-[#DD3935] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="font-mono text-sm text-[#0C0C0A]/70">
            {t('welcome.verifying', { defaultValue: 'Confirming your link…' })}
          </p>
        </div>
      </div>
    )
  }

  if (status === 'invalid') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-black uppercase tracking-tight mb-3">
            {t('welcome.invalidTitle', { defaultValue: 'This link has expired.' })}
          </h1>
          <p className="text-base text-[#0C0C0A]/70 mb-8">
            {t('welcome.invalidBody', { defaultValue: 'Sign the manifesto again and we’ll send you a fresh link.' })}
          </p>
          <button
            onClick={() => navigate('/manifesto')}
            className="border-2 border-[#0C0C0A] px-8 py-3 font-bold uppercase tracking-wide hover:bg-[#0C0C0A] hover:text-white transition-colors"
          >
            {t('welcome.goToManifesto', { defaultValue: 'Sign the manifesto' })}
          </button>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-black uppercase tracking-tight mb-3">
            {t('welcome.errorTitle', { defaultValue: 'Something went wrong.' })}
          </h1>
          <p className="text-base text-[#0C0C0A]/70 mb-8">
            {t('welcome.errorBody', { defaultValue: 'We couldn’t confirm your link. Please try again in a moment.' })}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="border-2 border-[#0C0C0A] px-8 py-3 font-bold uppercase tracking-wide hover:bg-[#0C0C0A] hover:text-white transition-colors"
          >
            {t('common.tryAgain', { defaultValue: 'Try again' })}
          </button>
        </div>
      </div>
    )
  }

  // Success
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6 py-16">
      <div className="text-center max-w-2xl space-y-6">
        <div className="font-mono text-xs tracking-widest uppercase text-[#DD3935] font-bold">
          {t('welcome.confirmedEyebrow', { defaultValue: 'Email confirmed' })}
        </div>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight">
          {firstName
            ? t('welcome.successTitleNamed', { name: firstName, defaultValue: `You're in, ${firstName}.` })
            : t('welcome.successTitle', { defaultValue: 'You’re in.' })}
        </h1>
        <p className="text-lg text-[#0C0C0A]/70">
          {t('welcome.successBody', { defaultValue: 'Your story is on the wall and your wave mark is ready. Pick what’s next:' })}
        </p>
        {storyOutcome === 'published' && (
          <p className="font-mono text-sm text-[#027A4F] font-bold">
            {t('welcome.storyPublished', { defaultValue: 'Your story is now live on the Stories Wall.' })}
          </p>
        )}
        {storyOutcome === 'failed' && (
          <p className="font-mono text-sm text-[#DD3935] font-bold">
            {t('welcome.storyFailed', { defaultValue: 'We couldn’t post your story automatically. Open the Stories form and publish from there.' })}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            onClick={() => navigate('/get-mark')}
            className="bg-[#DD3935] text-white px-6 py-3 font-bold uppercase tracking-wide hover:bg-[#C92F2B] transition-colors"
          >
            {t('welcome.getWaveMark', { defaultValue: 'Get my wave mark' })}
          </button>
          <button
            onClick={() => navigate('/stories')}
            className="border-2 border-[#0C0C0A] px-6 py-3 font-bold uppercase tracking-wide hover:bg-[#0C0C0A] hover:text-white transition-colors"
          >
            {t('welcome.viewStories', { defaultValue: 'See the stories wall' })}
          </button>
        </div>
      </div>
    </div>
  )
}
