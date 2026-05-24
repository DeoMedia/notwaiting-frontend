import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/Button';
import patternBg2 from '../../imports/PATTERN2.png';

// YouTube Short uploaded to @notwaitingAfrica. Vertical 9:16 video — will
// pillarbox inside the 16:9 embed frame, which is the standard look for
// Shorts embeds on the web.
const EXPLAINER_VIDEO_IDS: Record<string, string> = {
  en: 'M1k-nKAonf4',
  fr: 'nsfx-nXVh8w',
};

export default function About() {
  const { t, i18n } = useTranslation();
  const explainerVideoId =
    EXPLAINER_VIDEO_IDS[i18n.language.split('-')[0]] ?? EXPLAINER_VIDEO_IDS.en;

  const beliefs = [
    { num: '01', color: '#DD3935', title: t('about.belief1Title'), body: t('about.belief1Body') },
    { num: '02', color: '#EBBD06', title: t('about.belief2Title'), body: t('about.belief2Body') },
    { num: '03', color: '#027A4F', title: t('about.belief3Title'), body: t('about.belief3Body') },
    { num: '04', color: '#0145F2', title: t('about.belief4Title'), body: t('about.belief4Body') },
  ];

  const audience = [
    { title: t('about.buildersTitle'),   body: t('about.buildersBody'),   color: '#DD3935' },
    { title: t('about.creatorsTitle'),   body: t('about.creatorsBody'),   color: '#EBBD06' },
    { title: t('about.innovatorsTitle'), body: t('about.innovatorsBody'), color: '#027A4F' },
    { title: t('about.supportersTitle'), body: t('about.supportersBody'), color: '#0145F2' },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO HEADER ─────────────────────────────────────── */}
      <section className="bg-[#EBBD06] text-[#0C0C0A] py-20 md:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-druk font-bold text-5xl sm:text-7xl md:text-8xl uppercase leading-[0.9] tracking-tight mb-6">
            {t('about.heading1')}
            <br />
            <span className="font-custard normal-case text-[#DD3935]">
              #NotWaiting
            </span>
          </h1>

          {/* Colour bar */}
          <div className="grid grid-cols-3 h-[5px] max-w-xs mb-10">
            <div className="bg-[#DD3935]" />
            <div className="bg-[#0C0C0A]" />
            <div className="bg-[#027A4F]" />
          </div>

          <p className="font-druk font-bold text-xl md:text-2xl leading-tight max-w-2xl">
            {t('about.lead')}
          </p>

          <p className="font-mono text-base text-[#0C0C0A]/70 mt-4 max-w-xl leading-relaxed">
            {t('about.intro')}
          </p>
        </div>
      </section>

      {/* ── EXPLAINER VIDEO ──────────────────────────────────── */}
      <section
        className="py-16 md:py-24 px-6 border-b border-[#0C0C0A]/10 relative overflow-hidden"
        style={{
          backgroundImage: `url(${patternBg2})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '480px auto',
        }}
      >
        {/* Overlay to tone down the pattern */}
        <div className="absolute inset-0 bg-white/80 pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="relative w-full aspect-video">
            <iframe
              key={explainerVideoId}
              src={`https://www.youtube-nocookie.com/embed/${explainerVideoId}?rel=0&modestbranding=1`}
              title={t('about.explainerTitle', { defaultValue: 'NotWaiting explainer video' })}
              className="absolute inset-0 w-full h-full"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* ── MISSION ─────────────────────────────────────────── */}
      <section className="py-16 md:py-24 px-6 border-b border-[#0C0C0A]/10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-8 w-1.5 flex-shrink-0 bg-[#DD3935]" />
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#DD3935]">
              {t('about.missionTitle') ?? 'Our Mission'}
            </p>
          </div>

          <div className="md:pl-6">
            <p className="font-druk font-bold text-2xl md:text-3xl leading-tight max-w-3xl mb-8">
              {t('about.missionBody')}
            </p>

            <div className="bg-[#F5F5F5] border-l-4 border-[#DD3935] pl-6 py-5">
              <p className="font-mono text-base leading-relaxed text-[#0C0C0A]/80">
                {t('about.intro')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT WE BELIEVE ─────────────────────────────────── */}
      <section className="py-16 md:py-24 px-6 bg-[#F5F5F5] border-b border-[#0C0C0A]/10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-8 w-1.5 flex-shrink-0 bg-[#EBBD06]" />
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#EBBD06]">
              {t('about.beliefTitle') ?? 'What We Believe'}
            </p>
          </div>

          <div className="md:pl-6 space-y-5">
            {beliefs.map((b) => (
              <div
                key={b.num}
                className="bg-white p-6 flex gap-6 items-start"
                style={{ borderLeft: `4px solid ${b.color}` }}
              >
                <span
                  className="font-mono text-3xl font-bold leading-none flex-shrink-0"
                  style={{ color: b.color }}
                >
                  {b.num}
                </span>
                <div>
                  <p className="font-druk font-bold text-lg uppercase mb-2">{b.title}</p>
                  <p className="font-mono text-sm text-[#0C0C0A]/70 leading-relaxed">{b.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHO THIS IS FOR ─────────────────────────────────── */}
      <section className="py-16 md:py-24 px-6 border-b border-[#0C0C0A]/10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-8 w-1.5 flex-shrink-0 bg-[#027A4F]" />
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#027A4F]">
              {t('about.whoFor') ?? 'Who This Is For'}
            </p>
          </div>

          <div className="md:pl-6 grid sm:grid-cols-2 gap-5">
            {audience.map((a) => (
              <div
                key={a.title}
                className="bg-[#F5F5F5] p-6"
                style={{ borderTop: `3px solid ${a.color}` }}
              >
                <p
                  className="font-druk font-bold text-lg uppercase mb-3"
                  style={{ color: a.color }}
                >
                  {a.title}
                </p>
                <p className="font-mono text-sm text-[#0C0C0A]/70 leading-relaxed">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FOOTER ──────────────────────────────────────── */}
      <section className="bg-[#F5F5F5] py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-druk font-bold text-3xl md:text-5xl uppercase mb-6">
            {t('about.joinTitle')}
          </h2>
          <p className="font-mono text-base text-[#0C0C0A]/70 mb-10 max-w-md mx-auto leading-relaxed">
            {t('about.joinBody')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button className="text-lg px-12 py-5">
                {t('about.signCta')}
              </Button>
            </Link>
            <Link
              to="/stories"
              className="font-mono inline-block border-2 border-[#0C0C0A] text-[#0C0C0A] font-bold uppercase tracking-wide px-10 py-4 hover:bg-[#027a4f] hover:text-white transition-colors"
            >
              Read the stories →
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}