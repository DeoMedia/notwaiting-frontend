import { useState, forwardRef } from 'react';
import { Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { generateCaption, publishStory, trackAction } from '../utils/api';
import { copyToClipboard } from '../utils/clipboard';
import { SocialShareModal, type SharePlatform } from './SocialShareModal';
import { useLocalizedSectors } from '../i18n/hooks';
import {
  LIMITS,
  validateAiCaption,
  firstError,
  type AiCaptionField,
  type ValidationErrors,
} from '../utils/validation';

interface Props {
  signerId: string | null
  firstName: string
}

export const AiCaptionHelper = forwardRef<HTMLElement, Props>(
  ({ signerId, firstName }, ref) => {
    const { t } = useTranslation()
    const sectors = useLocalizedSectors()
    const sectorOptions = sectors.map(s => ({ value: s.value, label: s.label }))
    const [category, setCategory]         = useState('')
    const [customCategory, setCustomCategory] = useState('')
    const [about, setAbout]               = useState('me')
    const [name, setName]                 = useState('')
    const [detail, setDetail]             = useState('')
    const [prompt, setPrompt]             = useState(t('aiCaption.promptDefault'))
    const [currentText, setCurrentText]   = useState('')
    const [previousText, setPreviousText] = useState('')
    const [rewriteCount, setRewriteCount] = useState(0)
    const [loading, setLoading]           = useState(false)
    const [copied, setCopied]             = useState(false)
    const [fieldErrors, setFieldErrors]   = useState<ValidationErrors<AiCaptionField>>({})
    const [statusMessage, setStatusMessage] = useState<{ kind: 'info' | 'error'; text: string } | null>(null)
    const [pendingShare, setPendingShare] = useState<{
      platform: SharePlatform
      onContinue: () => void
    } | null>(null)

    const flashStatus = (kind: 'info' | 'error', text: string) => {
      setStatusMessage({ kind, text })
      setTimeout(() => setStatusMessage(curr => (curr?.text === text ? null : curr)), 4000)
    }

    const buildPrompt = (aboutVal: string, cat: string, nameVal: string) => {
      const wave = cat || 'tech'
      if (aboutVal === 'me') return `Write a caption about ${firstName || 'myself'} building in ${wave}`
      if (aboutVal === 'someone') return `Write a caption about ${nameVal || 'someone'} building in ${wave}`
      return `Write a caption about ${nameVal || 'an organisation'} building in ${wave}`
    }

    const effectiveCategory = () => category === 'other' ? customCategory || 'tech' : category || 'tech'

    const generate = async (style?: 'shorter' | 'bold') => {
      const result = validateAiCaption({
        category,
        customCategory,
        about,
        name,
        detail,
        prompt,
      }, t)
      if (!result.valid) {
        setFieldErrors(result.errors)
        flashStatus('error', firstError(result.errors) ?? t('aiCaption.pleaseComplete'))
        return
      }
      setFieldErrors({})
      setLoading(true)
      try {
        let result
        if (style) {
          result = await generateCaption({
            waveTag: effectiveCategory(),
            subject: about as 'me' | 'someone' | 'organisation',
            customPrompt: `${prompt}. Make it ${style === 'shorter' ? 'shorter and punchier' : 'bolder and more powerful'}.`,
          })
        } else {
          result = await generateCaption({
            waveTag: effectiveCategory(),
            subject: about as 'me' | 'someone' | 'organisation',
            detail: detail || undefined,
            customPrompt: prompt || undefined,
          })
        }

        setPreviousText(currentText)
        setCurrentText(result.caption)
        setRewriteCount(prev => currentText ? prev + 1 : 0)
      } catch (err: any) {
        flashStatus('error', err.message ?? t('aiCaption.couldNotGenerate'))
      } finally {
        setLoading(false)
      }
    }

    const handleCopy = async (text: string) => {
      await copyToClipboard(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }

    const shareOnPlatform = (platform: SharePlatform) => {
      const text = `${currentText}\n\n#NotWaiting`
      const openUrl = (() => {
        switch (platform) {
          case 'twitter':
            return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
          case 'linkedin':
            return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin)}`
          case 'facebook':
            return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}`
          case 'instagram':
            return 'https://www.instagram.com/'
        }
      })()
      setPendingShare({
        platform,
        onContinue: () => {
          // Copy BEFORE opening the new tab — once window.open steals focus
          // the document loses it and clipboard writes get rejected.
          if (platform !== 'twitter') {
            void copyToClipboard(text)
          }
          window.open(openUrl, '_blank', 'noopener,noreferrer')
          if (signerId) {
            trackAction({ signerId, action: 'shared_social', metadata: { platform } })
          }
        },
      })
    }

    const postToWall = async () => {
      if (!signerId) {
        flashStatus('error', t('aiCaption.signFirst'))
        return
      }
      try {
        await publishStory({ signerId, caption: currentText, waveTag: effectiveCategory() })
        trackAction({ signerId, action: 'shared_story', metadata: { source: 'ai_helper' } })
        flashStatus('info', t('aiCaption.storyLive'))
      } catch (err: any) {
        flashStatus('error', err.message ?? t('aiCaption.couldNotPublish'))
      }
    }

    return (
      <section ref={ref as React.RefObject<HTMLElement>} className="bg-white py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-3 text-center">
            {t('aiCaption.title')}
          </h2>
          <p className="text-center text-base mb-12">{t('aiCaption.subtitle')}</p>

          {statusMessage && (
            <div
              role={statusMessage.kind === 'error' ? 'alert' : 'status'}
              aria-live="polite"
              className={`mb-6 px-4 py-3 text-sm font-mono border-2 ${
                statusMessage.kind === 'error'
                  ? 'border-[#DD3935] text-[#DD3935] bg-white'
                  : 'border-[#0C0C0A] text-[#0C0C0A] bg-[#F5F5F5]'
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {/* ── Inputs ─── */}
            <div className="space-y-6 md:pr-4">
              <div>
                <label htmlFor="ai-category" className="block mb-2 text-sm font-mono uppercase tracking-wide">{t('aiCaption.yourWave')}</label>
                <select
                  id="ai-category"
                  value={category}
                  aria-invalid={fieldErrors.category ? true : undefined}
                  onChange={(e) => {
                    setCategory(e.target.value)
                    setCustomCategory('')
                    setPrompt(buildPrompt(about, e.target.value === 'other' ? '' : e.target.value, name))
                    if (fieldErrors.category) setFieldErrors(prev => ({ ...prev, category: undefined }))
                  }}
                  className={`w-full border-2 bg-white px-4 py-3 font-mono text-sm focus:border-[#DD3935] outline-none ${
                    fieldErrors.category ? 'border-[#DD3935]' : 'border-[#0C0C0A]'
                  }`}>
                  <option value="">{t('aiCaption.selectSector')}</option>
                  {sectorOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                {fieldErrors.category && (
                  <p className="mt-1 text-xs font-mono text-[#DD3935]">{fieldErrors.category}</p>
                )}
                {category === 'other' && (
                  <div className="mt-3">
                    <Input
                      name="ai-customCategory"
                      type="text"
                      placeholder={t('aiCaption.describeSector')}
                      maxLength={LIMITS.waveOther}
                      value={customCategory}
                      error={fieldErrors.customCategory}
                      onChange={(e) => {
                        setCustomCategory(e.target.value)
                        setPrompt(buildPrompt(about, e.target.value, name))
                        if (fieldErrors.customCategory) setFieldErrors(prev => ({ ...prev, customCategory: undefined }))
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">{customCategory.length}/{LIMITS.waveOther} characters</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block mb-3 text-sm font-mono uppercase tracking-wide">{t('aiCaption.whoAbout')}</label>
                <div className="flex gap-4 flex-wrap">
                  {[
                    { value: 'me', label: t('aiCaption.subjectMe') },
                    { value: 'someone', label: t('aiCaption.subjectSomeone') },
                    { value: 'organisation', label: t('aiCaption.subjectOrganisation') },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-3 cursor-pointer px-4 py-3 border-2 border-[#0C0C0A] hover:bg-[#F5F5F5] transition-colors min-w-[120px]">
                      <input type="radio" name="about" value={option.value} checked={about === option.value}
                        onChange={(e) => {
                          const val = e.target.value
                          setAbout(val)
                          setName(val === 'me' ? '' : name)
                          setPrompt(buildPrompt(val, effectiveCategory(), val === 'me' ? '' : name))
                        }} className="w-5 h-5 accent-[#dd3935]" />
                      <span className="text-base">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {about !== 'me' && (
                <div>
                  <label htmlFor="ai-name" className="block mb-2 text-sm font-mono uppercase tracking-wide">
                    {about === 'someone' ? t('aiCaption.personName') : t('aiCaption.organisationName')}
                  </label>
                  <Input
                    name="ai-name"
                    type="text"
                    maxLength={LIMITS.firstName}
                    placeholder={about === 'someone' ? t('aiCaption.personPlaceholder') : t('aiCaption.organisationPlaceholder')}
                    value={name}
                    error={fieldErrors.name}
                    onChange={(e) => {
                      setName(e.target.value)
                      setPrompt(buildPrompt(about, effectiveCategory(), e.target.value))
                      if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: undefined }))
                    }}
                  />
                </div>
              )}

              <div>
                <label htmlFor="ai-detail" className="block mb-2 text-sm font-mono uppercase tracking-wide">{t('aiCaption.optionalDetail')}</label>
                <Input
                  name="ai-detail"
                  type="text"
                  maxLength={LIMITS.aiDetail}
                  placeholder={t('aiCaption.detailPlaceholder')}
                  value={detail}
                  error={fieldErrors.detail}
                  onChange={(e) => {
                    setDetail(e.target.value)
                    if (fieldErrors.detail) setFieldErrors(prev => ({ ...prev, detail: undefined }))
                  }}
                />
                <p className="text-xs text-gray-500 mt-2">{detail.length}/{LIMITS.aiDetail} {t('contact.charactersSuffix')}</p>
              </div>

              <div>
                <label htmlFor="ai-prompt" className="block mb-2 text-sm font-mono uppercase tracking-wide">{t('aiCaption.prompt')}</label>
                <Textarea
                  name="ai-prompt"
                  rows={3}
                  maxLength={LIMITS.aiPrompt}
                  value={prompt}
                  error={fieldErrors.prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value)
                    if (fieldErrors.prompt) setFieldErrors(prev => ({ ...prev, prompt: undefined }))
                  }}
                  placeholder={t('aiCaption.promptPlaceholder')}
                  className="bg-[#F5F5F5]"
                />
                <p className="text-xs text-gray-500 mt-2">{prompt.length}/{LIMITS.aiPrompt} · {t('aiCaption.promptHint')}</p>
              </div>

              <Button onClick={() => generate()} className="w-full py-5 text-lg" disabled={loading}>
                {loading ? t('aiCaption.writing') : t('aiCaption.writeMyWave')}
              </Button>
            </div>

            {/* ── Output ─── */}
            <div className="md:pl-4">
              <div className="bg-[#F5F5F5] border-2 border-[#0C0C0A] min-h-[500px] flex flex-col">
                <div className="flex-1 p-6">
                  {!currentText && !loading && (
                    <div className="bg-white border-2 border-[#0C0C0A] p-4">
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {t('aiCaption.placeholder')}
                      </p>
                    </div>
                  )}

                  {loading && (
                    <div className="bg-white border-2 border-[#0C0C0A] p-4">
                      <p className="text-sm text-gray-500">{t('aiCaption.writingYourWave')}</p>
                    </div>
                  )}

                  {currentText && !loading && (
                    <div>
                      <div className="bg-white border-2 border-[#0C0C0A] p-4 mb-4">
                        <p className="text-sm leading-relaxed whitespace-pre-line">{currentText}</p>
                      </div>

                      <p className="text-xs text-gray-400 mb-3">
                        {rewriteCount < 2
                          ? t('aiCaption.rewritesRemaining', { count: 2 - rewriteCount })
                          : t('aiCaption.rewritesMax')}
                      </p>

                      <div className="flex gap-2 flex-wrap mb-3">
                        <Button onClick={() => handleCopy(currentText)} className="px-4 py-2 text-sm">
                          <Copy size={14} className="inline mr-2" />
                          {copied ? t('common.copied') : t('common.copy')}
                        </Button>
                        <Button variant="secondary" onClick={() => generate()}
                          className="px-4 py-2 text-sm" disabled={rewriteCount >= 2 || loading}>
                          {t('aiCaption.rewrite')}
                        </Button>
                        {previousText && (
                          <Button variant="secondary" onClick={() => {
                            setCurrentText(previousText)
                            setPreviousText('')
                            setRewriteCount(prev => Math.max(0, prev - 1))
                          }} className="px-4 py-2 text-sm border-[#EBBD06] text-[#0C0C0A] bg-[#EBBD06] hover:bg-[#D4A900]">
                            {t('aiCaption.undo')}
                          </Button>
                        )}
                      </div>

                      <div className="flex gap-2 flex-wrap mb-3">
                        {(['shorter', 'bold'] as const).map(style => (
                          <button key={style} onClick={() => generate(style)}
                            disabled={rewriteCount >= 2 || loading}
                            className="px-3 py-1.5 text-xs border border-[#0C0C0A] hover:bg-[#0C0C0A] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                            {style === 'shorter' ? t('aiCaption.makeShorter') : t('aiCaption.moreBold')}
                          </button>
                        ))}
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => shareOnPlatform('twitter')}
                          className="px-3 py-1.5 text-xs bg-[#0C0C0A] text-white hover:bg-[#DD3935] transition-colors">
                          {t('aiCaption.shareX')}
                        </button>
                        <button onClick={() => shareOnPlatform('linkedin')}
                          className="px-3 py-1.5 text-xs bg-[#0C0C0A] text-white hover:bg-[#DD3935] transition-colors">
                          {t('aiCaption.shareLinkedIn')}
                        </button>
                        <button onClick={() => shareOnPlatform('facebook')}
                          className="px-3 py-1.5 text-xs bg-[#0C0C0A] text-white hover:bg-[#DD3935] transition-colors">
                          {t('aiCaption.shareFacebook')}
                        </button>
                        <button onClick={() => shareOnPlatform('instagram')}
                          className="px-3 py-1.5 text-xs bg-[#0C0C0A] text-white hover:bg-[#DD3935] transition-colors">
                          {t('aiCaption.copyInstagram')}
                        </button>
                        <button onClick={postToWall}
                          className="px-3 py-1.5 text-xs border border-[#EBBD06] text-[#0C0C0A] bg-[#EBBD06] hover:bg-[#D4A900] transition-colors">
                          {t('aiCaption.postToWall')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
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

AiCaptionHelper.displayName = 'AiCaptionHelper'
