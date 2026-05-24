import { useTranslation } from 'react-i18next';

export default function AiPrompt() {
  const { t } = useTranslation();
  return (
    <div className="bg-[#027A4F] min-h-screen relative overflow-hidden text-white">
      {/* Decorative yellow blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-[#FDB617] opacity-90"
        style={{ borderRadius: '60% 40% 55% 45% / 50% 60% 40% 50%' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-40 w-[420px] h-[420px] rounded-full bg-[#FDB617] opacity-90 hidden md:block"
        style={{ borderRadius: '45% 55% 40% 60% / 55% 45% 60% 40%' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-32 w-[520px] h-[520px] rounded-full bg-[#FDB617] opacity-90"
        style={{ borderRadius: '55% 45% 60% 40% / 45% 55% 50% 50%' }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-40 w-[360px] h-[360px] rounded-full bg-[#FDB617] opacity-80 hidden md:block"
        style={{ borderRadius: '50% 50% 45% 55% / 55% 45% 55% 45%' }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-12 py-12 md:py-20">

        {/* Section header */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase italic tracking-tight leading-none mb-2">
          {t('aiPrompt.kickerLine1')}
        </h1>
        <p className="text-base md:text-xl italic font-medium mb-10 md:mb-14">
          {t('aiPrompt.kickerLine2')}
        </p>

        {/* Main heading */}
        <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight">
          {t('aiPrompt.mainTitle')}
        </h2>
        <p className="text-lg md:text-2xl font-serif italic mb-8 md:mb-10">
          {t('aiPrompt.mainSubtitle')}
        </p>

        {/* Description */}
        <p className="font-serif text-base md:text-lg leading-relaxed mb-10 md:mb-14">
          {t('aiPrompt.description')}
        </p>

        {/* How to use */}
        <h3 className="font-serif text-3xl md:text-4xl font-bold mb-6">
          {t('aiPrompt.howTo')}
        </h3>
        <ol className="font-serif text-base md:text-lg space-y-3 leading-relaxed list-decimal pl-6 marker:text-white marker:font-bold">
          <li>{t('aiPrompt.step1')}</li>
          <li>
            {t('aiPrompt.step2Pre')}<span className="font-bold italic">{t('aiPrompt.step2Bold')}</span>{t('aiPrompt.step2Mid')}<span className="font-bold italic">{t('aiPrompt.step2Bold2')}</span>{t('aiPrompt.step2Suffix')}
          </li>
          <li>{t('aiPrompt.step3')}</li>
          <li>
            {t('aiPrompt.step4Pre')}<span className="font-bold italic">{t('aiPrompt.step4Bold')}</span>{t('aiPrompt.step4Suffix')}
          </li>
          <li>
            {t('aiPrompt.step5Pre')}<span className="font-bold italic">{t('aiPrompt.step5BoldUse')}</span>{t('aiPrompt.step5Mid1')}<span className="font-bold italic">{t('aiPrompt.step5BoldRegen')}</span>{t('aiPrompt.step5Mid2')}<span className="font-bold italic">{t('aiPrompt.step5BoldWrite')}</span>{t('aiPrompt.step5Suffix')}
          </li>
          <li>{t('aiPrompt.step6')}</li>
        </ol>
      </div>
    </div>
  );
}
