import { forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import { Counter } from './Counter';
import { Ticker } from './Ticker';
import { TICKER_SECTORS } from '../constants/sectors';
import { useLocalizedSectors } from '../i18n/hooks';

interface Props {
  onJoinClick: () => void
  stats: {
    total_signers: number
    total_countries: number
  }
  onRefresh: () => void
}

export interface StatsSectionHandle {
  refresh: () => void
}

export const StatsSection = forwardRef<StatsSectionHandle, Props>(
  ({ onJoinClick: _onJoinClick, stats, onRefresh }, ref) => {
    const { t } = useTranslation()
    const sectors = useLocalizedSectors()
    const tickerItems = TICKER_SECTORS.map(v => sectors.find(s => s.value === v)?.label ?? v)

    useImperativeHandle(ref, () => ({ refresh: onRefresh }), [onRefresh])

    return (
      <section className="relative bg-white text-[#0C0C0A] py-18 md:py-28 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <Counter target={stats.total_signers} />

          <p className="text-3xl md:text-5xl font-black mt-6 mb-4">
            {t('stats.line')} <span className="text-[#C9A228]">{t('stats.waveWord')}</span>
          </p>

          <div className="inline-flex items-center gap-6 bg-[#0C0C0A]/5 rounded-full px-6 py-2 mb-12">
            <span className="text-base md:text-lg text-[#0C0C0A]/80">
              <span className="text-[#DD3935] font-black text-xl">{stats.total_signers.toLocaleString()}</span>{' '}{t('stats.peopleSuffix')}
            </span>
            <span className="w-px h-4 bg-[#0C0C0A]/20" />
            <span className="text-base md:text-lg text-[#0C0C0A]/80">
              <span className="text-[#DD3935] font-black text-xl">{stats.total_countries}</span>{' '}{t('stats.countriesSuffix')}
            </span>
          </div>

          <div className="py-8 border-y border-[#0C0C0A]/20">
            <Ticker items={tickerItems} />
          </div>
{/* 
          <div className="mt-12">
            <Button onClick={onJoinClick} className="text-lg px-12 py-5">
              Join the movement →
            </Button>
          </div> */}
        </div>
      </section>
    )
  }
)

StatsSection.displayName = 'StatsSection'
