import { useCallback, useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/Button';
// import { ManifestoSignForm } from '../components/ManifestoSignForm'; // section commented out
// import { ManifestoInlineForm } from '../components/ManifestoInlineForm'; // section moved to the Manifesto page
// import { StoriesSlider } from '../components/StoriesSlider'; // section commented out
import { StatsSection } from '../components/StatsSection';
import { HeroOverlay } from '../components/HeroOverlay';
import heroDesktop1 from '../../styles/Landing1.png';
import heroDesktop2 from '../../styles/Landing2.webp';
import heroDesktop3 from '../../styles/Landing3.png';
// import heroDesktop4 from '../../styles/Landing4.webp';
import heroMobile1 from '../../styles/PhoneLandingmobile-01.png';
import heroMobile2 from '../../styles/PhoneLandingmobile-02.png';
import heroMobile3 from '../../styles/PhoneLandingmobile-03.png';
// import heroMobile4 from '../../styles/PhoneLandingmobile-04.webp';
// import patternBg2 from '../../imports/PATTERN_1-1.png';
import waveMarkExample from '../../styles/wave_mark_sample.jpeg';
import { useNavigate, useLocation } from 'react-router';
import { getSignerCount } from '../utils/api';

// Manifesto auto-scroll disabled — flag no longer used.
// let manifestoAutoScrolled = false;
// ── Hero videos ──────────────────────────────────────────────────────────────
// Files live in /public/videos/ — Vite copies them as-is, no bundling.
// They are NOT imported so they never appear in the JS bundle or Workbox
// precache manifest. Served directly by the web server on demand.
const VIDEO_EN = '/videos/Explainer_ENG.mp4'
const VIDEO_FR = '/videos/Explainer_FRE.mp4'

let manifestoAutoScrolled = false;

type ManifestoStats = {
  total_signers: number
  total_countries: number
}

// ── Play / Pause icon SVGs (inline, no extra dependency) ─────────────────────
function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 md:w-9 md:h-9">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 md:w-9 md:h-9">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  )
}

function MuteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-6 md:h-6">
      <path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z" />
    </svg>
  )
}

function UnmuteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-6 md:h-6">
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t, i18n } = useTranslation()

  // ── Video state ─────────────────────────────────────────────────────────────
  const [isVideoMode, setIsVideoMode] = useState(false)
  const [isMuted,     setIsMuted]     = useState(true)
  const [videoEnded,  setVideoEnded]  = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const isFr     = i18n.language.startsWith('fr')
  const videoSrc = isFr ? VIDEO_FR : VIDEO_EN

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = isMuted
  }, [isMuted])

  useEffect(() => {
    if (!isVideoMode || !videoRef.current) return
    videoRef.current.load()
    void videoRef.current.play().catch(() => {})
    setVideoEnded(false)
  }, [isFr, isVideoMode])

  const handlePlayPause = () => {
    if (!isVideoMode) {
      setIsVideoMode(true)
      setVideoEnded(false)
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.muted = isMuted
          void videoRef.current.play().catch(() => {})
        }
      }, 50)
    } else {
      videoRef.current?.pause()
      setIsVideoMode(false)
      setVideoEnded(false)
    }
  }

  const handleVideoEnded = () => {
    setVideoEnded(true)
    setIsVideoMode(false)
  }

  // ── Image carousel ──────────────────────────────────────────────────────────
  const heroSlides: Array<{
    desktop: string
    mobile: string
    overlay: { className: string; align: 'left' | 'center' | 'right' }
  }> = [
    {
      desktop: heroDesktop3,
      mobile: heroMobile1,
      overlay: {
        align: 'center',
        className:
          'top-[3%] left-1/2 -translate-x-1/2 w-[90%] md:top-1/2 md:left-auto md:-translate-x-0 md:-translate-y-1/2 md:right-[18%] md:w-[48%]',
      },
    },
    {
      desktop: heroDesktop1,
      mobile: heroMobile2,
      overlay: {
        align: 'center',
        className:
          'top-[3%] left-1/2 -translate-x-1/2 w-[90%] md:top-1/2 md:-translate-y-1/2 md:left-[6%] md:translate-x-0 md:w-[42%]',
      },
    },
    {
      desktop: heroDesktop2,
      mobile: heroMobile3,
      overlay: {
        align: 'center',
        className:
          'top-[3%] left-1/2 -translate-x-1/2 w-[90%] md:top-[18%] md:left-[8%] md:translate-x-0 md:w-[44%]',
      },
    },
  ]

  const [activeHero, setActiveHero] = useState(0)
  const [manifestoStats, setManifestoStats] = useState<ManifestoStats | null>(null)

  const signOnRef = useRef<HTMLDivElement>(null)
  const displayedManifestoStats = manifestoStats ?? { total_signers: 0, total_countries: 0 }

  const loadManifestoStats = useCallback(async () => {
    try {
      const data = await getSignerCount()
      setManifestoStats({
        total_signers:   data.total_signers   ?? 0,
        total_countries: data.total_countries ?? 0,
      })
    } catch {
      // Non-critical — keep the last known aggregate count.
    }
  }, [])

  useEffect(() => {
    if (isVideoMode) return
    const timer = setInterval(() => setActiveHero(prev => (prev + 1) % heroSlides.length), 6000)
    return () => clearInterval(timer)
  }, [heroSlides.length, isVideoMode])

  useEffect(() => { loadManifestoStats() }, [loadManifestoStats])

  const scrollToSignOn = () => signOnRef.current?.scrollIntoView({ behavior: 'smooth' })

  const wantsSignOn = (location.state as { scrollTo?: string } | null)?.scrollTo === 'signOn'

  useEffect(() => {
    if (!wantsSignOn) return
    const timer = setTimeout(() => {
      signOnRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
    return () => clearTimeout(timer)
  }, [wantsSignOn])

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen bg-black text-[#0C0C0A] overflow-hidden">

        {/* ── Image slides (hidden while video is active) ── */}
        <div className={`absolute inset-0 transition-opacity duration-700 ${isVideoMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          {heroSlides.map((slide, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-700 ${activeHero === i ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <div className="relative min-h-screen overflow-hidden">
                <div className="absolute inset-0">
                  <picture className="absolute inset-0 w-full h-full">
                    <source media="(min-width: 768px)" srcSet={slide.desktop} />
                    <img
                      src={slide.mobile}
                      alt={t('hero.campaignAlt', { n: i + 1 })}
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                  </picture>
                </div>
                <HeroOverlay className={slide.overlay.className} align={slide.overlay.align} />
              </div>
            </div>
          ))}
        </div>

        {/* ── Video layer ── */}
        <div className={`absolute inset-0 z-20 transition-opacity duration-700 ${isVideoMode ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <video
            ref={videoRef}
            key={videoSrc}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted
            onEnded={handleVideoEnded}
            aria-label={t('hero.videoAria')}
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        </div>

        {/* ── Slide dots (hidden in video mode) ── */}
        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3 transition-opacity duration-300 ${isVideoMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveHero(i)}
              className={`h-3 w-3 rounded-full transition ${activeHero === i ? 'bg-[#DD3935]' : 'bg-white/40'}`}
              aria-label={t('hero.slideAria', { n: i + 1 })}
            />
          ))}
        </div>

        {/* ── Play / Pause + Mute controls ── */}
        <div className="absolute bottom-6 right-5 z-40 flex items-center gap-3">
          {isVideoMode && (
            <button
              onClick={() => setIsMuted(m => !m)}
              className="flex items-center justify-center w-9 h-9 md:w-11 md:h-11 rounded-full bg-black/50 text-white backdrop-blur-sm border border-white/20 hover:bg-black/70 transition"
              aria-label={isMuted ? t('hero.unmuteAria') : t('hero.muteAria')}
            >
              {isMuted ? <UnmuteIcon /> : <MuteIcon />}
            </button>
          )}
          <button
            onClick={handlePlayPause}
            className="flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#DD3935] text-white shadow-lg hover:bg-[#c0302c] active:scale-95 transition-transform"
            aria-label={isVideoMode ? t('hero.pauseAria') : t('hero.playAria')}
          >
            {isVideoMode ? <PauseIcon /> : <PlayIcon />}
          </button>
        </div>

        {/* ── Tri-colour bar ── */}
        <div className="absolute bottom-0 left-0 right-0 z-40 grid grid-cols-3 h-[5px]">
          <div className="bg-[#DD3935]" />
          <div className="bg-[#EBBD06]" />
          <div className="bg-[#027A4F]" />
        </div>
      </section>

      {/* ── Wave mark teaser ──────────────────────────────────────────────── */}
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

      {/* ── Sign the Manifesto CTA ─── */}
      <section className="bg-white py-16 md:py-24 px-6">
        <div className="max-w-3xl mx-auto flex justify-center">
          <Button onClick={() => navigate('/manifesto')} className="text-base md:text-lg px-10 py-5">
            {t('home.signCta')}
          </Button>
        </div>
      </section>

      {/* ── Stats section ─── */}
      <StatsSection
        onJoinClick={scrollToSignOn}
        stats={displayedManifestoStats}
        onRefresh={loadManifestoStats}
      />

      {/* ── Protocol ──────────────────────────────────────────────────────────── */}
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