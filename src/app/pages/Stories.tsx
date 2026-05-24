import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchStories, type Story } from '../utils/api';
import { SECTOR_MAP } from '../constants/sectors';
import { useLocalizedCountriesWithAll, useLocalizedSectors } from '../i18n/hooks';

const PAGE_LIMIT = 10;

function useTimeAgo() {
  const { t } = useTranslation();
  return (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return t('stories.today');
    if (days === 1) return t('stories.yesterday');
    return t('stories.daysAgo', { n: days });
  };
}

function StoryCard({ story }: { story: Story }) {
  const { t } = useTranslation();
  const timeAgo = useTimeAgo();
  const base = SECTOR_MAP[story.wave_tag] ?? { color: '#0C0C0A', text: '#fff', label: story.wave_tag, value: story.wave_tag };
  const sector = { ...base, label: t(`sectors.${story.wave_tag}`, { defaultValue: base.label }) };

  return (
    <div className="bg-white border-2 border-[#0C0C0A] p-8 hover:border-[#dd3935] transition-colors">
      {/* Sector badge with its own colour */}
      <div
        className="inline-block text-xs font-mono uppercase font-black mb-3 px-2 py-1"
        style={{ backgroundColor: sector.color, color: sector.text }}
      >
        {sector.label}
      </div>

      <h2 className="text-2xl font-black uppercase mb-1">{story.first_name}</h2>
      <div className="text-sm text-gray-500 mb-4">
        {story.country} · {timeAgo(story.created_at)}
      </div>

      <div
        className="border-l-4 pl-4"
        style={{ borderColor: sector.color }}
      >
        <p className="text-base leading-relaxed whitespace-pre-line">{story.caption}</p>
      </div>
    </div>
  );
}

export default function Stories() {
  const { t } = useTranslation();
  const countryOptions = useLocalizedCountriesWithAll();
  const sectors = useLocalizedSectors();
  const [selectedSector, setSelectedSector]   = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [stories, setStories]                 = useState<Story[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState('');
  const [page, setPage]                       = useState(0);
  const [total, setTotal]                     = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_LIMIT));

  const load = useCallback(async (
    sector: string,
    country: string,
    pageNum: number,
  ) => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchStories({
        page:    pageNum,
        limit:   PAGE_LIMIT,
        wave:    sector  !== 'all' ? sector  : undefined,
        country: country !== 'all' ? country : undefined,
      });

      setStories(result.stories);
      setTotal(result.total);
    } catch (err: any) {
      setError(err.message ?? t('stories.couldNotLoad'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    setPage(0);
  }, [selectedSector, selectedCountry]);

  useEffect(() => {
    load(selectedSector, selectedCountry, page);
  }, [selectedSector, selectedCountry, page, load]);

  const goToPage = (n: number) => {
    if (n < 0 || n >= totalPages || n === page) return;
    setPage(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageNumbers = (() => {
    const max = 5;
    if (totalPages <= max) return Array.from({ length: totalPages }, (_, i) => i);
    const half = Math.floor(max / 2);
    let start = Math.max(0, page - half);
    const end = Math.min(totalPages, start + max);
    start = Math.max(0, end - max);
    return Array.from({ length: end - start }, (_, i) => start + i);
  })();

  return (
    <div className="min-h-screen bg-white">
      <section className="py-20 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight mb-8 text-center">
            {t('stories.title')}
          </h1>
          <p className="text-xl text-center mb-16 max-w-3xl mx-auto">
            {t('stories.subtitle')}
          </p>

          {/* ── Filters ────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row gap-6 justify-center mb-8">

            {/* Country filter */}
            <div className="flex flex-col items-center md:items-start">
              <label className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">
                {t('stories.filterCountry')}
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="border-2 border-[#0C0C0A] px-4 py-2 font-mono text-sm focus:border-[#DD3935] outline-none min-w-[200px]"
              >
                {countryOptions.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Sector filter */}
            <div className="flex flex-col items-center md:items-start">
              <label className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">
                {t('stories.filterSector')}
              </label>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="border-2 border-[#0C0C0A] px-4 py-2 font-mono text-sm focus:border-[#DD3935] outline-none min-w-[200px]"
              >
                <option value="all">{t('sectors.all')}</option>
                {sectors.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ── Sector pill filters ────────────────────────── */}
          <div className="flex flex-wrap gap-2 justify-center mb-16">
            <button
              onClick={() => setSelectedSector('all')}
              className="px-4 py-1.5 text-xs font-mono uppercase font-bold border-2 transition-colors"
              style={{
                borderColor: selectedSector === 'all' ? '#0C0C0A' : '#ddd',
                backgroundColor: selectedSector === 'all' ? '#0C0C0A' : 'transparent',
                color: selectedSector === 'all' ? '#fff' : '#888',
              }}
            >
              {t('sectors.allShort')}
            </button>
            {sectors.map(s => (
              <button
                key={s.value}
                onClick={() => setSelectedSector(s.value)}
                className="px-4 py-1.5 text-xs font-mono uppercase font-bold border-2 transition-all"
                style={{
                  borderColor: selectedSector === s.value ? s.color : '#ddd',
                  backgroundColor: selectedSector === s.value ? s.color : 'transparent',
                  color: selectedSector === s.value ? s.text : '#888',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* ── States ────────────────────────────────────── */}
          {loading && page === 0 && (
            <div className="text-center py-16 text-gray-500">{t('stories.loading')}</div>
          )}
          {error && (
            <div className="text-center py-16 text-[#dd3935]">{error}</div>
          )}
          {!loading && stories.length === 0 && !error && (
            <div className="text-center py-16">
              <p className="text-xl mb-4">{t('stories.emptyTitle')}</p>
              <p className="text-gray-500">
                {t('stories.emptyBody')}
              </p>
            </div>
          )}

          {/* ── Grid ──────────────────────────────────────── */}
          <div className="grid md:grid-cols-2 gap-8">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>

          {/* ── Pagination ────────────────────────────────── */}
          {!loading && stories.length > 0 && totalPages > 1 && (
            <div className="mt-16 flex flex-col items-center gap-4">
              <p className="text-xs font-mono uppercase tracking-widest text-gray-500">
                {t('stories.pageOf', { page: page + 1, total: totalPages, count: total, noun: total === 1 ? t('stories.storySingular') : t('stories.storyPlural') })}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 0}
                  className="px-4 py-2 text-xs font-mono uppercase font-bold border-2 border-[#0C0C0A] hover:bg-[#0C0C0A] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#0C0C0A]"
                >
                  {t('common.prev')}
                </button>

                {pageNumbers[0] > 0 && (
                  <>
                    <button
                      onClick={() => goToPage(0)}
                      className="w-10 h-10 text-xs font-mono uppercase font-bold border-2 border-[#ddd] text-gray-500 hover:border-[#0C0C0A] hover:text-[#0C0C0A] transition-colors"
                    >
                      1
                    </button>
                    {pageNumbers[0] > 1 && (
                      <span className="px-1 text-gray-400 font-mono">…</span>
                    )}
                  </>
                )}

                {pageNumbers.map(n => (
                  <button
                    key={n}
                    onClick={() => goToPage(n)}
                    className="w-10 h-10 text-xs font-mono uppercase font-bold border-2 transition-colors"
                    style={{
                      borderColor: n === page ? '#DD3935' : '#ddd',
                      backgroundColor: n === page ? '#DD3935' : 'transparent',
                      color: n === page ? '#fff' : '#888',
                    }}
                  >
                    {n + 1}
                  </button>
                ))}

                {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                  <>
                    {pageNumbers[pageNumbers.length - 1] < totalPages - 2 && (
                      <span className="px-1 text-gray-400 font-mono">…</span>
                    )}
                    <button
                      onClick={() => goToPage(totalPages - 1)}
                      className="w-10 h-10 text-xs font-mono uppercase font-bold border-2 border-[#ddd] text-gray-500 hover:border-[#0C0C0A] hover:text-[#0C0C0A] transition-colors"
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages - 1}
                  className="px-4 py-2 text-xs font-mono uppercase font-bold border-2 border-[#0C0C0A] hover:bg-[#0C0C0A] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#0C0C0A]"
                >
                  {t('common.nextShort')}
                </button>
              </div>
            </div>
          )}

          {loading && page > 0 && (
            <div className="text-center mt-8 text-gray-500">{t('stories.loadingMore')}</div>
          )}

          {/* ── CTA ───────────────────────────────────────── */}
          <div className="bg-[#0C0C0A] text-white p-12 text-center mt-16">
            <h2 className="text-4xl font-black uppercase mb-4">{t('stories.ctaTitle')}</h2>
            <p className="text-xl mb-2">{t('stories.ctaBody')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}