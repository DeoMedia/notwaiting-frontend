import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { fetchStories, type Story } from '../utils/api'
import { SECTOR_MAP } from '../constants/sectors'
import { useNavigate } from 'react-router'

function useTimeAgo() {
  const { t } = useTranslation()
  return (dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return t('storiesSlider.today')
    if (days === 1) return t('storiesSlider.yesterday')
    return t('storiesSlider.daysAgoShort', { n: days })
  }
}

function SliderCard({ story }: { story: Story }) {
  const { t } = useTranslation()
  const timeAgo = useTimeAgo()
  const base = SECTOR_MAP[story.wave_tag] ?? { color: '#18027a', text: '#fff', label: story.wave_tag, value: story.wave_tag }
  const sector = { ...base, label: t(`sectors.${story.wave_tag}`, { defaultValue: base.label }) }

  return (
    <div className="bg-white border-2 border-[#0C0C0A] p-6 md:p-8 flex flex-col min-h-[280px] hover:border-[#DD3935] transition-colors duration-200 cursor-default">
      <div
        className="inline-block text-xs font-mono uppercase font-black mb-4 px-2 py-1 self-start tracking-wide"
        style={{ backgroundColor: sector.color, color: sector.text }}
      >
        {sector.label}
      </div>
      <h3 className="text-xl font-black uppercase mb-1 leading-tight text-[#0C0C0A]">{story.first_name}</h3>
      <div className="text-xs font-mono text-[#0C0C0A]/40 mb-5 tracking-wide">
        {story.country} · {timeAgo(story.created_at)}
      </div>
      <div className="border-l-4 pl-4 flex-1" style={{ borderColor: sector.color }}>
        <p
          className="text-sm leading-relaxed text-[#0C0C0A]/80"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 6,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          } as React.CSSProperties}
        >
          {story.caption}
        </p>
      </div>
    </div>
  )
}

const VISIBLE = 3
const AUTO_INTERVAL = 5000

export function StoriesSlider() {
  const { t } = useTranslation()
  const [stories, setStories] = useState<Story[]>([])
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const [fading, setFading] = useState(false)
  const navigate = useNavigate()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    fetchStories({ limit: 24 }).then(r => setStories(r.stories)).catch(() => {})
  }, [])

  const total = stories.length

  const goTo = useCallback((idx: number) => {
    if (total === 0) return
    setFading(true)
    setTimeout(() => {
      setCurrent(((idx % total) + total) % total)
      setFading(false)
    }, 200)
  }, [total])

  const next = useCallback(() => goTo(current + 1), [goTo, current])
  const prev = useCallback(() => goTo(current - 1), [goTo, current])

  useEffect(() => {
    if (total === 0 || paused) return
    timerRef.current = setInterval(next, AUTO_INTERVAL)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [total, paused, next])

  if (total === 0) return null

  const visibleStories = Array.from({ length: VISIBLE }, (_, i) => ({
    story: stories[(current + i) % total],
    key: (current + i) % total,
  }))

  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="font-mono text-xs uppercase text-[#DD3935] font-black mb-3 tracking-widest">
              {t('storiesSlider.kicker')}
            </p>
            <h2 className="text-3xl md:text-5xl font-black uppercase text-[#0C0C0A] tracking-tight leading-none">
              {t('storiesSlider.headingLine1')}<br />{t('storiesSlider.headingLine2')}
            </h2>
          </div>
          <button
            onClick={() => navigate('/stories')}
            className="hidden md:inline-flex items-center gap-2 text-sm font-black uppercase text-[#DD3935] border-b-2 border-[#DD3935] pb-1 hover:text-[#0C0C0A] hover:border-[#0C0C0A] transition-colors"
          >
            {t('storiesSlider.viewAll')}
          </button>
        </div>

        {/* Cards */}
        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-4 transition-opacity duration-200 ${fading ? 'opacity-0' : 'opacity-100'}`}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {visibleStories.map(({ story, key }, pos) => (
            <SliderCard key={`${key}-${pos}`} story={story} />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mt-8">
          {/* Progress dots */}
          <div className="flex gap-1.5 flex-wrap" style={{ maxWidth: '70%' }}>
            {stories.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-6 bg-[#DD3935]'
                    : 'w-1.5 bg-[#0C0C0A]/20 hover:bg-[#0C0C0A]/40'
                }`}
                aria-label={t('storiesSlider.goToAria', { n: i + 1 })}
              />
            ))}
          </div>

          {/* Arrows */}
          <div className="flex gap-2">
            <button
              onClick={prev}
              className="w-10 h-10 border-2 border-[#0C0C0A]/30 text-[#0C0C0A]/60 hover:border-[#DD3935] hover:text-[#DD3935] transition-colors flex items-center justify-center text-base font-black"
              aria-label={t('storiesSlider.prevAria')}
            >
              ←
            </button>
            <button
              onClick={next}
              className="w-10 h-10 border-2 border-[#0C0C0A]/30 text-[#0C0C0A]/60 hover:border-[#DD3935] hover:text-[#DD3935] transition-colors flex items-center justify-center text-base font-black"
              aria-label={t('storiesSlider.nextAria')}
            >
              →
            </button>
          </div>
        </div>

        {/* Mobile view-all link */}
        <div className="mt-8 text-center md:hidden">
          <button
            onClick={() => navigate('/stories')}
            className="text-sm font-black uppercase text-[#DD3935] border-b-2 border-[#DD3935] pb-0.5"
          >
            {t('storiesSlider.viewAll')}
          </button>
        </div>

      </div>
    </section>
  )
}
