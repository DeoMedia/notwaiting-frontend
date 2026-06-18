import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Textarea } from '../components/Textarea';
import { Select } from '../components/Select';
import { Honeypot } from '../components/Honeypot';
import { Captcha, isCaptchaEnabled } from '../components/Captcha';
import { submitContact } from '../utils/api';
import {
  LIMITS,
  validateContact,
  type ContactField,
  type ValidationErrors,
} from '../utils/validation';

export default function Contact() {
  const { t } = useTranslation();
  const inquiryTypes = [
    { value: '', label: t('contact.inquiry.placeholder') },
    { value: 'partnership', label: t('contact.inquiry.partnership') },
    { value: 'media', label: t('contact.inquiry.media') },
    { value: 'story', label: t('contact.inquiry.story') },
    { value: 'support', label: t('contact.inquiry.support') },
    { value: 'other', label: t('contact.inquiry.other') },
  ];
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    inquiryType: '',
    message: ''
  });
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors<ContactField>>({});

  const update = <K extends keyof typeof formData>(key: K, value: typeof formData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (fieldErrors[key as ContactField]) {
      setFieldErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    const result = validateContact(formData, t);
    if (!result.valid) {
      setFieldErrors(result.errors);
      return;
    }
    if (isCaptchaEnabled() && !captchaToken) {
      setSubmitError(t('contact.captchaRequired') ?? 'Please complete the captcha challenge.');
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      const subjectParts = [
        formData.inquiryType ? `[${formData.inquiryType}]` : null,
        formData.organization ? `(${formData.organization})` : null,
      ].filter(Boolean).join(' ');
      await submitContact({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: subjectParts || undefined,
        message: formData.message.trim(),
        company: honeypot,
        captchaToken: captchaToken || undefined,
      });
      setFormSubmitted(true);
    } catch (err: any) {
      setSubmitError(err?.message ?? t('contact.genericError') ?? 'Could not send your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO HEADER ─────────────────────────────────────── */}
      <section className="bg-[#EBBD06] text-[#0C0C0A] py-20 md:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-druk font-bold text-5xl sm:text-7xl md:text-8xl uppercase leading-[0.9] tracking-tight mb-6">
            {t('contact.title')}
          </h1>

          <div className="grid grid-cols-3 h-[5px] max-w-xs mb-10">
            <div className="bg-[#DD3935]" />
            <div className="bg-[#0C0C0A]" />
            <div className="bg-[#027A4F]" />
          </div>

          <p className="font-druk font-bold text-xl md:text-2xl leading-tight max-w-2xl">
            {t('contact.subtitle')}
          </p>
        </div>
      </section>

      {/* ── CONTACT INFO + FORM ─────────────────────────────── */}
      <section className="py-16 md:py-24 px-6 border-b border-[#0C0C0A]/10">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16">

            {/* ── Contact info column ── */}
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="h-8 w-1.5 flex-shrink-0 bg-[#DD3935]" />
                <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#DD3935]">
                  {t('contact.contactInfoTitle')}
                </p>
              </div>

              <div className="md:pl-6 space-y-5">
                <div className="bg-[#F5F5F5] p-5" style={{ borderLeft: '4px solid #DD3935' }}>
                  <div className="font-mono text-xs uppercase tracking-wide text-[#0C0C0A]/60 mb-1">
                    {t('contact.generalInquiries')}
                  </div>
                  <a href="mailto:hello@notwaiting.africa" className="font-druk font-bold text-base hover:text-[#DD3935] transition-colors">
                    hello@notwaiting.africa
                  </a>
                </div>

                <div className="bg-[#F5F5F5] p-5" style={{ borderLeft: '4px solid #DD3935' }}>
                  <div className="font-mono text-xs uppercase tracking-wide text-[#0C0C0A]/60 mb-1">
                    {t('contact.partnerships')}
                  </div>
                  <a href="mailto:partners@notwaiting.africa" className="font-druk font-bold text-base hover:text-[#DD3935] transition-colors">
                    partners@notwaiting.africa
                  </a>
                </div>

                <div className="bg-[#F5F5F5] p-5" style={{ borderLeft: '4px solid #DD3935' }}>
                  <div className="font-mono text-xs uppercase tracking-wide text-[#0C0C0A]/60 mb-1">
                    {t('contact.mediaPress')}
                  </div>
                  <a href="mailto:press@notwaiting.africa" className="font-druk font-bold text-base hover:text-[#DD3935] transition-colors">
                    press@notwaiting.africa
                  </a>
                </div>

                <div className="bg-[#F5F5F5] p-5" style={{ borderLeft: '4px solid #DD3935' }}>
                  <div className="font-mono text-xs uppercase tracking-wide text-[#0C0C0A]/60 mb-1">
                    {t('contact.storySubmissions')}
                  </div>
                  <a href="mailto:stories@notwaiting.africa" className="font-druk font-bold text-base hover:text-[#DD3935] transition-colors">
                    stories@notwaiting.africa
                  </a>
                </div>
              </div>

              <div className="mt-12">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-8 w-1.5 flex-shrink-0 bg-[#027A4F]" />
                  <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#027A4F]">
                    {t('contact.followWave')}
                  </p>
                </div>
                <div className="md:pl-6 flex flex-wrap gap-x-5 gap-y-2 font-mono text-sm uppercase tracking-wide">
                  <a href="https://x.com/_notwaiting_" target="_blank" rel="noopener noreferrer" className="hover:text-[#DD3935] transition-colors">{t('contact.socialTwitter')}</a>
                  <a href="https://www.instagram.com/notwaiting.africa/" target="_blank" rel="noopener noreferrer" className="hover:text-[#DD3935] transition-colors">{t('contact.socialInstagram')}</a>
                  <a href="https://www.linkedin.com/company/not-waiting/" target="_blank" rel="noopener noreferrer" className="hover:text-[#DD3935] transition-colors">{t('contact.socialLinkedIn')}</a>
                  <a href="https://www.youtube.com/@notwaitingAfrica" target="_blank" rel="noopener noreferrer" className="hover:text-[#DD3935] transition-colors">{t('contact.socialYouTube')}</a>
                </div>
              </div>
            </div>

            {/* ── Form column ── */}
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="h-8 w-1.5 flex-shrink-0 bg-[#EBBD06]" />
                <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#EBBD06]">
                  {formSubmitted ? t('contact.sentTitle') : t('contact.sendMessage')}
                </p>
              </div>

              <div className="md:pl-6">
                {!formSubmitted ? (
                  <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    <Honeypot value={honeypot} onChange={setHoneypot} />
                    <Input
                      label={t('contact.name')}
                      name="contact-name"
                      type="text"
                      required
                      maxLength={LIMITS.contactName}
                      value={formData.name}
                      error={fieldErrors.name}
                      onChange={(e) => update('name', e.target.value)}
                    />

                    <Input
                      label={t('contact.email')}
                      name="contact-email"
                      type="email"
                      required
                      maxLength={LIMITS.email}
                      value={formData.email}
                      error={fieldErrors.email}
                      onChange={(e) => update('email', e.target.value)}
                    />

                    <Input
                      label={t('contact.organization')}
                      name="contact-org"
                      type="text"
                      maxLength={LIMITS.contactOrg}
                      value={formData.organization}
                      error={fieldErrors.organization}
                      onChange={(e) => update('organization', e.target.value)}
                    />

                    <Select
                      label={t('contact.inquiryType')}
                      name="contact-inquiry"
                      required
                      options={inquiryTypes}
                      value={formData.inquiryType}
                      error={fieldErrors.inquiryType}
                      onChange={(e) => update('inquiryType', e.target.value)}
                    />

                    <div>
                      <Textarea
                        label={t('contact.message')}
                        name="contact-message"
                        required
                        rows={6}
                        maxLength={LIMITS.contactMessage}
                        value={formData.message}
                        error={fieldErrors.message}
                        onChange={(e) => update('message', e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">{formData.message.length}/{LIMITS.contactMessage} {t('contact.charactersSuffix')}</p>
                    </div>

                    <Captcha
                      onToken={setCaptchaToken}
                      onError={() => setCaptchaToken('')}
                    />

                    {submitError && (
                      <p role="alert" className="text-sm font-mono text-[#DD3935]">{submitError}</p>
                    )}

                    <Button type="submit" disabled={submitting} className="w-full py-4">
                      {submitting ? (t('submitting') ?? 'Sending…') : t('contact.submit')}
                    </Button>
                  </form>
                ) : (
                  <div className="bg-[#F5F5F5] p-8 border-2 border-[#0C0C0A] text-center">
                    <p className="font-druk font-bold text-lg mb-4">
                      {t('contact.sentBody', { name: formData.name })}
                    </p>
                    <Button onClick={() => setFormSubmitted(false)} variant="secondary">
                      {t('contact.sendAnother')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA FOOTER ──────────────────────────────────────── */}
      <section className="bg-[#F5F5F5] py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-druk font-bold text-3xl md:text-5xl uppercase mb-6">
            {t('contact.joinTitle')}
          </h2>
          <p className="font-mono text-base text-[#0C0C0A]/70 mb-2 max-w-md mx-auto leading-relaxed">
            {t('contact.joinBody')}
          </p>
          <p className="font-mono text-sm text-[#0C0C0A]/70 mb-1">{t('contact.joinLine1')}</p>
          <p className="font-mono text-xs text-[#0C0C0A]/40">{t('contact.joinLine2')}</p>
        </div>
      </section>

    </div>
  );
}