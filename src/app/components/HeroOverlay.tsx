import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocalizedSectors } from '../i18n/hooks'

interface HeroOverlayProps {
  className?: string
  align?: 'left' | 'center' | 'right'
  interval?: number
}

export function HeroOverlay({ className = '', align = 'center', interval = 1200 }: HeroOverlayProps) {
  const { t } = useTranslation()
  const sectors = useLocalizedSectors()
  const rotating = sectors.filter(s => s.value !== 'other')
  const [idx, setIdx] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

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

  const alignClass =
    align === 'left' ? 'text-center items-center md:text-left md:items-start' :
    align === 'right' ? 'text-center items-center md:text-right md:items-end' :
    'text-center items-center'

  const current = rotating[idx]
  // On mobile the hero image has a yellow background, so the yellow chip color
  // blends into it. Swap yellow chips to red on mobile only.
  const isYellow = current.color.toLowerCase() === '#ebbd06'
  const chipBg = isMobile && isYellow ? '#DD3935' : current.color
  const chipText = isMobile && isYellow ? '#fff' : current.text

  return (
    <div className={`absolute z-20 flex flex-col ${alignClass} ${className}`}>
      <h1 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] leading-tight [-webkit-text-stroke:1px_#000]">
        <span>{t('hero.titleLine1')}</span>{' '}
        <span className="md:block">{t('hero.titleLine2')}</span>
      </h1>

      <div className="mt-2 md:mt-3 flex flex-wrap gap-x-2 text-base md:text-xl font-bold text-white">
        <span className="[-webkit-text-stroke:0.5px_#000]">{t('hero.in')}</span>
        <span
          key={current.value}
          className="inline-block animate-[fadeSlide_500ms_ease-out] px-2 rounded"
          style={{ background: chipBg, color: chipText }}
        >
          {current.label}
        </span>
        <span className="[-webkit-text-stroke:0.5px_#000]">{t('hero.andMore')}</span>
      </div>

      <p className="mt-3 md:mt-6 text-2xl md:text-4xl font-black text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] [-webkit-text-stroke:1px_#000]">
        {t('hero.join')}
      </p>
       <span className="text-3xl md:text-6xl font-custard normal-case text-white tracking-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)] [-webkit-text-stroke:1px_#000]">
              #NotWaiting
            </span>

      <div className="hidden md:block mt-6 text-base md:text-lg italic font-medium leading-relaxed tracking-wide text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)] [-webkit-text-stroke:0.5px_#000]">
        <p>{t('hero.line1')}</p>
        <p>{t('hero.line2')}</p>
        <p>{t('hero.line3')}</p>

      </div>
      <div className="md:block text-base md:text-lg italic font-medium leading-relaxed tracking-wide text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]">
             <p className="mt-1 md:mt-2 not-italic text-sm md:text-base font-medium [-webkit-text-stroke:0.5px_#000]">
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
      </div>

      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
