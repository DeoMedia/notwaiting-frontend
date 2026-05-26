import { useState, useRef, forwardRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { signManifesto, publishStory, trackAction, getStoredSignerId, resendVerificationEmail } from '../utils/api';
import { Honeypot } from './Honeypot';
import { Captcha, isCaptchaEnabled, type CaptchaHandle } from './Captcha';
import { formatSubmitError } from '../utils/submitError';
import { copyToClipboard } from '../utils/clipboard';
import { SocialShareModal, type SharePlatform } from './SocialShareModal';
import waveImage from '../../styles/waves.png';
import { AiStoryQuestionnaire } from './AiStoryQuestionnaire';
import { useLocalizedCountriesWithPlaceholder, useLocalizedSectors } from '../i18n/hooks';
import {
  LIMITS,
  validateManifesto,
  firstError,
  type ManifestoField,
  type ValidationErrors,
} from '../utils/validation';

interface Props {
  onSuccess: (signerId: string, firstName: string) => void
}

type ShareIntent = 'wall' | 'twitter' | 'linkedin' | 'facebook' | 'instagram'

export const ManifestoSignForm = forwardRef<HTMLDivElement, Props>(
  ({ onSuccess }, ref) => {
    const navigate = useNavigate()
    const { t } = useTranslation()
    const countryOptions = useLocalizedCountriesWithPlaceholder()
    const sectors = useLocalizedSectors()
    const waveOptions = [
      { value: '', label: t('signForm.sectorPlaceholder') },
      ...sectors.map(s => ({ value: s.value, label: s.label })),
    ]
    const [formData, setFormData] = useState({
      firstName: '', country: '', email: '', wave: '', waveOther: '', subject: 'me', story: '',
    })
    const [loading, setLoading]         = useState(false)
    const [activeIntent, setActiveIntent] = useState<ShareIntent | null>(null)
    const [showShareOptions, setShowShareOptions] = useState(false)
    const [error, setError]             = useState('')
    const [retryableIntent, setRetryableIntent] = useState<ShareIntent | null>(null)
    const [errorKind, setErrorKind]     = useState<'none' | 'info' | 'captcha' | 'network' | 'verification' | 'other'>('none')
    const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle')
    // Pending share — we show the modal first and only open the platform when
    // the user clicks Continue. The callback captures everything that should
    // happen on confirmation (window.open, clipboard, tracking, post-share
    // transitions) so each call site can supply its own follow-up actions.
    const [pendingShare, setPendingShare] = useState<{
      platform: SharePlatform
      onContinue: () => void
    } | null>(null)
    const [fieldErrors, setFieldErrors] = useState<ValidationErrors<ManifestoField>>({})
    const [submitted, setSubmitted]     = useState(false)
    const [isLeaving, setIsLeaving]     = useState(false)
    const [successVisible, setSuccessVisible] = useState(false)
    const [signerId, setSignerId]       = useState<string | null>(null)
    // First-time signer who must still click the magic link in their email
    // before the story we just stashed gets published. Drives the verify-copy
    // success screen (vs. the "story is live" screen used for returning signers).
    const [verifyState, setVerifyState] = useState<{ email: string; hadStory: boolean } | null>(null)
    const [showAiHelper, setShowAiHelper] = useState(false)
    const [honeypot, setHoneypot]       = useState('')
    const [captchaToken, setCaptchaToken] = useState('')
    const captchaRef = useRef<CaptchaHandle>(null)

    // Clear any previously-issued hCaptcha token and ask the widget to show
    // a fresh challenge. Called after every failed submit so the user isn't
    // stuck re-sending a stale (single-use) token on retry.
    const resetCaptcha = () => {
      setCaptchaToken('')
      captchaRef.current?.reset()
    }

    // Clear stale story-empty error as soon as the story field has content
    useEffect(() => {
      if (formData.story.trim()) {
        if (error === t('validation.storyRequired')) {
          setError('')
          setErrorKind('none')
        }
      }
    }, [formData.story, error, t])

    // Scrolls to the section top and triggers the slide-in transition
    useEffect(() => {
      if (submitted) {
        (ref as React.RefObject<HTMLDivElement>)?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        requestAnimationFrame(() => requestAnimationFrame(() => setSuccessVisible(true)))
      }
    }, [submitted])

    const getManualShareText = () => {
      const story = formData.story.trim() || t('signForm.manualShareText')
      return `${story}\n\n#NotWaiting`
    }

    const trackSocial = async (platform: string) => {
      if (!signerId) return
      await trackAction({ signerId, action: 'shared_social', metadata: { platform, source: 'manual_manifesto' } })
    }

    const runValidation = () => {
      const result = validateManifesto(formData, { requireWave: true, requireStory: true }, t)
      setFieldErrors(result.errors)
      if (!result.valid) {
        setError(firstError(result.errors) ?? t('signForm.pleaseComplete'))
        setErrorKind('other')
      } else {
        setError('')
        setErrorKind('none')
      }
      return result.valid
    }

    const updateField = <K extends keyof typeof formData>(key: K, value: typeof formData[K]) => {
      setFormData(prev => ({ ...prev, [key]: value }))
      if (fieldErrors[key as ManifestoField]) {
        setFieldErrors(prev => ({ ...prev, [key]: undefined }))
      }
    }

    // Opens the platform window after the share modal's Continue button.
    // Web Share API was tried earlier but iOS LinkedIn / Facebook /
    // Instagram apps discard the `text` field when a `url` is present in
    // the share intent (they categorize it as a link share and use URL
    // preview only). Result: story stripped. We standardized on
    // copy-to-clipboard + open-platform-URL for all devices so the story
    // always lands somewhere the user can paste into.
    //
    // ORDER MATTERS: clipboard write must happen BEFORE window.open. The
    // new tab steals focus and modern browsers silently reject
    // navigator.clipboard.writeText() from an unfocused document. We use
    // the project's copyToClipboard helper (synchronous, execCommand-based)
    // because it doesn't need document focus.
    const executeShare = (platform: SharePlatform, shareText: string) => {
      if (platform !== 'twitter') {
        void copyToClipboard(shareText)
      }
      switch (platform) {
        case 'twitter':
          // X's intent URL takes only `text` — no URL parameter is sent, so
          // the shared post is just the story + hashtag.
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank', 'noopener,noreferrer')
          break
        case 'linkedin':
          // `?shareActive=true` opens LinkedIn's post-composer modal
          // directly (same as clicking "Start a post" on the feed). Avoids
          // share-offsite, which requires a `url` param that would
          // auto-embed the link in the post.
          window.open('https://www.linkedin.com/feed/?shareActive=true', '_blank', 'noopener,noreferrer')
          break
        case 'facebook':
          // Facebook has no public composer-only URL — sharer.php requires
          // `u=` (which would auto-embed the link). Open the home feed;
          // the "What's on your mind?" entry is right at the top.
          window.open('https://www.facebook.com/', '_blank', 'noopener,noreferrer')
          break
        case 'instagram':
          // Instagram has no web composer; opening the site surfaces the
          // "Open in app" prompt on mobile. User pastes the caption.
          window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer')
          break
      }
    }

    // Queues a share — the modal appears first explaining the copy-and-paste
    // flow, then on Continue the clipboard is written and the platform URL
    // is opened. We use this on both mobile and desktop: Web Share API was
    // tested but iOS LinkedIn/Facebook/Instagram apps strip the story text
    // when sharing through their share extensions, so copy-and-paste is the
    // only reliable cross-device path.
    const requestShare = (
      platform: SharePlatform,
      shareText: string,
      options: { signerIdForTracking?: string; trackingSource: string; afterShare?: () => void } = { trackingSource: 'manual_manifesto' },
    ) => {
      setPendingShare({
        platform,
        onContinue: () => {
          executeShare(platform, shareText)
          if (options.signerIdForTracking) {
            void trackAction({
              signerId: options.signerIdForTracking,
              action: 'shared_social',
              metadata: { platform, source: options.trackingSource },
            })
          }
          options.afterShare?.()
        },
      })
    }

    const handleResendVerification = async () => {
      const signerIdForResend = getStoredSignerId()
      if (!signerIdForResend || resendState === 'sending') return
      setResendState('sending')
      try {
        await resendVerificationEmail(signerIdForResend)
        setResendState('sent')
      } catch {
        // Server-side rate limit (3/hour) is the realistic failure mode.
        // Reuse the existing 'failed' state — the button copy reflects it.
        setResendState('failed')
      }
    }

    const handleShare = async (intent: ShareIntent) => {
      setError('')
      setErrorKind('none')
      setRetryableIntent(null)
      setResendState('idle')

      if (!runValidation()) return

      const existingSignerId = getStoredSignerId()
      // Captcha required only when we'll hit /api/manifesto. A returning
      // signer (already-claimed session in this tab) skips the captcha
      // because we go straight to publishStory under their cookie.
      if (isCaptchaEnabled() && !existingSignerId && !captchaToken) {
        setError(t('signForm.captchaRequired'))
        setErrorKind('captcha')
        return
      }

      const effectiveWave = formData.wave === 'other'
        ? formData.waveOther.trim() || 'other'
        : formData.wave
      // Story-side waveTag must be one of the canonical sectors. The form's
      // wave dropdown already produces those values; "other" is the catch-all.
      const storyWaveTag = formData.wave === 'other' ? 'other' : (formData.wave || 'other')

      setLoading(true)
      setActiveIntent(intent)
      try {
        if (existingSignerId) {
          // The user has an active claimed session — post the story directly.
          // No new signup, no email round-trip required.
          await publishStory({
            signerId: existingSignerId,
            caption: formData.story.trim(),
            waveTag: storyWaveTag,
          })
          await trackAction({
            signerId: existingSignerId,
            action: 'shared_story',
            metadata: { source: 'manual_manifesto', subject: formData.subject },
          })

          setSignerId(existingSignerId)
          const transitionToSuccess = () => {
            setIsLeaving(true)
            onSuccess(existingSignerId, formData.firstName)
            setTimeout(() => setSubmitted(true), 350)
          }

          if (intent !== 'wall') {
            // Show the share modal first; success transition fires after
            // the user confirms and the platform window has been opened.
            requestShare(intent, getManualShareText(), {
              signerIdForTracking: existingSignerId,
              trackingSource: 'manual_manifesto',
              afterShare: transitionToSuccess,
            })
          } else {
            transitionToSuccess()
          }
          return
        }

        // First-time signer in this tab. /api/manifesto now only signs —
        // stories are exclusively created via cookie-gated /api/stories so
        // an unverified email can never publish. We stash the typed story
        // in sessionStorage and Welcome.tsx auto-posts it after the magic
        // link is claimed.
        const trimmedStory = formData.story.trim()
        await signManifesto({
          firstName: formData.firstName,
          country: formData.country,
          email: formData.email,
          wave: effectiveWave || undefined,
          company: honeypot,
          captchaToken: captchaToken || undefined,
        })
        try {
          sessionStorage.setItem('nw_first_name', formData.firstName)
          if (trimmedStory) {
            sessionStorage.setItem(
              'nw_pending_story',
              JSON.stringify({ caption: trimmedStory, waveTag: storyWaveTag }),
            )
          }
        } catch { /* ignore quota / privacy-mode errors */ }

        setVerifyState({ email: formData.email, hadStory: Boolean(trimmedStory) })

        const transitionToSuccess = () => {
          setIsLeaving(true)
          onSuccess('', formData.firstName)
          setTimeout(() => setSubmitted(true), 350)
        }

        // Show the share modal first. Tracking is skipped for first-time
        // signers because we have no signerId yet — it resumes after the
        // user clicks the email magic link in /welcome.
        if (intent !== 'wall') {
          requestShare(intent, getManualShareText(), {
            trackingSource: 'manual_manifesto',
            afterShare: transitionToSuccess,
          })
        } else {
          transitionToSuccess()
        }
      } catch (err: unknown) {
        const info = formatSubmitError(err, t, 'signForm.genericError')
        setError(info.message)
        if (info.status === 401 && getStoredSignerId()) {
          // Unverified-email branch: the cookie is missing/expired, so the
          // server rejected the story write. Offer to resend the magic-link
          // email instead of asking the user to fill the form again.
          setErrorKind('verification')
          setResendState('idle')
          setRetryableIntent(null)
        } else {
          setErrorKind(info.retryable ? 'network' : 'other')
          setRetryableIntent(info.retryable ? intent : null)
        }
        resetCaptcha()
      } finally {
        setLoading(false)
        setActiveIntent(null)
      }
    }

    return (
      <section ref={ref} className="bg-[#F5F5F5] py-20 md:py-32 px-6">
        <div className="max-w-[1400px] mx-auto">
          {!submitted ? (
            <div style={{ transition: 'opacity 0.35s ease, transform 0.35s ease', opacity: isLeaving ? 0 : 1, transform: isLeaving ? 'translateY(-14px)' : 'translateY(0)' }}>
              <div className="text-center mb-14">
                <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4">{t('signForm.title')}</h2>
                <p className="text-xl max-w-3xl mx-auto">{t('signForm.subtitle')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[0.95fr_1.05fr] gap-8 md:gap-10 items-start">
                <div className="hidden md:block relative w-full min-h-[760px] overflow-hidden md:-ml-20">
                  <img src={waveImage} alt={t('signForm.waveAlt')} className="absolute inset-0 w-full h-full object-cover object-left" />
                </div>

                <form onSubmit={(e) => e.preventDefault()} className="space-y-6" noValidate>
                  <Honeypot value={honeypot} onChange={setHoneypot} />
                  <Input
                    label={t('signForm.fullName')}
                    name="firstName"
                    type="text"
                    required
                    maxLength={LIMITS.firstName}
                    value={formData.firstName}
                    error={fieldErrors.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                  />

                  <div className="w-full">
                    <label htmlFor="country" className="block mb-2 text-base font-bold uppercase tracking-wide font-mono">
                      {t('signForm.country')}
                    </label>
                    <select
                      id="country"
                      name="country"
                      required
                      value={formData.country}
                      aria-invalid={fieldErrors.country ? true : undefined}
                      onChange={(e) => updateField('country', e.target.value)}
                      className={`w-full px-4 py-3 bg-[#F5F5F5] border ${fieldErrors.country ? 'border-[#dd3935]' : 'border-[#0C0C0A]'} focus:outline-none focus:ring-2 focus:ring-[#dd3935] cursor-pointer`}
                    >
                      {countryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {fieldErrors.country && (
                      <p className="mt-1 text-xs font-mono text-[#dd3935]">{fieldErrors.country}</p>
                    )}
                  </div>

                  <Input
                    label={t('signForm.email')}
                    name="email"
                    type="email"
                    required
                    maxLength={LIMITS.email}
                    placeholder={t('signForm.emailPlaceholder')}
                    value={formData.email}
                    error={fieldErrors.email}
                    onChange={(e) => updateField('email', e.target.value)}
                  />

                  <div>
                    <label htmlFor="wave" className="block mb-2 text-base font-bold font-mono uppercase tracking-wide">
                      {t('signForm.whatsYourWave')} <span className="text-[#dd3935]">*</span>
                    </label>
                    <select
                      id="wave"
                      name="wave"
                      required
                      value={formData.wave}
                      aria-invalid={fieldErrors.wave ? true : undefined}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, wave: e.target.value, waveOther: '' }))
                        if (fieldErrors.wave || fieldErrors.waveOther) {
                          setFieldErrors(prev => ({ ...prev, wave: undefined, waveOther: undefined }))
                        }
                      }}
                      className={`w-full border-2 bg-white px-4 py-3 font-mono text-sm focus:border-[#DD3935] outline-none ${
                        fieldErrors.wave ? 'border-[#DD3935]' : 'border-[#0C0C0A]'
                      }`}>
                      {waveOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {fieldErrors.wave && (
                      <p className="mt-1 text-xs font-mono text-[#DD3935]">{fieldErrors.wave}</p>
                    )}
                    {formData.wave === 'other' && (
                      <div className="mt-3">
                        <Input
                          name="waveOther"
                          type="text"
                          required
                          maxLength={LIMITS.waveOther}
                          placeholder={t('signForm.describeWavePlaceholder')}
                          value={formData.waveOther}
                          error={fieldErrors.waveOther}
                          onChange={(e) => updateField('waveOther', e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">{formData.waveOther.length}/{LIMITS.waveOther} {t('contact.charactersSuffix')}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block mb-3 text-base font-bold font-mono uppercase tracking-wide">{t('signForm.whoAbout')}</label>
                    <div className="flex gap-4 flex-wrap">
                      {[
                        { value: 'me', label: t('signForm.subjectMe') },
                        { value: 'someone', label: t('signForm.subjectSomeone') },
                        { value: 'organisation', label: t('signForm.subjectOrganisation') },
                      ].map((option) => (
                        <label key={option.value} className="flex items-center gap-3 cursor-pointer px-4 py-3 border-2 border-[#0C0C0A] hover:bg-white transition-colors min-w-[120px]">
                          <input type="radio" name="manual-subject" value={option.value}
                            checked={formData.subject === option.value}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className="w-5 h-5 accent-[#dd3935]" />
                          <span className="text-base">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <label className="text-base font-bold font-mono uppercase tracking-wide">
                        {t('signForm.tellStory')} <span className="text-[#dd3935]">*</span>
                      </label>
                      {!showAiHelper && (
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <button
                            type="button"
                            onClick={() => setShowAiHelper(true)}
                            className="flex items-center gap-1.5 px-3 py-1 border border-[#DD3935] text-[#DD3935] hover:bg-[#DD3935] hover:text-white transition-colors text-xs font-mono uppercase tracking-wide whitespace-nowrap"
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                            </svg>
                            {t('signForm.needHelpAi')}
                          </button>
                          <div className="relative group">
                            <button
                              type="button"
                              onClick={() => navigate('/ai-prompt')}
                              aria-label={t('signForm.aiPromptAria')}
                              className="flex items-center justify-center w-5 h-5 rounded-full border border-[#0C0C0A]/40 text-[#0C0C0A]/60 hover:border-[#DD3935] hover:text-[#DD3935] transition-colors text-[10px] font-mono font-bold"
                            >
                              ?
                            </button>
                            <div className="pointer-events-none absolute bottom-full right-0 mb-2 w-48 rounded bg-[#0C0C0A] px-3 py-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-center z-10">
                              {t('signForm.aiTooltip')}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {showAiHelper ? (
                      <AiStoryQuestionnaire
                        subject={formData.subject}
                        wave={formData.wave === 'other' ? formData.waveOther : formData.wave}
                        onComplete={(caption) => {
                          updateField('story', caption)
                          setShowAiHelper(false)
                        }}
                        onCancel={() => setShowAiHelper(false)}
                      />
                    ) : (
                      <>
                        <Textarea
                          name="story"
                          rows={6}
                          required
                          maxLength={LIMITS.story}
                          placeholder={t('signForm.storyPlaceholder')}
                          value={formData.story}
                          error={fieldErrors.story}
                          onChange={(e) => updateField('story', e.target.value)}
                          className="bg-white"
                        />
                        <p className="text-xs text-gray-500 mt-1">{formData.story.length}/{LIMITS.story} {t('contact.charactersSuffix')}</p>
                      </>
                    )}
                  </div>

                  <Captcha
                    ref={captchaRef}
                    onToken={setCaptchaToken}
                    onError={() => setCaptchaToken('')}
                  />

                  {!showShareOptions ? (
                    <Button type="button" className="w-full text-lg py-5"
                      onClick={() => {
                        if (!runValidation()) return
                        setShowShareOptions(true)
                      }}>
                      {t('signForm.publish')}
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-xs font-mono uppercase tracking-widest text-[#0C0C0A]/50 text-center">{t('signForm.shareChoiceHeader')}</p>
                      <div className="relative group">
                        <Button type="button" className="w-full text-lg py-5" disabled={loading}
                          onClick={() => handleShare('wall')}>
                          {loading && activeIntent === 'wall' ? t('signForm.publishing') : t('signForm.shareToWall')}
                        </Button>
                        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded bg-[#0C0C0A] px-3 py-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-center">
                          {t('signForm.wallTooltip')}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-mono uppercase tracking-widest text-[#0C0C0A]/50 text-center mb-2">{t('signForm.shareToSocials')}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <Button type="button" variant="secondary" className="w-full py-4 text-sm" disabled={loading}
                            onClick={() => handleShare('twitter')}>
                            {loading && activeIntent === 'twitter' ? '...' : t('signForm.shareX')}
                          </Button>
                          <Button type="button" variant="secondary" className="w-full py-4 text-sm" disabled={loading}
                            onClick={() => handleShare('linkedin')}>
                            {loading && activeIntent === 'linkedin' ? '...' : t('signForm.shareLinkedIn')}
                          </Button>
                          <Button type="button" variant="secondary" className="w-full py-4 text-sm" disabled={loading}
                            onClick={() => handleShare('facebook')}>
                            {loading && activeIntent === 'facebook' ? '...' : t('signForm.shareFacebook')}
                          </Button>
                          <Button type="button" variant="secondary" className="w-full py-4 text-sm" disabled={loading}
                            onClick={() => handleShare('instagram')}>
                            {loading && activeIntent === 'instagram' ? '...' : t('signForm.shareInstagram')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {error && errorKind === 'info' && (
                    <p className="text-[#027A4F] text-sm font-mono mt-2 text-center">{error}</p>
                  )}
                  {error && errorKind !== 'info' && errorKind !== 'none' && (
                    <div
                      role="alert"
                      aria-live="polite"
                      className="mt-3 flex items-start gap-3 border-2 border-[#DD3935] bg-[#DD3935]/5 px-4 py-3"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#DD3935"
                        strokeWidth="2.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="flex-shrink-0 mt-0.5"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="13" />
                        <line x1="12" y1="16.5" x2="12" y2="16.5" />
                      </svg>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-[#DD3935] text-sm font-mono font-bold">{error}</p>
                        {errorKind === 'network' && retryableIntent && (
                          <button
                            type="button"
                            onClick={() => void handleShare(retryableIntent)}
                            disabled={loading}
                            className="mt-2 px-3 py-1.5 border-2 border-[#DD3935] text-[#DD3935] font-mono text-xs font-bold uppercase tracking-wide hover:bg-[#DD3935] hover:text-white transition-colors disabled:opacity-50"
                          >
                            {loading ? t('inlineForm.signing') : t('common.tryAgain')}
                          </button>
                        )}
                        {errorKind === 'verification' && (
                          <button
                            type="button"
                            onClick={() => void handleResendVerification()}
                            disabled={resendState === 'sending' || resendState === 'sent'}
                            className="mt-2 px-3 py-1.5 border-2 border-[#027A4F] text-[#027A4F] font-mono text-xs font-bold uppercase tracking-wide hover:bg-[#027A4F] hover:text-white transition-colors disabled:opacity-60"
                          >
                            {resendState === 'sending' && t('signForm.resendSending')}
                            {resendState === 'sent' && t('signForm.resendSent')}
                            {resendState === 'failed' && t('signForm.resendFailed')}
                            {resendState === 'idle' && t('signForm.resendVerification')}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          ) : verifyState ? (
            <div
              className="text-center space-y-6 max-w-2xl mx-auto"
              style={{ transition: 'opacity 0.45s ease, transform 0.45s ease', opacity: successVisible ? 1 : 0, transform: successVisible ? 'translateY(0)' : 'translateY(28px)' }}
            >
              <div className="font-mono text-xs tracking-widest uppercase text-[#DD3935] font-bold">{t('signForm.verifyEyebrow')}</div>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight">{t('signForm.verifyTitle')}</h2>
              <p className="text-xl md:text-2xl">{t('signForm.successWelcome', { name: formData.firstName })}</p>
              <p className="text-base text-gray-600">
                {verifyState.hadStory
                  ? t('signForm.verifyBody', { email: verifyState.email })
                  : t('signForm.verifyBodyNoStory', { email: verifyState.email })}
              </p>
              <p className="font-mono text-sm text-[#0C0C0A]/60">{t('signForm.verifyHint')}</p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => void handleResendVerification()}
                  disabled={resendState === 'sending' || resendState === 'sent'}
                  className="px-5 py-2.5 border-2 border-[#027A4F] text-[#027A4F] font-mono text-xs font-bold uppercase tracking-wide hover:bg-[#027A4F] hover:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {resendState === 'sending' && t('signForm.resendSending')}
                  {resendState === 'sent' && t('signForm.resendSent')}
                  {resendState === 'failed' && t('signForm.resendFailed')}
                  {resendState === 'idle' && t('signForm.resendVerification')}
                </button>
              </div>
            </div>
          ) : (
            <div
              className="text-center space-y-8"
              style={{ transition: 'opacity 0.45s ease, transform 0.45s ease', opacity: successVisible ? 1 : 0, transform: successVisible ? 'translateY(0)' : 'translateY(28px)' }}
            >
              <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tight">{t('signForm.successTitle')}</h2>
              <p className="text-xl md:text-2xl">{t('signForm.successWelcome', { name: formData.firstName })}</p>
              <p className="text-base text-gray-600">{t('signForm.successBodyPrefix')}<span onClick={() => navigate('/stories')} className="underline underline-offset-2 cursor-pointer hover:text-[#DD3935] transition-colors">{t('signForm.successBodyLink')}</span>{t('signForm.successBodySuffix')}<br/>{t('signForm.successBodyLine2')}</p>
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 justify-center pt-8">
                <Button onClick={() => navigate('/get-mark')} className="px-6 py-4 text-sm sm:text-base">
                  {t('signForm.getWaveMark')}
                </Button>
                <Button variant="secondary" onClick={() => {
                  requestShare('twitter', getManualShareText(), {
                    trackingSource: 'success_screen',
                    afterShare: () => { void trackSocial('twitter') },
                  })
                }} className="px-6 py-4 text-sm sm:text-base">
                  {t('signForm.shareOnX')}
                </Button>
                <Button variant="secondary" onClick={() => {
                  requestShare('linkedin', getManualShareText(), {
                    trackingSource: 'success_screen',
                    afterShare: () => { void trackSocial('linkedin') },
                  })
                }} className="px-6 py-4 text-sm sm:text-base">
                  {t('signForm.shareOnLinkedIn')}
                </Button>
                <Button variant="secondary" onClick={() => {
                  requestShare('facebook', getManualShareText(), {
                    trackingSource: 'success_screen',
                    afterShare: () => { void trackSocial('facebook') },
                  })
                }} className="px-6 py-4 text-sm sm:text-base">
                  {t('signForm.shareOnFacebook')}
                </Button>
                <Button variant="secondary" onClick={() => {
                  requestShare('instagram', getManualShareText(), {
                    trackingSource: 'success_screen',
                    afterShare: () => { void trackSocial('instagram') },
                  })
                }} className="px-6 py-4 text-sm sm:text-base">
                  {t('signForm.copyForInstagram')}
                </Button>
              </div>
            </div>
          )}
        </div>

        <SocialShareModal
          open={!!pendingShare}
          platform={pendingShare?.platform ?? null}
          onContinue={() => {
            const continueCb = pendingShare?.onContinue
            setPendingShare(null)
            continueCb?.()
          }}
          onCancel={() => setPendingShare(null)}
        />
      </section>
    )
  }
)

ManifestoSignForm.displayName = 'ManifestoSignForm'
