import { useState } from 'react';
import { Link } from 'react-router';
import { ChevronDownIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type FaqItem = { q: string; a: string; note?: string };
type FaqSection = { id: string; title: string; color: string; items: FaqItem[] };

const SECTION_DEFS: { id: string; key: string; color: string; itemKeys: string[] }[] = [
  { id: 'what-it-is', key: 'whatItIs',   color: '#DD3935', itemKeys: ['q1', 'q2'] },
  { id: 'joining',    key: 'joining',    color: '#EBBD06', itemKeys: ['q1', 'q2', 'q3', 'q4'] },
  { id: 'wave',       key: 'wave',       color: '#027A4F', itemKeys: ['q1', 'q2', 'q3', 'q4'] },
  { id: 'mark',       key: 'mark',       color: '#DD3935', itemKeys: ['q1', 'q2'] },
  { id: 'stories',    key: 'stories',    color: '#EBBD06', itemKeys: ['q1', 'q2'] },
  { id: 'privacy',    key: 'privacy',    color: '#027A4F', itemKeys: ['q1', 'q2'] },
];

function FaqAccordionItem({ item, sectionColor }: { item: FaqItem; sectionColor: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#0C0C0A]/10 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left group"
        aria-expanded={open}
      >
        <span className="font-black text-base md:text-lg leading-snug group-hover:text-[#DD3935] transition-colors">
          {item.q}
        </span>
        <ChevronDownIcon
          className="flex-shrink-0 w-5 h-5 mt-0.5 text-[#0C0C0A]/40 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>
      {open && (
        <div className="pb-6 space-y-3">
          {item.a.split('\n\n').map((para, i) => (
            <p key={i} className="text-base leading-relaxed text-[#0C0C0A]/80">
              {para}
            </p>
          ))}
          {item.note && (
            <div
              className="mt-4 pl-4 py-3 text-sm leading-relaxed text-[#0C0C0A]/60 italic"
              style={{ borderLeft: `3px solid ${sectionColor}` }}
            >
              {item.note}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  const { t } = useTranslation();

  const sections: FaqSection[] = SECTION_DEFS.map((def) => ({
    id: def.id,
    title: t(`faq.sections.${def.key}.title`),
    color: def.color,
    items: def.itemKeys.map((qKey) => {
      const base = `faq.sections.${def.key}.items.${qKey}`;
      const note = t(`${base}.note`, { defaultValue: '' });
      return {
        q: t(`${base}.q`),
        a: t(`${base}.a`),
        ...(note ? { note } : {}),
      };
    }),
  }));

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <section className="bg-[#0C0C0A] text-white py-20 md:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="font-mono text-sm uppercase tracking-widest text-[#EBBD06] mb-4">{t('faq.kicker')}</p>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase leading-[0.9] tracking-tight mb-6">
            {t('faq.title')}
          </h1>
          <div className="grid grid-cols-3 h-[5px] max-w-xs mb-8">
            <div className="bg-[#DD3935]" />
            <div className="bg-[#EBBD06]" />
            <div className="bg-[#027A4F]" />
          </div>
          <p className="text-xl md:text-2xl font-black leading-tight max-w-2xl">
            {t('faq.lead')}
          </p>
          <p className="text-base text-white/60 mt-3 max-w-xl">{t('faq.leadSub')}</p>
        </div>
      </section>

      {/* Sections */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-4xl mx-auto space-y-16">
          {sections.map((section) => (
            <div key={section.id}>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-8 w-1.5 flex-shrink-0" style={{ backgroundColor: section.color }} />
                <h2
                  className="text-xs font-black uppercase tracking-[0.2em] font-mono"
                  style={{ color: section.color }}
                >
                  {section.title}
                </h2>
              </div>
              <div className="pl-0 md:pl-6 border border-[#0C0C0A]/10 bg-white divide-y-0">
                {section.items.map((item, i) => (
                  <FaqAccordionItem key={i} item={item} sectionColor={section.color} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="bg-[#F5F5F5] py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-mono text-sm uppercase tracking-widest text-[#027A4F] mb-4">{t('faq.ctaKicker')}</p>
          <h2 className="text-3xl md:text-5xl font-black uppercase mb-6">{t('faq.ctaTitle')}</h2>
          <p className="text-base text-[#0C0C0A]/70 mb-8 max-w-md mx-auto">
            {t('faq.ctaBody')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-block bg-[#DD3935] text-white font-black uppercase tracking-wide px-8 py-4 hover:bg-[#0C0C0A] transition-colors"
            >
              {t('faq.contactUs')}
            </Link>
            <Link
              to="/"
              className="inline-block border-2 border-[#0C0C0A] text-[#0C0C0A] font-black uppercase tracking-wide px-8 py-4 hover:bg-[#0C0C0A] hover:text-white transition-colors"
            >
              {t('faq.signManifesto')}
            </Link>
          </div>
          <p className="mt-12 text-sm text-[#0C0C0A]/40">
            {t('faq.footerLine')}
          </p>
        </div>
      </section>

    </div>
  );
}
