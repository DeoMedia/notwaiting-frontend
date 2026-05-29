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
      <section className="py-20 md:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight mb-8 text-center">
            {t('contact.title')}
          </h1>
          <p className="text-xl text-center mb-16">
            {t('contact.subtitle')}
          </p>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div>
              <h2 className="text-3xl font-black uppercase mb-6">{t('contact.contactInfoTitle')}</h2>
              <div className="space-y-6">
                <div className="border-l-4 border-[#dd3935] pl-6">
                  <div className="text-sm font-mono uppercase mb-1">{t('contact.generalInquiries')}</div>
                  <a href="mailto:hello@notwaiting.africa" className="text-lg hover:text-[#dd3935]">
                    hello@notwaiting.africa
                  </a>
                </div>

                <div className="border-l-4 border-[#dd3935] pl-6">
                  <div className="text-sm font-mono uppercase mb-1">{t('contact.partnerships')}</div>
                  <a href="mailto:partners@notwaiting.africa" className="text-lg hover:text-[#dd3935]">
                    partners@notwaiting.africa
                  </a>
                </div>

                <div className="border-l-4 border-[#dd3935] pl-6">
                  <div className="text-sm font-mono uppercase mb-1">{t('contact.mediaPress')}</div>
                  <a href="mailto:press@notwaiting.africa" className="text-lg hover:text-[#dd3935]">
                    press@notwaiting.africa
                  </a>
                </div>

                <div className="border-l-4 border-[#dd3935] pl-6">
                  <div className="text-sm font-mono uppercase mb-1">{t('contact.storySubmissions')}</div>
                  <a href="mailto:stories@notwaiting.africa" className="text-lg hover:text-[#dd3935]">
                    stories@notwaiting.africa
                  </a>
                </div>
              </div>

              <div className="mt-12">
                <h3 className="text-2xl font-black uppercase mb-4">{t('contact.followWave')}</h3>
                <div className="flex gap-4 text-sm">
                  <a href="https://x.com/_notwaiting_" target="_blank" rel="noopener noreferrer" className="hover:text-[#dd3935] transition-colors">{t('contact.socialTwitter')}</a>
                  <a href="https://www.instagram.com/notwaiting.africa/" target="_blank" rel="noopener noreferrer" className="hover:text-[#dd3935] transition-colors">{t('contact.socialInstagram')}</a>
                  <a href="https://www.linkedin.com/company/not-waiting/" target="_blank" rel="noopener noreferrer" className="hover:text-[#dd3935] transition-colors">{t('contact.socialLinkedIn')}</a>
                  <a href="https://www.youtube.com/@notwaitingAfrica" target="_blank" rel="noopener noreferrer" className="hover:text-[#dd3935] transition-colors">{t('contact.socialYouTube')}</a>
                </div>
              </div>
            </div>

            <div>
              {!formSubmitted ? (
                <>
                  <h2 className="text-3xl font-black uppercase mb-6">{t('contact.sendMessage')}</h2>
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
                </>
              ) : (
                <div className="bg-[#F5F5F5] p-8 border-2 border-[#0C0C0A] text-center">
                  <h2 className="text-3xl font-black uppercase mb-4">{t('contact.sentTitle')}</h2>
                  <p className="text-lg mb-6">
                    {t('contact.sentBody', { name: formData.name })}
                  </p>
                  <Button onClick={() => setFormSubmitted(false)} variant="secondary">
                    {t('contact.sendAnother')}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#0C0C0A] text-white p-12 text-center">
            <h2 className="text-4xl font-black uppercase mb-4">{t('contact.joinTitle')}</h2>
            <p className="text-xl mb-6">
              {t('contact.joinBody')}
            </p>
            <p className="text-lg mb-2">{t('contact.joinLine1')}</p>
            <p className="text-sm text-white/60">{t('contact.joinLine2')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
