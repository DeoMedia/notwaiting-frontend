import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { claimSignerSession, ApiError } from '../utils/api'

type ClaimStatus = 'pending' | 'success' | 'invalid' | 'error'

// /welcome — the landing page reached by clicking the magic link in the
// confirmation email. Reads ?t=<token>&id=<signerId>, posts them to the
// /api/manifesto/claim endpoint, and on success the backend sets the
// HttpOnly nw_signer cookie. Publishing still happens from the story form;
// this page only verifies the email/device.
export default function Welcome() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<ClaimStatus>('pending')
  const [firstName, setFirstName] = useState<string>('')
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
            onClick={() => navigate('/')}
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
          {t('welcome.successBody', { defaultValue: 'Your email is verified. Return to the form to publish your story, or pick what’s next:' })}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            onClick={() => navigate('/get-mark')}
            className="bg-[#DD3935] text-white px-6 py-3 font-bold uppercase tracking-wide hover:bg-[#C92F2B] transition-colors"
          >
            {t('welcome.getWaveMark', { defaultValue: 'Get my wave mark' })}
          </button>
          <button
            onClick={() => navigate('/', { state: { scrollTo: 'signOn' } })}
            className="border-2 border-[#0C0C0A] px-6 py-3 font-bold uppercase tracking-wide hover:bg-[#0C0C0A] hover:text-white transition-colors"
          >
            {t('welcome.writeStory', { defaultValue: 'Write your story' })}
          </button>
        </div>
      </div>
    </div>
  )
}
