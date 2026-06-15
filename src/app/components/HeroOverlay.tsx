import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocalizedSectors } from '../i18n/hooks'

interface HeroOverlayProps {
  className?: string
  align?: 'left' | 'center' | 'right'
  interval?: number
}

export function HeroOverlay({ className = '', align = 'center', interval = 1200 }: HeroOverlayProps) {
  const { t, i18n } = useTranslation()
  const sectors = useLocalizedSectors()
  const rotating = sectors.filter(s => s.value !== 'other')
  const [idx, setIdx] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  // French title is significantly longer than English — scale it down on mobile
  // so it doesn't overflow the hero container.
  const isFr = i18n.language.startsWith('fr')

  useEffect(() => {
    const tid = setInterval(() => setIdx(i => (i + 1) % rotating.length), interval)
    return () => clearInterval(tid)
  }, [interval, rotating.length])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  // On mobile, always center regardless of the align prop — the images
  // are all portrait and composited for a centered overlay.
  const alignClass =
    align === 'left'  ? 'text-center items-center md:text-left md:items-start'   :
    align === 'right' ? 'text-center items-center md:text-right md:items-end'     :
                        'text-center items-center'

  const current = rotating[idx]

  // Guard against sectors not yet loaded
  if (!current) return null

  // On mobile the hero image has a yellow background, so swap yellow chips to red.
  const isYellow = current.color.toLowerCase() === '#ebbd06'
  const chipBg   = isMobile && isYellow ? '#DD3935' : current.color
  const chipText = isMobile && isYellow ? '#fff'    : current.text

  return (
    <div className={`absolute z-20 flex flex-col ${alignClass} ${className}`}>

      {/* ── Headline ── */}
      {/* FR title is ~2x longer than EN — scaled down on all breakpoints to stay in 2 lines */}
      <h1 className={`leading-tight font-black uppercase tracking-tight text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] ${
        isFr
          ? 'text-[1.15rem] md:text-3xl lg:text-4xl'
          : 'text-[1.6rem] md:text-5xl lg:text-6xl'
      }`}>
        {t('hero.title')}
      </h1>

      {/* ── Rotating sector chip ── */}
      <div className={`flex flex-wrap justify-center gap-x-2 font-bold text-white ${isFr ? 'mt-0.5 md:mt-4 text-sm md:text-2xl' : 'mt-1 md:mt-3 text-sm md:text-xl'}`}>
        <span>{t('hero.in')}</span>
        <span
          key={current.value}
          className="inline-block animate-[fadeSlide_500ms_ease-out] px-2 rounded"
          style={{ background: chipBg, color: chipText }}
        >
          {current.label}
        </span>
        <span>{t('hero.andMore')}</span>
      </div>

      {/* ── Join the wave ── */}
      <p className={`font-black text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] ${isFr ? 'mt-0.5 md:mt-5 text-xl md:text-4xl' : 'mt-1 md:mt-6 text-xl md:text-4xl'}`}>
        {t('hero.join')}
      </p>

      {/* ── #NotWaiting ── */}
      <span className="text-[1.75rem] md:text-6xl font-custard normal-case text-white tracking-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
        #NotWaiting
      </span>

      {/* ── Italic tagline — hidden on FR mobile to prevent overflow ── */}
      <div className={`leading-snug md:text-lg italic font-medium tracking-wide text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)] ${isFr ? 'hidden md:block md:mt-6 md:text-lg' : 'mt-2 md:mt-6 text-[0.7rem]'}`}>
        <p>{t('hero.line1')}</p>
        <p>{t('hero.line2')}</p>
        <p>{t('hero.line3')}</p>
      </div>

      {/* ── Powered by — hidden on FR mobile ── */}
      <p className={`not-italic md:text-base font-medium text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)] ${isFr ? 'hidden md:block md:mt-2' : 'mt-1 md:mt-2 text-[0.65rem]'}`}>
        Powered by{' '}
        <a
          href="https://www.opportunityafrica.africa/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 hover:text-[#EBBD06] transition-colors"
        >
          Opportunity Africa
        </a>
      </p>

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}