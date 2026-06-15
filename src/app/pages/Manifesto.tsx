import { useCallback, useState, useRef, useEffect } from 'react';
// import { Link } from 'react-router';            // only used by the commented-out previous content
import { useTranslation } from 'react-i18next';
// import { Button } from '../components/Button';   // only used by the commented-out previous content
import { ManifestoInlineForm } from '../components/ManifestoInlineForm';
// import waveImage from '../../imports/Manifestobg.png'; // only used by the commented-out previous content
import { getSignerCount } from '../utils/api';

type ManifestoStats = {
  total_signers: number
  total_countries: number
}

// Moved from the homepage together with the "Sign the Manifesto" section.
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

export default function Manifesto() {
  const { t } = useTranslation();

  const [manifestoStats, setManifestoStats] = useState<ManifestoStats | null>(null)
  const [manifestoCounterActive, setManifestoCounterActive] = useState(false)

  const manifestoRef = useRef<HTMLElement>(null)
  const signOnRef = useRef<HTMLDivElement>(null)

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

  const scrollToSignOn = () => signOnRef.current?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="min-h-screen bg-white overflow-hidden">

      {/* ── Sign the Manifesto (moved here from the homepage) ── */}
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
             <div ref={signOnRef} className="relative pl-6 my-12 py-6">
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

    </div>
  );
}

/*
 * ─────────────────────────────────────────────────────────────────
 * Previous Manifesto page content — commented out.
 * Replaced by the "Sign the Manifesto" section moved from the homepage
 * above. Kept for reference; re-enable by restoring the JSX below and
 * the Link / Button / waveImage imports at the top of the file.
 * ─────────────────────────────────────────────────────────────────
 */
// <div className="min-h-screen bg-white overflow-hidden">
//
//   {/* ── MOBILE ───────────────────────────────────────────── */}
//   <section className="md:hidden px-6 py-16">
//     <div className="max-w-lg mx-auto space-y-8 text-center">
//       <h1 className="font-druk text-3xl leading-tight text-[#0C0C0A]">
//         {t('manifestoPage.titleLine1')}<br />{t('manifestoPage.titleLine2')}
//       </h1>
//       <img
//         src={waveImage}
//         alt=""
//         aria-hidden="true"
//         className="w-full h-auto object-contain mx-auto max-w-xs"
//       />
//       <div className="space-y-4 font-mono text-sm leading-relaxed text-[#0C0C0A] text-left">
//         <p>{t('manifestoPage.p1')}</p>
//         <p>{t('manifestoPage.p2')}</p>
//         <p>{t('manifestoPage.p3')}</p>
//         <p>{t('manifestoPage.p4')}</p>
//         <p>{t('manifestoPage.p5')}</p>
//         <p>{t('manifestoPage.p6')}</p>
//       </div>
//       <p className="font-druk text-xl text-[#0C0C0A]">
//         "I am <span className="font-custard normal-case">#NotWaiting</span>."
//       </p>
//       <Link to="/">
//         <Button className="font-mono bg-[#DD3935] hover:bg-[#C92F2B] text-white px-8 py-3 rounded-full uppercase">
//           {t('manifestoPage.joinCta')}
//         </Button>
//       </Link>
//     </div>
//   </section>
//
//   {/* ── DESKTOP ──────────────────────────────────────────── */}
//   {/*
//     Layout matches the reference image:
//     - Image fills full width, no padding
//     - Title sits inside the top of the green shape (~top 8%)
//     - Body copy fills the green shape area (~top 20%)
//     - "I am #NotWaiting." sits below body, still inside green (~top 55%)
//     - Button below the wave mark at bottom (~bottom 5%)
//   */}
//   <section className="hidden md:block w-full">
//     <div className="relative w-full">
//
//       {/* Wave image — full width, no constraints */}
//       <img
//         src={waveImage}
//         alt=""
//         aria-hidden="true"
//         className="w-full h-auto object-cover block"
//       />
//
//       {/*
//         HEADING — "Opportunity Africa Manifesto"
//         Positioned inside the top of the green shape.
//         NOT uppercase — reference image shows mixed case.
//         font-druk for weight, but normal capitalisation.
//         White text to show against the dark green background.
//       */}
//       <div className="absolute top-[7%] left-[35%] w-[34%] text-center">
//         <h1 className="font-druk text-xl md:text-2xl lg:text-3xl leading-tight text-white">
//           {t('manifestoPage.titleLine1')}
//           <br />
//           {t('manifestoPage.titleLine2')}
//         </h1>
//       </div>
//
//       {/*
//         BODY COPY — inside the green shape
//         font-mono, white text, centered, small size to fit the shape
//       */}
//       <div className="absolute top-[19%] left-[23%] w-[37%] text-center">
//         <div className="space-y-2 font-mono text-[9px] md:text-[11px] lg:text-[13px] leading-snug text-white">
//           <p>{t('manifestoPage.p1')}</p>
//           <p>{t('manifestoPage.p2')}</p>
//           <p>{t('manifestoPage.p3')}</p>
//           <p>{t('manifestoPage.p4')}</p>
//           <p>{t('manifestoPage.p5')}</p>
//           <p>{t('manifestoPage.p6')}</p>
//         </div>
//       </div>
//
//       {/*
//         CLOSING — "I am #NotWaiting."
//         Still inside the green shape, below body copy.
//         Large and bold. #NotWaiting in Custard font.
//       */}
//       <div className="absolute top-[54%] left-[30%] w-[37%] text-center">
//         <p className="font-druk text-sm md:text-base lg:text-4xl text-white">
//           "I am <span className="font-custard normal-case">#NotWaiting</span>."
//         </p>
//       </div>
//
//       {/* CTA BUTTON — centred below the wave mark */}
//       <div className="absolute left-1/2 -translate-x-1/2 bottom-[4%] z-20">
//         <Link to="/">
//           <Button className="font-mono bg-[#DD3935] hover:bg-[#C92F2B] text-white text-sm md:text-base px-10 py-4 rounded-full uppercase">
//             {t('manifestoPage.joinCta')}
//           </Button>
//         </Link>
//       </div>
//     </div>
//   </section>
//
// </div>
