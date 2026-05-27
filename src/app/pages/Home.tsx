import { useCallback, useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/Button';
import { ManifestoSignForm } from '../components/ManifestoSignForm';
import { ManifestoInlineForm } from '../components/ManifestoInlineForm';
import { StoriesSlider } from '../components/StoriesSlider';
import { StatsSection } from '../components/StatsSection';
import { HeroOverlay } from '../components/HeroOverlay';
// import heroDesktop1 from '../../styles/Landing1.webp';
// import heroDesktop2 from '../../styles/Landing2.webp';
import heroDesktop3 from '../../styles/Landing3.png';
// import heroDesktop4 from '../../styles/Landing4.webp';
import heroMobile1 from '../../styles/PhoneLandingmobile-01.png';
// import heroMobile2 from '../../styles/PhoneLandingmobile-02.webp';
// import heroMobile3 from '../../styles/PhoneLandingmobile-03.webp';
// import heroMobile4 from '../../styles/PhoneLandingmobile-04.webp';
// import patternBg2 from '../../imports/PATTERN_1-1.png';
import waveMarkExample from '../../styles/wave_mark_sample.jpeg';
import { useNavigate } from 'react-router';
import { getSignerCount } from '../utils/api';

let manifestoAutoScrolled = false;

type ManifestoStats = {
  total_signers: number
  total_countries: number
}

function AnimatedManifestoNumber({ value, active }: { value: number; active: boolean }) {
  const [displayValue, setDisplayValue] = useState(0)
  const displayValueRef = useRef(0)

  useEffect(() => {
    if (!active) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(value)
      displayValueRef.current = value
      return
    }

    const from = displayValueRef.current
    const difference = value - from
    const duration = 1200
    const startedAt = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const nextValue = Math.round(from + difference * eased)
      displayValueRef.current = nextValue
      setDisplayValue(nextValue)

      if (progress < 1) {
        frame = requestAnimationFrame(tick)
      } else {
        displayValueRef.current = value
      }
    }

    frame = requestAnimationFrame(tick)

    return () => cancelAnimationFrame(frame)
  }, [active, value])

  return <span className="font-black text-[#DD3935]">{displayValue.toLocaleString()}</span>
}

export default function Home() {
  const navigate = useNavigate()
  const { t } = useTranslation()


  const heroSlides: Array<{
    desktop: string
    mobile: string
    overlay: { className: string; align: 'left' | 'center' | 'right' }
  }> = [
    // {
    //   desktop: heroDesktop1,
    //   mobile: heroMobile1,
    //   overlay: {
    //     align: 'left',
    //     className:
    //       'top-[6%] left-1/2 -translate-x-1/2 w-[90%] md:top-1/2 md:-translate-y-1/2 md:left-[6%] md:translate-x-0 md:w-[42%]',
    //   },
    // },
    // {
    //   desktop: heroDesktop2,
    //   mobile: heroMobile2,
    //   overlay: {
    //     align: 'left',
    //     className:
    //       'top-[6%] left-1/2 -translate-x-1/2 w-[90%] md:top-[18%] md:left-[8%] md:translate-x-0 md:w-[44%]',
    //   },
    // },
    {
      desktop: heroDesktop3,
      mobile: heroMobile1,
      overlay: {
        align: 'center',
        className:
          'top-[2%] left-1/2 -translate-x-1/2 w-[90%] md:top-1/2 md:left-auto md:-translate-x-0 md:-translate-y-1/2 md:right-[18%] md:w-[48%]',
      },
    },
    // {
    //   desktop: heroDesktop4,
    //   mobile: heroMobile4,
    //   overlay: {
    //     align: 'center',
    //     className:
    //       'top-[6%] left-1/2 -translate-x-1/2 w-[90%] md:top-1/2 md:-translate-y-1/2 md:left-[42%] md:translate-x-0 md:w-[52%]',
    //   },
    // },
  ]

  const [activeHero, setActiveHero] = useState(0)
  const [manifestoStats, setManifestoStats] = useState<ManifestoStats | null>(null)
  const [manifestoCounterActive, setManifestoCounterActive] = useState(false)

  const signOnRef = useRef<HTMLDivElement>(null)
  const manifestoRef = useRef<HTMLElement>(null)
  const displayedManifestoStats = manifestoStats ?? { total_signers: 0, total_countries: 0 }

  const loadManifestoStats = useCallback(async () => {
    try {
      const data = await getSignerCount()
      setManifestoStats({
        total_signers: data.total_signers ?? 0,
        total_countries: data.total_countries ?? 0,
      })
    } catch {
      // Non-critical — keep the last known aggregate count.
    }
  }, [])

  // Hero auto-advance
  useEffect(() => {
    const timer = setInterval(() => setActiveHero(prev => (prev + 1) % heroSlides.length), 6000)
    return () => clearInterval(timer)
  }, [heroSlides.length])

  useEffect(() => {
    loadManifestoStats()
  }, [loadManifestoStats])

  useEffect(() => {
    if (!manifestoRef.current || manifestoCounterActive) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setManifestoCounterActive(true)
          observer.disconnect()
        }
      },
      { threshold: 0.18 },
    )

    observer.observe(manifestoRef.current)

    return () => observer.disconnect()
  }, [manifestoCounterActive])

  // Auto-scroll to manifesto on first mount per page load.
  // Module-level flag resets on hard refresh but persists across SPA route changes.
  useEffect(() => {
    if (manifestoAutoScrolled) return
    manifestoAutoScrolled = true
    const timer = setTimeout(() => {
      manifestoRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const scrollToSignOn = () => signOnRef.current?.scrollIntoView({ behavior: 'smooth' })

  const handleSignSuccess = (_id: string, _name: string) => {
    loadManifestoStats()
  }

  return (
    <div className="min-h-screen bg-white">


      {/* ── Hero slider ─── */}
      <section className="relative min-h-screen bg-white text-[#0C0C0A] overflow-hidden">
        {heroSlides.map((slide, i) => (
          <div key={i} className={`absolute inset-0 transition-opacity duration-700 ${activeHero === i ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
            <div className="relative min-h-screen overflow-hidden">
              <div className="absolute inset-0">
                <picture className="absolute inset-0 w-full h-full">
                  <source media="(min-width: 768px)" srcSet={slide.desktop} />
                  <img src={slide.mobile} alt={t('hero.campaignAlt', { n: i + 1 })} className="absolute inset-0 w-full h-full object-cover object-center" />
                </picture>
              </div>
              <HeroOverlay className={slide.overlay.className} align={slide.overlay.align} />
            </div>
          </div>
        ))}

        {/* Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {heroSlides.map((_, i) => (
            <button key={i} onClick={() => setActiveHero(i)}
              className={`h-3 w-3 rounded-full transition ${activeHero === i ? 'bg-[#DD3935]' : 'bg-white/40'}`}
              aria-label={t('hero.slideAria', { n: i + 1 })} />
          ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-30 grid grid-cols-3 h-[5px]">
          <div className="bg-[#DD3935]" /><div className="bg-[#EBBD06]" /><div className="bg-[#027A4F]" />
        </div>
      </section>

      {/* ── Manifesto text ─── */}
      <section ref={manifestoRef} className="relative bg-white py-20 md:py-32 px-6 overflow-hidden">
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="-mt-10 text-4xl md:text-6xl font-black uppercase tracking-tight text-center mb-8">{t('home.manifestoTitle')}</h2>
          {manifestoStats && (
            <p className="-mt-4 mb-10 text-center font-mono text-sm md:text-base text-[#0C0C0A]/70">
              <AnimatedManifestoNumber value={manifestoStats.total_signers} active={manifestoCounterActive} />{' '}
              {t('home.manifestoStatsUsersSuffix')}{' '}
              <AnimatedManifestoNumber value={manifestoStats.total_countries} active={manifestoCounterActive} />{' '}
              {t('home.manifestoStatsCountriesSuffix')}
            </p>
          )}
          <div className="text-lg md:text-xl leading-relaxed">
            <div className="relative pl-6 my-12 py-6">
              <div className="absolute left-0 top-0 bottom-0 w-1 flex flex-col">
                <div className="flex-1 bg-[#DD3935]" />
                <div className="flex-1 bg-[#EBBD06]" />
                <div className="flex-1 bg-[#027A4F]" />
              </div>
              <div className="space-y-6 text-xl md:text-2xl font-bold leading-relaxed">
                <p>{t('home.manifestoP1Line1')}<br />{t('home.manifestoP1Line2')}</p>
                <p>{t('home.manifestoP2')}</p>
                <p>{t('home.manifestoP3Line1')}<br />{t('home.manifestoP3Line2')}</p>
                <p>
                  {t('home.manifestoP4')}
                  <span className="font-custard normal-case">#NotWaiting</span>
                </p>
              </div>
            </div>
             <div className="relative pl-6 my-12 py-6">
              <div className="absolute left-0 top-0 bottom-0 w-1 flex flex-col">
                <div className="flex-1 bg-[#DD3935]" />
                <div className="flex-1 bg-[#EBBD06]" />
                <div className="flex-1 bg-[#027A4F]" />
              </div>
              <ManifestoInlineForm />
            </div>
          </div>
          <div className="text-center mt-20">
            <p onClick={scrollToSignOn} className="text-xl md:text-2xl font-black uppercase text-[#DD3935] cursor-pointer hover:underline underline-offset-4 inline">
              {t('home.readyToJoin')}
            </p>
            <p className="mt-4 text-base md:text-lg text-[#0C0C0A]/70 max-w-2xl mx-auto leading-relaxed">
              {t('home.waveExplainer')}
            </p>
          </div>
        </div>
      </section>

      {/* ── Sign form ─── */}
      <ManifestoSignForm ref={signOnRef} onSuccess={handleSignSuccess} />

      {/* ── Wave mark teaser ─── */}
      <section className="bg-[#EBBD06] text-[#0C0C0A] py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-tight">
                {t('home.markHeading1')}<br /><span className="text-[#DD3935]"> {t('home.markHeading2')}</span>
              </h2>
              <p className="text-base md:text-lg text-[#0C0C0A]/90 leading-relaxed max-w-xl">
                {t('home.markBlurb')}
              </p>
              {[
                { n: '01', title: t('home.markStep1Title'), desc: t('home.markStep1Desc') },
                { n: '02', title: t('home.markStep2Title'), desc: t('home.markStep2Desc') },
                { n: '03', title: t('home.markStep3Title'), desc: t('home.markStep3Desc') },
              ].map(({ n, title, desc }) => (
                <div key={n} className="flex gap-4">
                  <span className="text-[#DD3935] font-black font-mono text-lg flex-shrink-0">{n}</span>
                  <div><h3 className="font-black text-lg mb-1">{title}</h3><p className="text-sm text-[#0C0C0A]/80">{desc}</p></div>
                </div>
              ))}
              <Button onClick={() => navigate('/get-mark')} className="text-base px-8 py-4">{t('home.openMarkTool')}</Button>
            </div>
            <div className="space-y-6">
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <img src={waveMarkExample} alt={t('home.markExampleAlt')} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats section ─── */}
      <StatsSection
        onJoinClick={scrollToSignOn}
        stats={displayedManifestoStats}
        onRefresh={loadManifestoStats}
      />

      {/* ── Stories slider ─── */}
      <StoriesSlider />

      {/* ── Protocol ─── */}
      <section className="bg-[#F5F5F5] py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-12 text-center">{t('home.protocolTitle')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { step: '01', title: t('home.protocol.build'),  desc: t('home.protocol.buildDesc') },
              { step: '02', title: t('home.protocol.mark'),   desc: t('home.protocol.markDesc') },
              { step: '03', title: t('home.protocol.share'),  desc: t('home.protocol.shareDesc') },
              { step: '04', title: t('home.protocol.tag'),    desc: t('home.protocol.tagDesc') },
              { step: '05', title: t('home.protocol.grow'),   desc: t('home.protocol.growDesc') },
            ].map(({ step, title, desc }) => (
              <div key={step} className="bg-white border-2 border-[#0C0C0A] p-6 text-center">
                <div className="text-sm font-mono text-[#EBBD06] font-black mb-2">{step}</div>
                <h3 className="text-xl font-black uppercase mb-2">{title}</h3>
                <p className="text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
