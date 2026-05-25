import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Button } from '../components/Button';

import mdfLogo from '../../imports/MDF.png';
import oaxtnfLogo from '../../imports/OAxTNF.png';
import partnerLogo from '../../styles/partner_logo.jpeg';

const PARTNER_KEYS = [
  'africanTechFoundation',
  'panAfricanInnovationNetwork',
  'futureOfWork',
  'climateSolutions',
  'creativeAfrica',
  'healthInnovation',
] as const;

const BENEFIT_KEYS = ['amplification', 'credibility', 'access', 'impact'] as const;

const BENEFIT_COLORS = ['#DD3935', '#EBBD06', '#027A4F', '#0145F2'];

export default function Partners() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO HEADER ─────────────────────────────────────── */}
      <section className="bg-[#0145F2] text-white py-20 md:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="font-mono text-sm uppercase tracking-widest text-[#EBBD06] mb-4">
            Coalition Partners
          </p>
          <h1 className="font-druk text-5xl sm:text-7xl md:text-8xl uppercase leading-[0.9] tracking-tight mb-6">
            {t('partners.title')}
          </h1>

          {/* Colour bar */}
          <div className="grid grid-cols-3 h-[5px] max-w-xs mb-10">
            <div className="bg-[#DD3935]" />
            <div className="bg-[#EBBD06]" />
            <div className="bg-white/40" />
          </div>

          <p className="font-mono text-base text-white/60 max-w-xl leading-relaxed">
            {t('partners.subtitle').split('#NotWaiting').map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 && (
                  <span className="font-custard normal-case text-white">#NotWaiting</span>
                )}
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* ── PARTNER LOGOS ────────────────────────────────────── */}
      <section className="py-20 md:py-32 px-6 bg-white border-b border-[#0C0C0A]/10">
        <div className="max-w-6xl mx-auto">

          {/* Section label */}
          <div className="flex items-center gap-4 mb-14">
            <div className="h-8 w-1.5 flex-shrink-0 bg-[#DD3935]" />
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#DD3935]">
              Our Partners
            </p>
          </div>

          {/* Logo row */}
          <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20">
            <img
              src={mdfLogo}
              alt="Mo Dewji Foundation"
              className="h-48 sm:h-56 md:h-72 lg:h-80 w-auto max-w-[420px] object-contain hover:scale-105 transition-transform duration-300"
            />
            <img
              src={oaxtnfLogo}
              alt="OA x Trevor Noah Foundation"
              className="h-48 sm:h-56 md:h-72 lg:h-80 w-auto max-w-[420px] object-contain hover:scale-105 transition-transform duration-300"
            />
            <img
              src={partnerLogo}
              alt="Partner"
              className="h-48 sm:h-56 md:h-72 lg:h-80 w-auto max-w-[420px] object-contain hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </section>

      {/* ── WHY PARTNER ─────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-6 bg-[#F5F5F5] border-b border-[#0C0C0A]/10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-8 w-1.5 flex-shrink-0 bg-[#EBBD06]" />
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#EBBD06]">
              {t('partners.whyTitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {BENEFIT_KEYS.map((key, i) => (
              <div
                key={key}
                className="bg-white p-6"
                style={{ borderLeft: `4px solid ${BENEFIT_COLORS[i]}` }}
              >
                <p
                  className="font-druk text-lg uppercase mb-2"
                  style={{ color: BENEFIT_COLORS[i] }}
                >
                  {t(`partners.benefits.${key}.title`)}
                </p>
                <p className="font-mono text-sm text-[#0C0C0A]/70 leading-relaxed">
                  {t(`partners.benefits.${key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FOOTER ──────────────────────────────────────── */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
            <div className="h-8 w-1.5 flex-shrink-0 bg-[#027A4F]" />
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#027A4F]">
              Get Involved
            </p>
          </div>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-druk text-3xl md:text-5xl uppercase mb-6">
            {t('partners.becomeTitle')}
          </h2>
          <p className="font-mono text-base text-[#0C0C0A]/70 mb-10 max-w-md mx-auto leading-relaxed">
            {t('partners.becomeBody')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button className="text-lg px-12 py-5">
                {t('partners.getInTouch')}
              </Button>
            </Link>
            <Link
              to="/about"
              className="font-mono inline-block border-2 border-[#0C0C0A] text-[#0C0C0A] font-bold uppercase tracking-wide px-10 py-4 hover:bg-[#0C0C0A] hover:text-white transition-colors"
            >
              Learn more →
            </Link>
          </div>
        </div>
        </div>
      </section>

    </div>
  );
}