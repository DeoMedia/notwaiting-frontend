import { useTranslation } from 'react-i18next';

const siteUrl = import.meta.env.VITE_FRONTEND_URL ?? 'notwaiting.com';

type PolicySection = {
  num: string;
  title: string;
  content: React.ReactNode;
};

export default function Privacy() {
  const { t } = useTranslation();

  const sections: PolicySection[] = [
    {
      num: '01',
      title: t('privacy.sec1Title'),
      content: (
        <div className="space-y-4">
          <p>
            {t('privacy.sec1P1Pre')}<strong>{t('privacy.sec1P1Bold1')}</strong>{t('privacy.sec1P1Mid')}<strong>{t('privacy.sec1P1Bold2')}</strong>{t('privacy.sec1P1Suffix')}
          </p>
          <p>{t('privacy.sec1P2')}</p>
          <div className="bg-[#F5F5F5] p-4 text-sm space-y-1">
            <p><strong>{t('privacy.sec1RegisteredAddress')}</strong>{t('privacy.sec1RegisteredValue')}</p>
            <p><strong>{t('privacy.sec1DataQueries')}</strong>{' '}
              <a href="mailto:privacy@africanofilter.org" className="text-[#DD3935] underline underline-offset-2 hover:text-[#0C0C0A] transition-colors">
                privacy@africanofilter.org
              </a>
            </p>
          </div>
        </div>
      ),
    },
    {
      num: '02',
      title: t('privacy.sec2Title'),
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="font-black uppercase text-sm mb-3 text-[#0C0C0A]/60">{t('privacy.sec2YouProvide')}</h3>
            <ul className="space-y-2">
              {[
                t('privacy.sec2Provide1'),
                t('privacy.sec2Provide2'),
                t('privacy.sec2Provide3'),
                t('privacy.sec2Provide4'),
                t('privacy.sec2Provide5'),
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-[#DD3935] font-black flex-shrink-0 mt-0.5">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-black uppercase text-sm mb-3 text-[#0C0C0A]/60">{t('privacy.sec2Auto')}</h3>
            <ul className="space-y-2">
              {[
                t('privacy.sec2Auto1'),
                t('privacy.sec2Auto2'),
                t('privacy.sec2Auto3'),
                t('privacy.sec2Auto4'),
                t('privacy.sec2Auto5'),
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-[#027A4F] font-black flex-shrink-0 mt-0.5">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[#EBBD06]/20 border-l-4 border-[#EBBD06] pl-4 py-3 text-sm">
            {t('privacy.sec2DoNot')}
          </div>
        </div>
      ),
    },
    {
      num: '03',
      title: t('privacy.sec3Title'),
      content: (
        <ul className="space-y-3">
          {(['i1', 'i2', 'i3', 'i4', 'i5', 'i6'] as const).map((k, i) => (
            <li key={i} className="flex gap-4">
              <span className="text-[#DD3935] font-black font-mono text-sm flex-shrink-0 mt-0.5">→</span>
              <div>
                <strong>{t(`privacy.sec3Items.${k}Title`)}</strong> — {t(`privacy.sec3Items.${k}Desc`)}
              </div>
            </li>
          ))}
        </ul>
      ),
    },
    {
      num: '04',
      title: t('privacy.sec4Title'),
      content: (
        <div className="space-y-4">
          <p className="text-[#0C0C0A]/70">{t('privacy.sec4Intro')}</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: t('privacy.sec4.consentLabel'), desc: t('privacy.sec4.consentDesc'), color: '#DD3935' },
              { label: t('privacy.sec4.legitLabel'),   desc: t('privacy.sec4.legitDesc'),   color: '#EBBD06' },
              { label: t('privacy.sec4.contractLabel'),desc: t('privacy.sec4.contractDesc'),color: '#027A4F' },
              { label: t('privacy.sec4.legalLabel'),   desc: t('privacy.sec4.legalDesc'),   color: '#0C0C0A' },
            ].map(({ label, desc, color }) => (
              <div key={label} className="bg-[#F5F5F5] p-4" style={{ borderLeft: `4px solid ${color}` }}>
                <h3 className="font-black mb-1">{label}</h3>
                <p className="text-sm text-[#0C0C0A]/70">{desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-[#F5F5F5] p-4 text-sm space-y-2 mt-2">
            <p><strong>{t('privacy.sec4NigeriaLabel')}</strong>{t('privacy.sec4NigeriaBody')}<span className="font-mono">ndpc.gov.ng</span>.</p>
          </div>
        </div>
      ),
    },
    {
      num: '05',
      title: t('privacy.sec5Title'),
      content: (
        <div className="space-y-6">
          <p>{t('privacy.sec5Intro')}</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#0C0C0A] text-white">
                  <th className="text-left p-3 font-black">{t('privacy.sec5Cols.category')}</th>
                  <th className="text-left p-3 font-black">{t('privacy.sec5Cols.cookie')}</th>
                  <th className="text-left p-3 font-black">{t('privacy.sec5Cols.purpose')}</th>
                  <th className="text-left p-3 font-black">{t('privacy.sec5Cols.duration')}</th>
                  <th className="text-left p-3 font-black">{t('privacy.sec5Cols.consent')}</th>
                </tr>
              </thead>
              <tbody>
                {(['r1', 'r2', 'r3', 'r4', 'r5', 'r6'] as const).map((rk, i) => {
                  const row = t(`privacy.sec5Rows.${rk}`, { returnObjects: true }) as string[];
                  return (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F5F5F5]'}>
                      {row.map((cell, j) => (
                        <td key={j} className="p-3 border-b border-[#0C0C0A]/10">{cell}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="space-y-3 text-sm text-[#0C0C0A]/70">
            <p><strong className="text-[#0C0C0A]">{t('privacy.sec5ManageLabel')}</strong>{t('privacy.sec5ManageBody')}</p>
            <p><strong className="text-[#0C0C0A]">{t('privacy.sec5DntLabel')}</strong>{t('privacy.sec5DntBody')}</p>
          </div>
        </div>
      ),
    },
    {
      num: '06',
      title: t('privacy.sec6Title'),
      content: (
        <div className="space-y-4">
          <p>{t('privacy.sec6Intro')}</p>
          <ul className="space-y-2">
            {[
              [t('privacy.sec6.vercel'), t('privacy.sec6.vercelDesc')],
              [t('privacy.sec6.ga'),     t('privacy.sec6.gaDesc')],
              [t('privacy.sec6.meta'),   t('privacy.sec6.metaDesc')],
              [t('privacy.sec6.esp'),    t('privacy.sec6.espDesc')],
              [t('privacy.sec6.yt'),     t('privacy.sec6.ytDesc')],
            ].map(([service, desc], i) => (
              <li key={i} className="flex gap-3 py-2 border-b border-[#0C0C0A]/10 last:border-b-0">
                <span className="text-[#DD3935] font-black flex-shrink-0">—</span>
                <div><strong>{service}</strong> — <span className="text-[#0C0C0A]/70">{desc}</span></div>
              </li>
            ))}
          </ul>
          <div className="bg-[#F5F5F5] border-l-4 border-[#0C0C0A] pl-4 py-3 text-sm">
            {t('privacy.sec6NoSell')}
          </div>
        </div>
      ),
    },
    {
      num: '07',
      title: t('privacy.sec7Title'),
      content: (
        <div className="space-y-4">
          <p>{t('privacy.sec7Intro')}</p>
          <div className="space-y-3">
            {[
              { label: t('privacy.sec7.euLabel'), desc: t('privacy.sec7.euDesc') },
              { label: t('privacy.sec7.ngLabel'), desc: t('privacy.sec7.ngDesc') },
              { label: t('privacy.sec7.saLabel'), desc: t('privacy.sec7.saDesc') },
            ].map(({ label, desc }) => (
              <div key={label} className="flex gap-4 p-4 bg-[#F5F5F5]">
                <span className="text-[#027A4F] font-black font-mono text-xs flex-shrink-0 mt-0.5">●</span>
                <div className="text-sm"><strong>{label}:</strong> <span className="text-[#0C0C0A]/70">{desc}</span></div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      num: '08',
      title: t('privacy.sec8Title'),
      content: (
        <ul className="space-y-3">
          {(['i1', 'i2', 'i3', 'i4', 'i5'] as const).map((k, i) => (
            <li key={i} className="flex gap-3 py-3 border-b border-[#0C0C0A]/10 last:border-b-0">
              <span className="text-[#EBBD06] font-black flex-shrink-0 mt-0.5">→</span>
              <div className="text-sm"><strong>{t(`privacy.sec8.${k}Label`)}</strong> — <span className="text-[#0C0C0A]/70">{t(`privacy.sec8.${k}Desc`)}</span></div>
            </li>
          ))}
        </ul>
      ),
    },
    {
      num: '09',
      title: t('privacy.sec9Title'),
      content: (
        <div className="space-y-4">
          <p className="text-[#0C0C0A]/70">{t('privacy.sec9Intro')}</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              [t('privacy.sec9.access'),   t('privacy.sec9.accessDesc')],
              [t('privacy.sec9.rect'),     t('privacy.sec9.rectDesc')],
              [t('privacy.sec9.erase'),    t('privacy.sec9.eraseDesc')],
              [t('privacy.sec9.restrict'), t('privacy.sec9.restrictDesc')],
              [t('privacy.sec9.port'),     t('privacy.sec9.portDesc')],
              [t('privacy.sec9.object'),   t('privacy.sec9.objectDesc')],
            ].map(([right, desc]) => (
              <div key={right} className="bg-[#F5F5F5] p-4 border-l-4 border-[#DD3935]">
                <h3 className="font-black text-sm mb-1">{right}</h3>
                <p className="text-sm text-[#0C0C0A]/60">{desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-[#0C0C0A] text-white p-4 text-sm">
            {t('privacy.sec9CtaPre')}
            <a href="mailto:privacy@africanofilter.org" className="text-[#EBBD06] underline underline-offset-2 hover:text-white transition-colors">
              privacy@africanofilter.org
            </a>
            {t('privacy.sec9CtaMid')}
            <span className="font-mono">{t('privacy.sec9CtaQuote')}</span>{t('privacy.sec9CtaSuffix')}
          </div>
        </div>
      ),
    },
    {
      num: '10',
      title: t('privacy.sec10Title'),
      content: (
        <div className="space-y-4">
          <p>
            {t('privacy.sec10P1Pre')}
            <a href="mailto:privacy@africanofilter.org" className="text-[#DD3935] underline underline-offset-2 hover:text-[#0C0C0A] transition-colors">privacy@africanofilter.org</a>
            {t('privacy.sec10P1Suffix')}
          </p>
          <p className="text-sm text-[#0C0C0A]/60">{t('privacy.sec10P2')}</p>
        </div>
      ),
    },
    {
      num: '11',
      title: t('privacy.sec11Title'),
      content: (
        <div className="space-y-4">
          <p>{t('privacy.sec11Intro')}</p>
          <ul className="space-y-2">
            {[t('privacy.sec11List1'), t('privacy.sec11List2'), t('privacy.sec11List3')].map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-[#027A4F] font-black flex-shrink-0 mt-0.5">✓</span>
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-[#0C0C0A]/60">{t('privacy.sec11Outro')}</p>
        </div>
      ),
    },
    {
      num: '12',
      title: t('privacy.sec12Title'),
      content: <p>{t('privacy.sec12Body')}</p>,
    },
    {
      num: '13',
      title: t('privacy.sec13Title'),
      content: (
        <div className="space-y-6">
          <div className="bg-[#F5F5F5] p-6 border-l-4 border-[#027A4F]">
            <h3 className="font-black uppercase mb-3">{t('privacy.sec13ControllerTitle')}</h3>
            <div className="space-y-1 text-sm">
              <p><strong>{t('privacy.sec13EmailLabel')}</strong> <a href="mailto:privacy@africanofilter.org" className="text-[#DD3935] underline underline-offset-2 hover:text-[#0C0C0A] transition-colors">privacy@africanofilter.org</a></p>
              <p><strong>{t('privacy.sec13SubjectLabel')}</strong>{t('privacy.sec13SubjectValue')}</p>
              <p><strong>{t('privacy.sec13ResponseLabel')}</strong>{t('privacy.sec13ResponseValue')}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-[#0C0C0A]/70 mb-4">{t('privacy.sec13Notice')}</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                [t('privacy.sec13Authorities.ngLabel'), t('privacy.sec13Authorities.ngBody'), t('privacy.sec13Authorities.ngUrl')],
                [t('privacy.sec13Authorities.saLabel'), t('privacy.sec13Authorities.saBody'), t('privacy.sec13Authorities.saUrl')],
                [t('privacy.sec13Authorities.keLabel'), t('privacy.sec13Authorities.keBody'), t('privacy.sec13Authorities.keUrl')],
                [t('privacy.sec13Authorities.euLabel'), t('privacy.sec13Authorities.euBody'), t('privacy.sec13Authorities.euUrl')],
                [t('privacy.sec13Authorities.ukLabel'), t('privacy.sec13Authorities.ukBody'), t('privacy.sec13Authorities.ukUrl')],
              ].map(([region, body, url]) => (
                <div key={region} className="text-sm p-3 bg-[#F5F5F5]">
                  <strong className="block mb-0.5">{region}</strong>
                  <span className="text-[#0C0C0A]/60 block">{body}</span>
                  <span className="font-mono text-xs text-[#DD3935]">{url}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <section className="bg-[#027A4F] text-white py-20 md:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="font-mono text-sm uppercase tracking-widest text-[#EBBD06] mb-4">{t('privacy.kicker')}</p>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase leading-[0.9] tracking-tight mb-6">
            {t('privacy.title1')}<br />{t('privacy.title2')}
          </h1>
          <div className="grid grid-cols-3 h-[5px] max-w-xs mb-8">
            <div className="bg-[#DD3935]" />
            <div className="bg-[#EBBD06]" />
            <div className="bg-white/40" />
          </div>
          <div className="grid sm:grid-cols-3 gap-4 text-sm mt-8">
            <div>
              <p className="text-white/50 uppercase font-mono text-xs mb-1">{t('privacy.effective')}</p>
              <p className="font-black">{t('privacy.effectiveDate')}</p>
            </div>
            <div>
              <p className="text-white/50 uppercase font-mono text-xs mb-1">{t('privacy.lastUpdated')}</p>
              <p className="font-black">{t('privacy.lastUpdatedDate')}</p>
            </div>
            <div>
              <p className="text-white/50 uppercase font-mono text-xs mb-1">{t('privacy.issuedBy')}</p>
              <p className="font-black">{t('privacy.issuedByValue')}</p>
            </div>
          </div>
          <div className="mt-8 bg-white/10 border-l-4 border-[#EBBD06] pl-4 py-3 text-sm text-white/80">
            <strong className="text-white">{t('privacy.summaryLabel')}</strong>{t('privacy.summaryBody')}
          </div>
        </div>
      </section>

      {/* Table of contents */}
      <section className="bg-[#F5F5F5] py-8 px-6 border-b border-[#0C0C0A]/10">
        <div className="max-w-4xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-widest text-[#0C0C0A]/40 mb-4">{t('privacy.contents')}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {sections.map((s) => (
              <a
                key={s.num}
                href={`#section-${s.num}`}
                className="text-sm font-black hover:text-[#DD3935] transition-colors"
              >
                {s.num}. {s.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Policy sections */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-4xl mx-auto space-y-16">
          {sections.map((s) => (
            <div key={s.num} id={`section-${s.num}`} className="scroll-mt-8">
              <div className="flex items-baseline gap-4 mb-6">
                <span className="font-mono text-4xl md:text-5xl font-black text-[#DD3935] leading-none flex-shrink-0">
                  {s.num}
                </span>
                <h2 className="text-xl md:text-2xl font-black uppercase">{s.title}</h2>
              </div>
              <div className="md:ml-[72px] text-[#0C0C0A] leading-relaxed">
                {s.content}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer note */}
      <section className="bg-[#0C0C0A] text-white py-12 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <p className="text-sm text-white/60">
            {t('privacy.appliesTo')}<span className="font-mono text-white/80">{siteUrl}</span>{t('privacy.appliesToSuffix')}
          </p>
          <p className="font-black text-[#EBBD06]">{t('privacy.campaignCredit')}</p>
          <p className="text-sm text-white/40">{t('privacy.notWaitingFooter')}</p>
          <div className="pt-4">
            <a
              href="/faq"
              className="text-sm text-white/60 hover:text-[#EBBD06] transition-colors underline underline-offset-2"
            >
              {t('privacy.readFaq')}
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
