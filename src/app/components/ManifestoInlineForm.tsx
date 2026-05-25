import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { signManifesto } from '../utils/api';
import { Honeypot } from './Honeypot';
import { Captcha, isCaptchaEnabled } from './Captcha';
import { useLocalizedCountriesWithPlaceholder } from '../i18n/hooks';
import { formatSubmitError } from '../utils/submitError';
import {
  LIMITS,
  validateManifesto,
  type ManifestoField,
  type ValidationErrors,
} from '../utils/validation';

export function ManifestoInlineForm() {
  const { t } = useTranslation();
  const countryOptions = useLocalizedCountriesWithPlaceholder()
  const [form, setForm] = useState({ firstName: '', country: '', email: '' })
  const [newsletterOptIn, setNewsletterOptIn] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [errorKind, setErrorKind] = useState<'none' | 'captcha' | 'network' | 'other'>('none')
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors<ManifestoField>>({})
  const [signed, setSigned] = useState(false)

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    if (fieldErrors[field as ManifestoField]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const submit = async () => {
    setError('')
    setErrorKind('none')

    const result = validateManifesto(form, {}, t)
    if (!result.valid) {
      setFieldErrors(result.errors)
      return
    }
    if (isCaptchaEnabled() && !captchaToken) {
      setError(t('inlineForm.captchaRequired'))
      setErrorKind('captcha')
      return
    }
    setFieldErrors({})

    setLoading(true)
    try {
      await signManifesto({
        firstName: form.firstName.trim(),
        country: form.country.trim(),
        email: form.email.trim(),
        newsletterOptIn,
        company: honeypot,
        captchaToken: captchaToken || undefined,
      })
      // Server response is deliberately bare `{success:true}` — no signerId,
      // no token, no Set-Cookie — regardless of whether the email was new or
      // already in the database. The credential ships out-of-band via the
      // confirmation email so /api/manifesto can't be used to enumerate.
      try { sessionStorage.setItem('nw_first_name', form.firstName.trim()) } catch {}
      setSigned(true)
    } catch (err: unknown) {
      const info = formatSubmitError(err, t, 'inlineForm.genericError')
      setError(info.message)
      setErrorKind(info.retryable ? 'network' : 'other')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    void submit()
  }

  if (signed) {
    return (
      <div className="mt-6 flex items-start gap-3 text-[#027A4F]">
        <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-[#027A4F] flex-shrink-0 mt-0.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div>
          <p className="font-black text-lg">
            {t('inlineForm.successTitle', { name: form.firstName, defaultValue: `You're now on the wave, ${form.firstName}.` })}
          </p>
          <p className="text-sm text-[#0C0C0A]/70 font-mono">
            {t('inlineForm.successBody', { defaultValue: 'Welcome to the movement. Check your inbox for confirmation, continue to join the movement or get the wave mark.' })}
          </p>
        </div>
      </div>
    )
  }

  const fieldClass = (key: ManifestoField) =>
    `w-full px-4 py-3 bg-white border-2 text-sm font-mono focus:outline-none transition-colors placeholder:text-[#0C0C0A]/30 ${
      fieldErrors[key] ? 'border-[#DD3935] focus:border-[#DD3935]' : 'border-[#0C0C0A] focus:border-[#027A4F]'
    }`

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
      <Honeypot value={honeypot} onChange={setHoneypot} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="inline-firstName" className="block mb-1.5 text-sm font-bold font-mono uppercase tracking-widest text-[#0C0C0A]/80">
            {t('inlineForm.fullName')} <span className="text-[#DD3935]">*</span>
          </label>
          <input
            id="inline-firstName"
            type="text"
            required
            maxLength={LIMITS.firstName}
            placeholder={t('inlineForm.fullNamePlaceholder')}
            value={form.firstName}
            onChange={set('firstName')}
            aria-invalid={fieldErrors.firstName ? true : undefined}
            aria-describedby={fieldErrors.firstName ? 'inline-firstName-error' : undefined}
            className={fieldClass('firstName')}
          />
          {fieldErrors.firstName && (
            <p id="inline-firstName-error" className="mt-1 text-xs font-mono text-[#DD3935]">{fieldErrors.firstName}</p>
          )}
        </div>
        <div>
          <label htmlFor="inline-country" className="block mb-1.5 text-sm font-bold font-mono uppercase tracking-widest text-[#0C0C0A]/80">
            {t('inlineForm.country')} <span className="text-[#DD3935]">*</span>
          </label>
          <select
            id="inline-country"
            required
            value={form.country}
            onChange={(e) => {
              setForm(prev => ({ ...prev, country: e.target.value }))
              if (fieldErrors.country) {
                setFieldErrors(prev => ({ ...prev, country: undefined }))
              }
            }}
            aria-invalid={fieldErrors.country ? true : undefined}
            aria-describedby={fieldErrors.country ? 'inline-country-error' : undefined}
            className={`${fieldClass('country')} cursor-pointer`}
          >
            {countryOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {fieldErrors.country && (
            <p id="inline-country-error" className="mt-1 text-xs font-mono text-[#DD3935]">{fieldErrors.country}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="inline-email" className="block mb-1.5 text-sm font-bold font-mono uppercase tracking-widest text-[#0C0C0A]/80">
          {t('inlineForm.email')} <span className="text-[#DD3935]">*</span>
        </label>
        <input
          id="inline-email"
          type="email"
          required
          maxLength={LIMITS.email}
          placeholder={t('inlineForm.emailPlaceholder')}
          value={form.email}
          onChange={set('email')}
          aria-invalid={fieldErrors.email ? true : undefined}
          aria-describedby={fieldErrors.email ? 'inline-email-error' : undefined}
          className={fieldClass('email')}
        />
        {fieldErrors.email && (
          <p id="inline-email-error" className="mt-1 text-xs font-mono text-[#DD3935]">{fieldErrors.email}</p>
        )}
      </div>

      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-3 border-2 border-[#DD3935] bg-[#DD3935]/5 px-4 py-3"
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
          <div className="flex-1 min-w-0">
            <p className="text-[#DD3935] text-sm font-mono font-bold">{error}</p>
            {errorKind === 'network' && (
              <button
                type="button"
                onClick={() => void submit()}
                disabled={loading}
                className="mt-2 px-3 py-1.5 border-2 border-[#DD3935] text-[#DD3935] font-mono text-xs font-bold uppercase tracking-wide hover:bg-[#DD3935] hover:text-white transition-colors disabled:opacity-50"
              >
                {loading ? t('inlineForm.signing') : t('common.tryAgain')}
              </button>
            )}
          </div>
        </div>
      )}

      <Captcha
        onToken={setCaptchaToken}
        onError={() => setCaptchaToken('')}
        className="mt-2"
      />

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={newsletterOptIn}
          onChange={(e) => setNewsletterOptIn(e.target.checked)}
          className="mt-[3px] h-4 w-4 accent-[#DD3935] flex-shrink-0"
        />
        <span className="font-mono text-sm leading-snug text-[#0C0C0A]/80">
          {t('inlineForm.newsletterOptInPre')}{' '}
          <span className="font-custard normal-case text-xl text-[#DD3935]">{t('inlineForm.newsletterOptInBrand')}</span>{' '}
          {t('inlineForm.newsletterOptInPost')}
        </span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="px-8 py-3 bg-[#DD3935] text-white font-black uppercase tracking-wide text-sm hover:bg-[#c42f2b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? t('inlineForm.signing') : t('inlineForm.sign')}
      </button>
    </form>
  )
}
