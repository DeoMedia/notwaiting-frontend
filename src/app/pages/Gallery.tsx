import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ChevronLeftIcon, XIcon } from 'lucide-react';
import waveMarkSample from '../../styles/wave_mark_sample.jpeg';
import launchvid from '../../styles/slide-1.webp';
import buildersvid from '../../styles/PhoneLandingmobile-01.jpeg';
import builders1 from '../../imports/albums/builders/builders1.png';
import builders2 from '../../imports/albums/builders/builders2.png';
import builders3 from '../../imports/albums/builders/builders3.png';
import builders4 from '../../imports/albums/builders/builders4.jpeg';
import builders5 from '../../imports/albums/builders/builders5.png';
import campaign1 from '../../imports/albums/campaign/campaign1.jpg';
import campaign2 from '../../imports/albums/campaign/campaign2.jpg';
import campaign3 from '../../imports/albums/campaign/campaign3.jpg';
import campaign4 from '../../imports/albums/campaign/campaign4.jpg';
import community1 from '../../imports/albums/community/community1.png';
import community2 from '../../imports/albums/community/community2.png';
import community3 from '../../imports/albums/community/community3.png';
import community4 from '../../imports/albums/community/community4.png';
import community5 from '../../imports/albums/community/community5.png';

// ── Placeholder data structures ──────────────────────────────────────────────
// Real content (more images per album, video files, mark assets) gets wired
// in over time. Shape is intentionally final so swapping placeholders for
// real media is a drop-in change with no component restructuring.

type MediaKind = 'image' | 'video';

type MediaItem = {
  id: string;
  kind: MediaKind;
  src: string;       // image URL or self-hosted mp4 path (e.g. /videos/foo.mp4)
  caption?: string;
};

type Album = {
  id: string;
  titleKey: string;
  descKey: string;
  color: string;
  cover: string;      // cover thumbnail src
  items: MediaItem[];
};

// Used only where a per-album image isn't supplied yet (e.g. extra items
// inside an album, or the Mark section teaser).
const PLACEHOLDER_COVER = waveMarkSample;

const ALBUMS: Album[] = [
  {
    id: 'campaign-launch',
    titleKey: 'gallery.albums.campaignLaunch.title',
    descKey: 'gallery.albums.campaignLaunch.desc',
    color: '#DD3935',
    cover: campaign1,
    items: [
      { id: 'cl-1', kind: 'image', src: campaign1 },
      { id: 'cl-2', kind: 'image', src: campaign2 },
      { id: 'cl-3', kind: 'image', src: campaign3 },
      { id: 'cl-4', kind: 'image', src: campaign4 },
    ],
  },
  {
    id: 'builders-on-the-wave',
    titleKey: 'gallery.albums.builders.title',
    descKey: 'gallery.albums.builders.desc',
    color: '#EBBD06',
    cover: builders1,
    items: [
      { id: 'bw-1', kind: 'image', src: builders1 },
      { id: 'bw-2', kind: 'image', src: builders2 },
      { id: 'bw-3', kind: 'image', src: builders3 },
      { id: 'bw-4', kind: 'image', src: builders4 },
      { id: 'bw-5', kind: 'image', src: builders5 },
    ],
  },
  {
    id: 'community-stories',
    titleKey: 'gallery.albums.community.title',
    descKey: 'gallery.albums.community.desc',
    color: '#027A4F',
    cover: community1,
    items: [
      { id: 'cs-1', kind: 'image', src: community1 },
      { id: 'cs-2', kind: 'image', src: community2 },
      { id: 'cs-3', kind: 'image', src: community3 },
      { id: 'cs-4', kind: 'image', src: community4 },
      { id: 'cs-5', kind: 'image', src: community5 },
    ],
  },
];

// Self-hosted MP4s, same pattern as the homepage hero. Files live in
// /public/videos/ and are referenced as plain strings — not imported —
// so Vite never bundles them and Workbox never tries to precache them.
// Each clip has an EN and FR file; the active language picks the source.
type VideoSlot = {
  id: string;
  srcEn: string;
  srcFr: string;
  caption: string;
  cover: string;
};

const VIDEO_SLOTS: VideoSlot[] = [
  {
    id: 'v-launch',
    srcEn: '/videos/launch_day_English.mp4',
    srcFr: '/videos/launch_day_French.mp4',
    caption: 'gallery.videos.clip1',
    cover: launchvid,
  },
  {
    id: 'v-notwaiting',
    srcEn: '/videos/not_waiting_eng.mp4',
    srcFr: '/videos/not_waiting_fr.mp4',
    caption: 'gallery.videos.clip2',
    cover: buildersvid,
  },
];

// ── Lightbox ──────────────────────────────────────────────────────────────
function Lightbox({ item, onClose }: { item: MediaItem; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-[#0C0C0A]/95 flex items-center justify-center p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
        aria-label="Close"
      >
        <XIcon className="w-8 h-8" />
      </button>
      <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
        {item.kind === 'image' ? (
          <img src={item.src} alt={item.caption ?? ''} className="w-full h-auto object-contain max-h-[80vh]" />
        ) : (
          <video src={item.src} controls autoPlay playsInline className="w-full h-auto max-h-[80vh]" />
        )}
      </div>
    </div>
  );
}

// ── Album detail view ────────────────────────────────────────────────────────
function AlbumView({ album, onBack }: { album: Album; onBack: () => void }) {
  const { t } = useTranslation();
  const [activeItem, setActiveItem] = useState<MediaItem | null>(null);

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 font-mono text-sm uppercase tracking-widest text-[#0C0C0A]/60 hover:text-[#DD3935] transition-colors mb-10"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        {t('gallery.backToAlbums')}
      </button>

      <div className="flex items-center gap-4 mb-4">
        <div className="h-8 w-1.5 flex-shrink-0" style={{ backgroundColor: album.color }} />
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
          {t(album.titleKey)}
        </h1>
      </div>
      <p className="text-base text-[#0C0C0A]/70 max-w-2xl mb-12 md:pl-6">
        {t(album.descKey)}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {album.items.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveItem(item)}
            className="relative aspect-square overflow-hidden bg-[#F5F5F5] group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DD3935]"
          >
            {item.kind === 'image' ? (
              <img
                src={item.src}
                alt={item.caption ?? ''}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <video src={item.src} className="w-full h-full object-cover" muted playsInline />
            )}
          </button>
        ))}
      </div>

      {activeItem && <Lightbox item={activeItem} onClose={() => setActiveItem(null)} />}
    </div>
  );
}

// ── Albums grid (landing view) ───────────────────────────────────────────────
function AlbumsGrid({ onSelect }: { onSelect: (album: Album) => void }) {
  const { t } = useTranslation();
  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
      {ALBUMS.map((album) => (
        <button
          key={album.id}
          onClick={() => onSelect(album)}
          className="group text-left bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DD3935]"
        >
          <div
            className="relative aspect-[4/3] overflow-hidden mb-4"
            style={{ borderTop: `4px solid ${album.color}` }}
          >
            <img
              src={album.cover}
              alt={t(album.titleKey)}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute bottom-3 right-3 bg-[#0C0C0A]/70 text-white font-mono text-xs px-2 py-1">
              {album.items.length} {t('gallery.itemsSuffix')}
            </div>
          </div>
          <p className="font-black text-lg uppercase mb-1 group-hover:text-[#DD3935] transition-colors">
            {t(album.titleKey)}
          </p>
          <p className="text-sm text-[#0C0C0A]/60 leading-relaxed">
            {t(album.descKey)}
          </p>
        </button>
      ))}
    </div>
  );
}

// ── Videos section ───────────────────────────────────────────────────────────
function VideosSection() {
  const { t, i18n } = useTranslation();
  const [activeItem, setActiveItem] = useState<MediaItem | null>(null);
  const isFr = i18n.language.startsWith('fr');

  return (
    <section className="py-16 md:py-24 px-6 bg-[#F5F5F5] border-t border-b border-[#0C0C0A]/10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <div className="h-8 w-1.5 flex-shrink-0 bg-[#0145F2]" />
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#0145F2]">
            {t('gallery.videosLabel')}
          </p>
        </div>

        <div className="md:pl-6 grid sm:grid-cols-2 gap-6">
          {VIDEO_SLOTS.map((slot) => {
            const src = isFr ? slot.srcFr : slot.srcEn;
            return (
              <button
                key={slot.id}
                onClick={() => setActiveItem({ id: slot.id, kind: 'video', src, caption: slot.caption })}
                className="group relative aspect-video overflow-hidden bg-[#0C0C0A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DD3935]"
              >
                <img src={slot.cover} alt={t(slot.caption)} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-[#DD3935] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 ml-0.5">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                <p className="absolute bottom-3 left-3 text-white font-mono text-xs">
                  {t(slot.caption)}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {activeItem && <Lightbox item={activeItem} onClose={() => setActiveItem(null)} />}
    </section>
  );
}

// ── The Mark section ──────────────────────────────────────────────────────────
function MarkSection() {
  const { t } = useTranslation();
  return (
    <section className="py-16 md:py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <div className="h-8 w-1.5 flex-shrink-0 bg-[#027A4F]" />
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#027A4F]">
            {t('gallery.markLabel')}
          </p>
        </div>

        <div className="md:pl-6 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="font-black text-2xl md:text-3xl uppercase leading-tight mb-4">
              {t('gallery.markTitle')}
            </p>
            <p className="text-base text-[#0C0C0A]/70 leading-relaxed mb-6">
              {t('gallery.markBody')}
            </p>
            <Link
              to="/get-mark"
              className="inline-block bg-[#DD3935] text-white font-black uppercase tracking-wide px-8 py-4 hover:bg-[#0C0C0A] transition-colors"
            >
              {t('gallery.markCta')}
            </Link>
          </div>
          <div className="relative aspect-square overflow-hidden bg-[#F5F5F5] border-2 border-[#0C0C0A]">
            <img
              src={PLACEHOLDER_COVER}
              alt={t('gallery.markTitle')}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Gallery() {
  const { t } = useTranslation();
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO HEADER ── */}
      <section className="bg-[#EBBD06] text-[#0C0C0A] py-20 md:py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-druk font-bold text-5xl sm:text-7xl md:text-8xl uppercase leading-[0.9] tracking-tight mb-6">
            {t('gallery.heading1')}
            <br />
            <span className="font-custard normal-case text-[#DD3935]">
              #NotWaiting
            </span>
          </h1>

          <div className="grid grid-cols-3 h-[5px] max-w-xs mb-10">
            <div className="bg-[#DD3935]" />
            <div className="bg-[#0C0C0A]" />
            <div className="bg-[#027A4F]" />
          </div>

          <p className="font-druk font-bold text-xl md:text-2xl leading-tight max-w-2xl">
            {t('gallery.lead')}
          </p>
        </div>
      </section>

      {/* ── ALBUMS ── */}
      <section className="py-16 md:py-24 px-6 border-b border-[#0C0C0A]/10">
        <div className="max-w-6xl mx-auto">
          {!selectedAlbum && (
            <div className="flex items-center gap-4 mb-10">
              <div className="h-8 w-1.5 flex-shrink-0 bg-[#DD3935]" />
              <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#DD3935]">
                {t('gallery.albumsLabel')}
              </p>
            </div>
          )}

          {selectedAlbum ? (
            <AlbumView album={selectedAlbum} onBack={() => setSelectedAlbum(null)} />
          ) : (
            <div className="md:pl-6">
              <AlbumsGrid onSelect={setSelectedAlbum} />
            </div>
          )}
        </div>
      </section>

      {/* ── VIDEOS ── */}
      {!selectedAlbum && <VideosSection />}

      {/* ── THE MARK ── */}
      {!selectedAlbum && <MarkSection />}

    </div>
  );
}