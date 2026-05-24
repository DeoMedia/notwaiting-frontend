import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { generateCaption } from '../utils/api';
import { LIMITS, validateAiAnswer } from '../utils/validation';

interface Props {
  subject: string;   // passed from the form's existing "Who is this about?" field
  wave: string;      // passed from the form's existing "What's your wave?" field
  onComplete: (caption: string) => void;
  onCancel: () => void;
}

export function AiStoryQuestionnaire({ subject, wave, onComplete, onCancel }: Props) {
  const { t } = useTranslation();
  const questions = [
    {
      question: t('aiQuestionnaire.q1'),
      hint: t('aiQuestionnaire.q1Hint'),
      placeholder: t('aiQuestionnaire.q1Placeholder'),
    },
    {
      question: t('aiQuestionnaire.q2'),
      hint: t('aiQuestionnaire.q2Hint'),
      placeholder: t('aiQuestionnaire.q2Placeholder'),
    },
  ];
  const [step, setStep] = useState(0);
  const [doing, setDoing] = useState('');
  const [impact, setImpact] = useState('');
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('left');
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState('');
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [step]);

  const transition = (nextStep: number) => {
    const dir = nextStep > step ? 'left' : 'right';
    setSlideDir(dir);
    setVisible(false);
    setTimeout(() => {
      setStep(nextStep);
      setVisible(true);
    }, 200);
  };

  const handleGenerate = async () => {
    const doingErr = validateAiAnswer(doing, true, t);
    if (doingErr) {
      setFieldError(doingErr);
      transition(0);
      return;
    }
    const impactErr = validateAiAnswer(impact, false, t);
    if (impactErr) {
      setFieldError(impactErr);
      return;
    }
    setFieldError('');
    setLoading(true);
    setError('');
    try {
      const detail = [doing.trim(), impact.trim()].filter(Boolean).join('. ');
      const result = await generateCaption({
        waveTag: wave || 'other',
        subject: (subject || 'me') as 'me' | 'someone' | 'organisation',
        detail: detail || undefined,
      });
      setGenerated(result.caption);
    } catch (e: any) {
      setError(e.message || t('aiQuestionnaire.genericError'));
    } finally {
      setLoading(false);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="border-2 border-[#DD3935]/30 bg-white flex flex-col items-center justify-center gap-3 py-12">
        <div className="w-5 h-5 border-2 border-[#DD3935] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono uppercase tracking-widest text-[#DD3935]">{t('aiQuestionnaire.crafting')}</p>
      </div>
    );
  }

  // ── Generated result ──
  if (generated) {
    return (
      <div className="border-2 border-[#DD3935] bg-white" style={{ animation: 'fadeSlideIn 0.35s ease forwards' }}>
        <style>{`@keyframes fadeSlideIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div className="px-5 pt-4 pb-2 border-b border-[#f0f0f0] flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#DD3935] font-bold">{t('aiQuestionnaire.aiGenerated')}</span>
          <button onClick={() => setGenerated('')} className="text-[10px] font-mono uppercase text-gray-400 hover:text-gray-600 transition-colors">
            {t('aiQuestionnaire.editAnswers')}
          </button>
        </div>
        <div className="p-5">
          <p className="text-sm leading-relaxed text-[#0C0C0A] mb-5 border-l-2 border-[#DD3935] pl-3">{generated}</p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => onComplete(generated)}
              className="px-4 py-2 bg-[#DD3935] text-white text-xs font-mono uppercase tracking-wide hover:bg-[#C92F2B] transition-colors"
            >
              {t('aiQuestionnaire.useStory')}
            </button>
            <button
              onClick={handleGenerate}
              className="px-4 py-2 border-2 border-[#0C0C0A] text-xs font-mono uppercase tracking-wide hover:bg-[#f5f5f5] transition-colors"
            >
              {t('aiQuestionnaire.regenerate')}
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 text-xs font-mono uppercase tracking-wide text-gray-400 hover:text-gray-600 transition-colors"
            >
              {t('aiQuestionnaire.writeMyself')}
            </button>
          </div>
          {error && <p className="text-[#DD3935] text-xs mt-3 font-mono">{error}</p>}
        </div>
      </div>
    );
  }

  // ── Carousel ──
  const slideStyle: React.CSSProperties = {
    transition: 'opacity 0.2s ease, transform 0.2s ease',
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateX(0)' : slideDir === 'left' ? 'translateX(-16px)' : 'translateX(16px)',
  };

  return (
    <div className="border-2 border-[#0C0C0A] bg-white overflow-hidden">
      {/* Progress bar */}
      <div className="h-[3px] bg-[#f0f0f0]">
        <div className="h-full bg-[#DD3935] transition-all duration-300" style={{ width: step === 0 ? '50%' : '100%' }} />
      </div>

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex gap-1.5 items-center">
            {[0, 1].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? 'w-5 bg-[#DD3935]' : i < step ? 'w-1.5 bg-[#DD3935]/40' : 'w-1.5 bg-[#e0e0e0]'
                }`}
              />
            ))}
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest ml-2">
              {t('aiQuestionnaire.stepOf', { current: step + 1, total: 2 })}
            </span>
          </div>
          <button
            onClick={onCancel}
            className="text-[10px] font-mono uppercase tracking-wide text-gray-400 hover:text-gray-600 transition-colors"
          >
            {t('aiQuestionnaire.writeMyselfClose')}
          </button>
        </div>

        {/* Animated card */}
        <div style={slideStyle}>
          <p className="text-sm font-black uppercase tracking-tight mb-0.5">{questions[step].question}</p>
          <p className="text-[11px] text-gray-400 font-mono mb-3">{questions[step].hint}</p>

          <textarea
            ref={textareaRef}
            rows={4}
            maxLength={LIMITS.aiQuestion}
            value={step === 0 ? doing : impact}
            onChange={(e) => {
              if (step === 0) setDoing(e.target.value);
              else setImpact(e.target.value);
              if (fieldError) setFieldError('');
            }}
            placeholder={questions[step].placeholder}
            aria-invalid={fieldError ? true : undefined}
            className={`w-full border-2 outline-none p-3 resize-none text-sm font-mono bg-[#f9f9f9] focus:bg-white transition-colors ${
              fieldError ? 'border-[#DD3935] focus:border-[#DD3935]' : 'border-[#0C0C0A] focus:border-[#DD3935]'
            }`}
            onKeyDown={(e) => {
              if (e.key !== 'Enter' || e.shiftKey) return;
              e.preventDefault();
              if (step === 0) {
                const err = validateAiAnswer(doing, true, t);
                if (err) { setFieldError(err); return; }
                setFieldError('');
                transition(1);
              } else if (step === 1) {
                handleGenerate();
              }
            }}
          />
          <p className="text-[10px] text-gray-400 text-right mt-1 font-mono">
            {(step === 0 ? doing : impact).length}/{LIMITS.aiQuestion}{step === 1 ? t('aiQuestionnaire.optionalSuffix') : ''}
          </p>
          {fieldError && (
            <p className="text-[10px] text-[#DD3935] mt-1 font-mono">{fieldError}</p>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => transition(0)}
            className={`text-xs font-mono uppercase tracking-wide text-gray-400 hover:text-gray-700 transition-all ${step === 0 ? 'invisible' : ''}`}
          >
            {t('common.back')}
          </button>

          {step === 0 ? (
            <button
              onClick={() => {
                const err = validateAiAnswer(doing, true, t);
                if (err) { setFieldError(err); return; }
                setFieldError('');
                transition(1);
              }}
              disabled={!doing.trim()}
              className="px-5 py-2 bg-[#0C0C0A] text-white text-xs font-mono uppercase tracking-wide hover:bg-[#DD3935] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              {t('common.next')}
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              className="px-5 py-2 bg-[#DD3935] text-white text-xs font-mono uppercase tracking-wide hover:bg-[#C92F2B] transition-colors flex items-center gap-2"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              {t('aiQuestionnaire.generateStory')}
            </button>
          )}
        </div>

        {error && <p className="text-[#DD3935] text-xs mt-3 font-mono">{error}</p>}
      </div>
    </div>
  );
}
