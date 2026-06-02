import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import QRCode from 'qrcode';
import WaveMark from '../components/WaveMark';
import { ScrollToTop } from '../components/ScrollToTop';
import { trackAction } from '../utils/api';
import frame1_01 from '../../imports/NotWaiting_Frame1-01.png';
import frame1_02 from '../../imports/NotWaiting_Frame1-02.png';
import frame1_03 from '../../imports/NotWaiting_Frame1-03.png';
import frame2_01 from '../../imports/NotWaiting_Frame2-01.png';
import frame2_02 from '../../imports/NotWaiting_Frame2-02.png';
import frame2_03 from '../../imports/NotWaiting_Frame2-03.png';
import waveMarkSrc from '../../imports/mark.png';
import bgwaveMark from '../../imports/PATTERN2.png';
import markAssetSrc from '../../styles/the_mark.webp';

const MONO: React.CSSProperties = { fontFamily: 'Space Mono, monospace' };
const FRONTEND_URL = (
  import.meta.env.VITE_FRONTEND_URL ||
  (typeof window !== 'undefined' ? window.location.origin : '')
).replace(/\/$/, '');
const GET_MARK_URL = `${FRONTEND_URL}/get-mark`;

const SHARE_PLATFORMS: { platform: 'Instagram' | 'Twitter/X' | 'LinkedIn' | 'Facebook' | 'Copy Link'; icon: React.ReactElement }[] = [
  { platform: 'Instagram', icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>
    </svg>
  )},
  { platform: 'Twitter/X', icon: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )},
  { platform: 'LinkedIn', icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
    </svg>
  )},
  { platform: 'Facebook', icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  )},
  { platform: 'Copy Link', icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>
  )},
];

function SectionHeader({ step, label }: { step?: string; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {step && (
        <span
          className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#DD3935] text-white flex-shrink-0"
          style={{ ...MONO, fontSize: '9px', fontWeight: 900 }}
        >
          {step}
        </span>
      )}
      <span style={{ ...MONO, fontSize: '10px', color: '#DD3935', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700 }}>
        {label}
      </span>
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center justify-between w-full py-1.5 group">
      <span style={{ ...MONO, fontSize: '11px', color: '#444' }}>{label}</span>
      <div className={`w-9 h-5 rounded-full transition-colors relative flex-shrink-0 ${checked ? 'bg-[#DD3935]' : 'bg-[#ddd]'}`}>
        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </div>
    </button>
  );
}

function SliderRow({ label, value, onChange, min = 0, max = 100, step = 1 }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number;
}) {
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <label style={{ ...MONO, fontSize: '10px', color: '#666', textTransform: 'uppercase' as const }}>{label}</label>
        <span style={{ ...MONO, fontSize: '10px', color: '#999' }}>{typeof value === 'number' && step < 1 ? value.toFixed(1) : Math.round(value)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 appearance-none bg-[#e0e0e0] rounded-full outline-none cursor-pointer accent-[#DD3935]"
      />
    </div>
  );
}

function FieldInput({ label, placeholder, value, onChange }: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="mb-3">
      <label style={{ ...MONO, fontSize: '10px', color: '#666', textTransform: 'uppercase' as const, letterSpacing: '0.06em', display: 'block', marginBottom: '5px' }}>
        {label}
      </label>
      <input
        type="text" placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 bg-[#f5f5f5] border border-[#e0e0e0] focus:border-[#DD3935] outline-none px-3 transition-colors"
        style={{ ...MONO, fontSize: '11px', color: '#0C0C0A' }}
      />
    </div>
  );
}

function HowToUseSection({
  open,
  onToggle,
  steps,
  label,
}: {
  open: boolean;
  onToggle: () => void;
  label: string;
  steps: { number: string; title: string; accent?: string; body: string }[];
}) {
  return (
    <section>
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full group"
      >
        <span style={{ ...MONO, fontSize: '10px', color: '#DD3935', textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700 }}>
          {label}
        </span>
        <svg
          width="14" height="14" viewBox="0 0 14 14" fill="none"
          className={`transition-transform text-[#DD3935] ${open ? 'rotate-180' : ''}`}
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
        >
          <path d="M3 5l4 4 4-4" />
        </svg>
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          {steps.map((step) => (
            <div key={step.number} className="grid grid-cols-[28px_1fr] gap-3">
              <span style={{ ...MONO, fontSize: '11px', color: '#DD3935', fontWeight: 900, lineHeight: 1.4 }}>
                {step.number}
              </span>
              <div>
                <div style={{ ...MONO, fontSize: '11px', color: '#0C0C0A', fontWeight: 700, lineHeight: 1.45 }}>
                  {step.title}
                  {step.accent && (
                    <span style={{ color: '#DD3935' }}> {step.accent}</span>
                  )}
                </div>
                <p style={{ ...MONO, fontSize: '10px', color: '#777', lineHeight: 1.6, marginTop: '4px' }}>
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function GetMark() {
  const { t } = useTranslation();
  const [photo, setPhoto] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [role, setRole] = useState('');
  const [selectedFrame, setSelectedFrame] = useState<string>(frame1_01);
  const [showFrame, setShowFrame] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [showText, setShowText] = useState(true);
  const [photoX, setPhotoX] = useState(50);
  const [photoY, setPhotoY] = useState(50);
  const [photoScale, setPhotoScale] = useState(1);
  const [markX, setMarkX] = useState(50);
  const [markY, setMarkY] = useState(50);
  const [markScale, setMarkScale] = useState(50);
  const [markOpacity, setMarkOpacity] = useState(100);
  const [markRotation, setMarkRotation] = useState(0);
  const [format, setFormat] = useState<'1:1' | '9:16' | '16:9'>('1:1');
  const [markColor, setMarkColor] = useState('#DD3935');
  const [isDragging, setIsDragging] = useState(false);
  const [howToOpen, setHowToOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [photoNatural, setPhotoNatural] = useState<{ w: number; h: number } | null>(null);

  const frames = [
    { id: 'frame1-01', src: frame1_01, name: 'Frame 1' },
    { id: 'frame1-02', src: frame1_02, name: 'Frame 2' },
    { id: 'frame1-03', src: frame1_03, name: 'Frame 3' },
    { id: 'frame2-01', src: frame2_01, name: 'Frame 4' },
    { id: 'frame2-02', src: frame2_02, name: 'Frame 5' },
    { id: 'frame2-03', src: frame2_03, name: 'Frame 6' },
  ];

  const markColors = [
    { color: '#FFFFFF', label: t('getMark.photo.colorWhite') },
    { color: '#DD3935', label: t('getMark.photo.colorRed') },
    { color: '#EBBD06', label: t('getMark.photo.colorGold') },
    { color: '#027A4F', label: t('getMark.photo.colorGreen') },
    { color: '#0C0C0A', label: t('getMark.photo.colorBlack') },
  ];

  const howToSteps = [
    {
      number: '01',
      title: t('getMark.howTo.step1Title'),
      accent: t('getMark.howTo.step1Accent'),
      body: t('getMark.howTo.step1Body'),
    },
    {
      number: '02',
      title: t('getMark.howTo.step2Title'),
      accent: t('getMark.howTo.step2Accent'),
      body: t('getMark.howTo.step2Body'),
    },
    {
      number: '03',
      title: t('getMark.howTo.step3Title'),
      body: t('getMark.howTo.step3Body'),
    },
  ];

  const [activeDrag, setActiveDrag] = useState<'photo' | 'mark' | null>(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [uploadError, setUploadError] = useState<string>('');
  const [statusBanner, setStatusBanner] = useState<{ kind: 'info' | 'error'; text: string } | null>(null);

  const flashBanner = (kind: 'info' | 'error', text: string) => {
    setStatusBanner({ kind, text });
    setTimeout(() => setStatusBanner(curr => (curr?.text === text ? null : curr)), 4000);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let cancelled = false;

    QRCode.toDataURL(GET_MARK_URL, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 256,
      color: {
        dark: '#0C0C0A',
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        if (!cancelled) setQrCodeDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrCodeDataUrl('');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!photo) { setPhotoNatural(null); return; }
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      setPhotoNatural({ w: img.naturalWidth, h: img.naturalHeight });
      // Auto-pick the canvas aspect closest to the photo's. The user can still
      // override via the 1:1 / 9:16 / 16:9 toggles below the canvas.
      const photoRatio = img.naturalWidth / img.naturalHeight;
      const candidates: { key: '1:1' | '9:16' | '16:9'; ratio: number }[] = [
        { key: '1:1', ratio: 1 },
        { key: '9:16', ratio: 9 / 16 },
        { key: '16:9', ratio: 16 / 9 },
      ];
      const best = candidates.reduce((a, b) =>
        Math.abs(Math.log(b.ratio / photoRatio)) < Math.abs(Math.log(a.ratio / photoRatio)) ? b : a
      );
      setFormat(best.key);
    };
    img.src = photo;
    return () => { cancelled = true; };
  }, [photo]);

  // Stores everything needed by the global mousemove handler without stale closures.
  // overflow*Screen is the pan range (drawn-image px beyond canvas) measured in screen
  // pixels, so 1 px drag = (1 / overflow) * 100 percent change in photoX/Y.
  const dragState = useRef<{
    type: 'photo' | 'mark';
    startMouseX: number;
    startMouseY: number;
    startPhotoX: number;
    startPhotoY: number;
    overflowXScreen: number;
    overflowYScreen: number;
    markClickOffsetX: number;
    markClickOffsetY: number;
    canvasRect: DOMRect;
  } | null>(null);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const s = dragState.current;
      if (!s) return;
      const { canvasRect } = s;

      if (s.type === 'photo') {
        const dx = e.clientX - s.startMouseX;
        const dy = e.clientY - s.startMouseY;
        if (s.overflowXScreen > 0) {
          setPhotoX(Math.max(0, Math.min(100, s.startPhotoX + (dx / s.overflowXScreen) * 100)));
        }
        if (s.overflowYScreen > 0) {
          setPhotoY(Math.max(0, Math.min(100, s.startPhotoY + (dy / s.overflowYScreen) * 100)));
        }
      } else {
        // Mark follows mouse, offset-corrected so it doesn't jump on grab
        const rawX = ((e.clientX - s.markClickOffsetX - canvasRect.left) / canvasRect.width) * 100;
        const rawY = ((e.clientY - s.markClickOffsetY - canvasRect.top) / canvasRect.height) * 100;
        setMarkX(Math.max(0, Math.min(100, rawX)));
        setMarkY(Math.max(0, Math.min(100, rawY)));
      }
    };

    const onMouseUp = () => {
      dragState.current = null;
      setActiveDrag(null);
    };

    const onTouchMove = (e: TouchEvent) => {
      const s = dragState.current;
      if (!s) return;
      e.preventDefault();
      const touch = e.touches[0];
      const { canvasRect } = s;
      if (s.type === 'photo') {
        const dx = touch.clientX - s.startMouseX;
        const dy = touch.clientY - s.startMouseY;
        if (s.overflowXScreen > 0) {
          setPhotoX(Math.max(0, Math.min(100, s.startPhotoX + (dx / s.overflowXScreen) * 100)));
        }
        if (s.overflowYScreen > 0) {
          setPhotoY(Math.max(0, Math.min(100, s.startPhotoY + (dy / s.overflowYScreen) * 100)));
        }
      } else {
        const rawX = ((touch.clientX - s.markClickOffsetX - canvasRect.left) / canvasRect.width) * 100;
        const rawY = ((touch.clientY - s.markClickOffsetY - canvasRect.top) / canvasRect.height) * 100;
        setMarkX(Math.max(0, Math.min(100, rawX)));
        setMarkY(Math.max(0, Math.min(100, rawY)));
      }
    };

    const onTouchEnd = () => {
      dragState.current = null;
      setActiveDrag(null);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  const processFile = useCallback((file: File) => {
    // Hardening:
    //  - Only allow common raster formats. SVGs can carry inline scripts and
    //    foreignObject payloads — reject them outright. PNG/JPEG/WebP/GIF only.
    //  - Cap file size at 10 MB so an attacker can't OOM the tab by feeding a
    //    huge "image/*" base64 into React state.
    const MAX_BYTES = 10 * 1024 * 1024;
    const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
    if (!ALLOWED.has(file.type)) {
      setUploadError(t('getMark.unsupportedFileType') || 'Unsupported image format — please upload PNG, JPEG, WebP, or GIF.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setUploadError(t('getMark.fileTooLarge') || 'Image is too large. Please choose a file under 10 MB.');
      return;
    }
    setUploadError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhoto(event.target?.result as string);
      setPhotoX(50); setPhotoY(50); setPhotoScale(1);
      setMarkX(50); setMarkY(50); setMarkScale(50);
      setMarkOpacity(100); setMarkRotation(0);
    };
    reader.readAsDataURL(file);
  }, [t]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const drawImageCover = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number, y: number, w: number, h: number,
    imageX = 50, imageY = 50, imageScale = 1
  ) => {
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const canvasRatio = w / h;
    let baseW = w, baseH = h;
    if (imgRatio > canvasRatio) { baseH = h; baseW = baseH * imgRatio; }
    else { baseW = w; baseH = baseW / imgRatio; }
    const drawW = baseW * imageScale;
    const drawH = baseH * imageScale;
    const dx = x + (w - drawW) * (imageX / 100);
    const dy = y + (h - drawH) * (imageY / 100);
    ctx.drawImage(img, dx, dy, drawW, drawH);
  };

  const applyColorToMark = (sourceCanvas: HTMLCanvasElement, color: string): HTMLCanvasElement => {
    const output = document.createElement('canvas');
    output.width = sourceCanvas.width;
    output.height = sourceCanvas.height;
    const ctx = output.getContext('2d')!;
    ctx.drawImage(sourceCanvas, 0, 0);
    const imageData = ctx.getImageData(0, 0, output.width, output.height);
    const data = imageData.data;
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    for (let i = 0; i < data.length; i += 4) {
      const brightness = data[i];
      data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = brightness;
    }
    ctx.putImageData(imageData, 0, 0);
    return output;
  };

  const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  const renderToCanvas = async (): Promise<HTMLCanvasElement> => {
    if (!photo) throw new Error('No photo');
    const scale = 2;
    const { width: w, height: h } = currentDimensions;
    const canvas = document.createElement('canvas');
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(scale, scale);
    const photoImg = await loadImage(photo);
    drawImageCover(ctx, photoImg, 0, 0, w, h, photoX, photoY, photoScale);
    if (showFrame) {
      try { const frameImg = await loadImage(selectedFrame); ctx.drawImage(frameImg, 0, 0, w, h); } catch {}
    }
    try {
      const markImg = await loadImage(waveMarkSrc);
      const markSize = (markScale / 50) * 120;
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = markSize; tempCanvas.height = markSize;
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCtx.drawImage(markImg, 0, 0, markSize, markSize);
      const colorized = applyColorToMark(tempCanvas, markColor);
      const mx = (markX / 100) * w;
      const my = (markY / 100) * h;
      const rotation = (markRotation / 100) * 360 * (Math.PI / 180);
      ctx.save();
      ctx.globalAlpha = markOpacity / 100;
      ctx.translate(mx, my);
      ctx.rotate(rotation);
      ctx.drawImage(colorized, -markSize / 2, -markSize / 2, markSize, markSize);
      ctx.restore();
    } catch {}
    if (showText && (name || city || role)) {
      const pad = 16, boxH = 90;
      ctx.fillStyle = 'rgba(0,0,0,0.82)';
      ctx.fillRect(pad, h - boxH - pad, w - pad * 2, boxH);
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      if (name) { ctx.font = 'bold 18px "Space Mono", monospace'; ctx.fillStyle = '#ffffff'; ctx.fillText(name, pad + 16, h - boxH - pad + 14); }
      if (city) { ctx.font = '13px "Space Mono", monospace'; ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fillText(city, pad + 16, h - boxH - pad + 38); }
      if (role) { ctx.font = '13px "Space Mono", monospace'; ctx.fillStyle = '#dd3935'; ctx.fillText(role.toUpperCase(), pad + 16, h - boxH - pad + 60); }
    }
    if (showQR && qrCodeDataUrl) {
      try {
        const qrImg = await loadImage(qrCodeDataUrl);
        const qrBoxSize = Math.round(Math.max(76, Math.min(w, h) * 0.18));
        const qrPadding = Math.round(qrBoxSize * 0.12);
        const qrX = w - qrBoxSize - 16;
        const qrY = 16;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(qrX, qrY, qrBoxSize, qrBoxSize);
        ctx.strokeStyle = 'rgba(12,12,10,0.18)';
        ctx.lineWidth = 1;
        ctx.strokeRect(qrX + 0.5, qrY + 0.5, qrBoxSize - 1, qrBoxSize - 1);
        ctx.drawImage(
          qrImg,
          qrX + qrPadding,
          qrY + qrPadding,
          qrBoxSize - qrPadding * 2,
          qrBoxSize - qrPadding * 2,
        );
      } catch {}
    }
    return canvas;
  };

  const handleDownload = async () => {
    if (!photo) { flashBanner('error', t('getMark.alerts.uploadFirst')); return; }
    try {
      const canvas = await renderToCanvas();
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `notwaiting-wave-mark-${format}.png`;
          link.href = url; link.click();
          URL.revokeObjectURL(url);
          const w = window as Window & { dataLayer?: object[] };
          w.dataLayer = w.dataLayer ?? [];
          w.dataLayer.push({ event: 'wave_mark_download' });
        }
      }, 'image/png');
    } catch { flashBanner('error', t('getMark.alerts.downloadFailed')); }
  };

  const handleDownloadAssets = () => {
    const link = document.createElement('a');
    link.href = markAssetSrc;
    link.download = 'notwaiting-wave-mark.webp';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const trackShare = (platform: string) => {
    trackAction({ action: 'shared_social', metadata: { platform, source: 'get_mark' } });
  };

  const handleShare = async () => {
    if (!photo) { flashBanner('error', t('getMark.alerts.uploadFirst')); return; }
    try {
      const canvas = await renderToCanvas();
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], `notwaiting-wave-mark-${format}.png`, { type: 'image/png' });
          const shareData: ShareData = {
            files: [file],
            title: '#NotWaiting',
            text: t('getMark.alerts.shareText'),
            url: GET_MARK_URL,
          };
          if (navigator.share && navigator.canShare(shareData)) {
            try {
              await navigator.share(shareData);
              trackShare('native_share');
            }
            catch {}
          } else {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `notwaiting-wave-mark-${format}.png`;
            link.href = url; link.click();
            URL.revokeObjectURL(url);
            trackShare('download_fallback');
          }
        }
      }, 'image/png');
    } catch { flashBanner('error', t('getMark.alerts.shareFailed')); }
  };

  const handlePlatformShare = async (platform: string) => {
    if (!photo) { flashBanner('error', t('getMark.alerts.uploadFirst')); return; }
    const shareText = encodeURIComponent(t('getMark.alerts.shareLongText'));
    const shareUrl = encodeURIComponent(GET_MARK_URL);
    switch (platform) {
      case 'Instagram':
        await handleDownload();
        flashBanner('info', t('getMark.alerts.instagramHint'));
        trackShare('instagram');
        break;
      case 'Twitter/X':
        window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`, '_blank', 'noopener,noreferrer');
        trackShare('twitter');
        break;
      case 'LinkedIn':
        await handleDownload();
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, '_blank', 'noopener,noreferrer');
        flashBanner('info', t('getMark.alerts.linkedinHint'));
        trackShare('linkedin');
        break;
      case 'Facebook':
        await handleDownload();
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank', 'noopener,noreferrer');
        flashBanner('info', t('getMark.alerts.facebookHint'));
        trackShare('facebook');
        break;
      case 'Copy Link':
        try {
          await navigator.clipboard.writeText(GET_MARK_URL);
          flashBanner('info', t('getMark.alerts.linkCopied'));
          trackShare('copy_link');
        }
        catch { flashBanner('error', t('getMark.alerts.copyFailed')); }
        break;
    }
  };

  const canvasDimensions = {
    '1:1':  { width: 520, height: 520 },
    '9:16': { width: 390, height: 693 },
    '16:9': { width: 693, height: 390 },
  };
  const currentDimensions = canvasDimensions[format];
  const isMobile = windowWidth < 768;
  const mobileCanvasWidth = Math.min(windowWidth - 32, currentDimensions.width);
  const canvasScale = isMobile ? mobileCanvasWidth / currentDimensions.width : 1;
  const displayW = Math.round(currentDimensions.width * canvasScale);
  const displayH = Math.round(currentDimensions.height * canvasScale);

  // The preview is rendered inside a `scale(canvasScale)` wrapper using canvas-native
  // coordinates, so the live preview is composed with the same math as renderToCanvas().
  const canvasW = currentDimensions.width;
  const canvasH = currentDimensions.height;
  const photoLayout = (() => {
    if (!photoNatural) return null;
    const imgRatio = photoNatural.w / photoNatural.h;
    const canvasRatio = canvasW / canvasH;
    let baseW = canvasW, baseH = canvasH;
    if (imgRatio > canvasRatio) { baseH = canvasH; baseW = baseH * imgRatio; }
    else { baseW = canvasW; baseH = baseW / imgRatio; }
    const drawW = baseW * photoScale;
    const drawH = baseH * photoScale;
    const left = (canvasW - drawW) * (photoX / 100);
    const top = (canvasH - drawH) * (photoY / 100);
    return { drawW, drawH, left, top, overflowX: Math.max(0, drawW - canvasW), overflowY: Math.max(0, drawH - canvasH) };
  })();
  const qrBoxSize = Math.round(Math.max(76, Math.min(canvasW, canvasH) * 0.18));
  const qrPadding = Math.round(qrBoxSize * 0.12);

  return (
    <div
      className="relative w-full min-h-screen md:h-screen flex flex-col md:overflow-hidden bg-white"
      style={{ backgroundImage: `url(${bgwaveMark})`, backgroundRepeat: 'repeat', backgroundSize: '540px auto', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-white/65 pointer-events-none" />

      <div className="relative z-10 w-full md:h-full flex flex-col md:overflow-hidden">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={handlePhotoUpload}
          className="hidden"
        />

        {(uploadError || statusBanner) && (
          <div
            role={(uploadError || statusBanner?.kind === 'error') ? 'alert' : 'status'}
            aria-live="polite"
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md px-4 py-3 border-2 shadow-md text-sm ${
              uploadError || statusBanner?.kind === 'error'
                ? 'bg-white border-[#DD3935] text-[#DD3935]'
                : 'bg-[#0C0C0A] border-[#0C0C0A] text-white'
            }`}
            style={MONO}
          >
            {uploadError || statusBanner?.text}
          </div>
        )}

        {/* Top bar */}
        <div className="w-full h-[46px] bg-[#EBBD06] flex items-center justify-between px-4 flex-shrink-0 border-b border-[#d4a900]">
          <button onClick={() => navigate('/')} className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity flex-shrink-0">
            <span style={{ ...MONO, fontSize: '10px', color: '#0C0C0A' }}>{t('getMark.back')}</span>
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <WaveMark size={16} color="#0C0C0A" />
            <span style={{ ...MONO, fontWeight: 800, fontSize: '10px', color: '#0C0C0A', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>
              {t('getMark.title')}
            </span>
          </div>
          <div className="w-12 flex-shrink-0" />
        </div>

        <div className="flex-1 flex flex-col md:flex-row md:overflow-hidden">

          {/* ── LEFT PANEL — desktop only ── */}
          <div className="hidden md:flex w-[272px] flex-shrink-0 bg-white/95 border-r border-[#e8e8e8] flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

              {/* How to use */}
              <HowToUseSection
                open={howToOpen}
                onToggle={() => setHowToOpen((v) => !v)}
                label={t('getMark.howTo.label')}
                steps={howToSteps}
              />

              <div className="border-t border-[#f0f0f0]" />

              {/* 01 Upload */}
              <section>
                <SectionHeader step="01" label={t('getMark.section.uploadPhoto')} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`w-full border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden ${
                    isDragging
                      ? 'border-[#DD3935] bg-[#fff5f5]'
                      : photo
                      ? 'border-[#DD3935]/40 hover:border-[#DD3935]'
                      : 'border-[#ccc] hover:border-[#DD3935] hover:bg-[#fff5f5]'
                  }`}
                  style={{ height: photo ? '120px' : '110px' }}
                >
                  {photo ? (
                    <div className="relative w-full h-full group">
                      <img src={photo} alt="Uploaded" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span style={{ ...MONO, fontSize: '10px', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('getMark.photo.change')}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 py-4">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      <span style={{ ...MONO, fontSize: '11px', color: '#999' }}>{t('getMark.photo.hint')}</span>
                    </div>
                  )}
                </button>
              </section>

              {/* Divider */}
              <div className="border-t border-[#f0f0f0]" />

              {/* 02 Frame & Color */}
              <section>
                <SectionHeader step="02" label={t('getMark.section.frameAndColor')} />
                <div className="grid grid-cols-3 gap-1.5 mb-4">
                  {frames.map((frame) => (
                    <button
                      key={frame.id}
                      onClick={() => setSelectedFrame(frame.src)}
                      className="relative aspect-square border-2 overflow-hidden transition-all"
                      style={{ borderColor: selectedFrame === frame.src ? '#DD3935' : '#e0e0e0', borderRadius: '2px' }}
                      title={frame.name}
                    >
                      <img src={frame.src} alt={frame.name} className="w-full h-full object-cover" />
                      {selectedFrame === frame.src && (
                        <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-[#DD3935] rounded-full flex items-center justify-center">
                          <svg width="7" height="7" viewBox="0 0 10 10" fill="white"><path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/></svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <div>
                  <label style={{ ...MONO, fontSize: '10px', color: '#666', textTransform: 'uppercase' as const, letterSpacing: '0.06em', display: 'block', marginBottom: '8px' }}>
                    {t('getMark.section.markColor')}
                  </label>
                  <div className="flex gap-2">
                    {markColors.map((swatch) => (
                      <button
                        key={swatch.color}
                        onClick={() => setMarkColor(swatch.color)}
                        className="w-7 h-7 rounded-full transition-all"
                        style={{
                          backgroundColor: swatch.color,
                          border: swatch.color === '#FFFFFF' ? '1.5px solid #ccc' : '1.5px solid transparent',
                          outline: markColor === swatch.color ? '2.5px solid #DD3935' : 'none',
                          outlineOffset: '2px',
                        }}
                        title={swatch.label}
                      />
                    ))}
                  </div>
                </div>
              </section>

              {/* Divider */}
              <div className="border-t border-[#f0f0f0]" />

              {/* 03 Your Details */}
              <section>
                <SectionHeader step="03" label={t('getMark.section.yourDetails')} />
                <FieldInput label={t('getMark.fields.name')} placeholder={t('getMark.fields.namePlaceholder')} value={name} onChange={setName} />
                <FieldInput label={t('getMark.fields.city')} placeholder={t('getMark.fields.cityPlaceholder')} value={city} onChange={setCity} />
                <FieldInput label={t('getMark.fields.role')} placeholder={t('getMark.fields.rolePlaceholder')} value={role} onChange={setRole} />
              </section>

              {/* Divider */}
              <div className="border-t border-[#f0f0f0]" />

              {/* Visibility (always shown — controls what appears in the preview) */}
              <section>
                <SectionHeader label={t('getMark.section.visibility')} />
                <Toggle checked={showFrame} onChange={setShowFrame} label={t('getMark.toggle.showFrame')} />
                <Toggle checked={showText} onChange={setShowText} label={t('getMark.toggle.showText')} />
                <Toggle checked={showQR} onChange={setShowQR} label={t('getMark.toggle.showQR')} />
              </section>

              {/* Divider */}
              <div className="border-t border-[#f0f0f0]" />

              {/* Advanced (collapsible) */}
              <section>
                <button
                  type="button"
                  onClick={() => setAdvancedOpen((v) => !v)}
                  className="flex items-center justify-between w-full group"
                >
                  <span style={{ ...MONO, fontSize: '10px', color: '#999', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
                    {t('getMark.section.advanced')}
                  </span>
                  <svg
                    width="14" height="14" viewBox="0 0 14 14" fill="none"
                    className={`transition-transform text-[#999] ${advancedOpen ? 'rotate-180' : ''}`}
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                  >
                    <path d="M3 5l4 4 4-4" />
                  </svg>
                </button>

                {advancedOpen && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label style={{ ...MONO, fontSize: '10px', color: '#aaa', textTransform: 'uppercase' as const, letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>
                        {t('getMark.section.adjustPhoto')}
                      </label>
                      <SliderRow label={t('getMark.slider.horizontal')} value={photoX} onChange={setPhotoX} />
                      <SliderRow label={t('getMark.slider.vertical')} value={photoY} onChange={setPhotoY} />
                      <SliderRow label={t('getMark.slider.zoom')} value={photoScale} onChange={setPhotoScale} min={1} max={3} step={0.01} />
                    </div>

                    <div className="border-t border-[#f0f0f0] pt-4">
                      <label style={{ ...MONO, fontSize: '10px', color: '#aaa', textTransform: 'uppercase' as const, letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>
                        {t('getMark.section.adjustMark')}
                      </label>
                      <SliderRow label={t('getMark.slider.horizontal')} value={markX} onChange={setMarkX} />
                      <SliderRow label={t('getMark.slider.vertical')} value={markY} onChange={setMarkY} />
                      <SliderRow label={t('getMark.slider.size')} value={markScale} onChange={setMarkScale} />
                      <SliderRow label={t('getMark.slider.opacity')} value={markOpacity} onChange={setMarkOpacity} />
                      <SliderRow label={t('getMark.slider.rotation')} value={markRotation} onChange={setMarkRotation} />
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>

          {/* ── CENTER CANVAS ── */}
          <div className="flex-1 flex flex-col items-center justify-start md:justify-center bg-transparent p-4 md:p-8 md:overflow-auto">
            <div
              ref={canvasRef}
              className="relative bg-[#e8e8e8] overflow-hidden shadow-2xl flex-shrink-0"
              style={{
                width: displayW,
                height: displayH,
                cursor: activeDrag === 'photo' ? 'grabbing' : photo ? 'grab' : 'default',
              }}
              onMouseDown={(e) => {
                if (!photo || !canvasRef.current || !photoLayout) return;
                e.preventDefault();
                dragState.current = {
                  type: 'photo',
                  startMouseX: e.clientX,
                  startMouseY: e.clientY,
                  startPhotoX: photoX,
                  startPhotoY: photoY,
                  overflowXScreen: photoLayout.overflowX * canvasScale,
                  overflowYScreen: photoLayout.overflowY * canvasScale,
                  markClickOffsetX: 0,
                  markClickOffsetY: 0,
                  canvasRect: canvasRef.current.getBoundingClientRect(),
                };
                setActiveDrag('photo');
              }}
              onTouchStart={(e) => {
                if (!photo || !canvasRef.current || !photoLayout) return;
                const touch = e.touches[0];
                dragState.current = {
                  type: 'photo',
                  startMouseX: touch.clientX,
                  startMouseY: touch.clientY,
                  startPhotoX: photoX,
                  startPhotoY: photoY,
                  overflowXScreen: photoLayout.overflowX * canvasScale,
                  overflowYScreen: photoLayout.overflowY * canvasScale,
                  markClickOffsetX: 0,
                  markClickOffsetY: 0,
                  canvasRect: canvasRef.current.getBoundingClientRect(),
                };
                setActiveDrag('photo');
              }}
            >
              {!photo && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 select-none">
                  <div className="w-16 h-16 rounded-full bg-white/60 flex items-center justify-center">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                  <div style={{ ...MONO, fontSize: '13px', color: 'rgba(0,0,0,0.3)', textAlign: 'center' }}>
                    {t('getMark.photo.placeholder')}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-1 px-5 py-2 bg-[#DD3935] text-white hover:bg-[#C92F2B] transition-colors"
                    style={{ ...MONO, fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}
                  >
                    {t('getMark.photo.upload')}
                  </button>
                </div>
              )}

              {/* Inner layer sized in canvas-native px, scaled to display size.
                  Every child uses canvas-native coordinates so the preview matches
                  the downloaded PNG produced by renderToCanvas() pixel-for-pixel. */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: canvasW,
                  height: canvasH,
                  transform: `scale(${canvasScale})`,
                  transformOrigin: 'top left',
                }}
              >
                {photo && photoLayout && (
                  <img
                    src={photo}
                    alt="Canvas"
                    style={{
                      position: 'absolute',
                      left: photoLayout.left,
                      top: photoLayout.top,
                      width: photoLayout.drawW,
                      height: photoLayout.drawH,
                      pointerEvents: 'none',
                      display: 'block',
                    }}
                  />
                )}

                {photo && showFrame && (
                  <img
                    src={selectedFrame}
                    alt="Frame"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: canvasW,
                      height: canvasH,
                      objectFit: 'cover',
                      pointerEvents: 'none',
                      display: 'block',
                      zIndex: 10,
                    }}
                  />
                )}

                {photo && showText && (name || city || role) && (
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      bottom: 16,
                      left: 16,
                      right: 16,
                      height: 90,
                      background: 'rgba(0,0,0,0.82)',
                      padding: '14px 16px 0',
                      fontFamily: 'Space Mono, monospace',
                      zIndex: 20,
                    }}
                  >
                    {name && <div style={{ color: '#fff', fontWeight: 700, fontSize: 18, lineHeight: 1.1 }}>{name}</div>}
                    {city && <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 6 }}>{city}</div>}
                    {role && <div style={{ color: '#DD3935', fontSize: 13, textTransform: 'uppercase', marginTop: 4 }}>{role}</div>}
                  </div>
                )}

                {photo && (
                  <div
                    className="absolute"
                    style={{
                      left: `${markX}%`,
                      top: `${markY}%`,
                      transform: `translate(-50%, -50%) scale(${markScale / 50}) rotate(${(markRotation / 100) * 360}deg)`,
                      opacity: markOpacity / 100,
                      zIndex: 30,
                      cursor: activeDrag === 'mark' ? 'grabbing' : 'grab',
                    }}
                    onMouseDown={(e) => {
                      if (!canvasRef.current) return;
                      e.preventDefault();
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      const canvasRect = canvasRef.current.getBoundingClientRect();
                      dragState.current = {
                        type: 'mark',
                        startMouseX: e.clientX,
                        startMouseY: e.clientY,
                        startPhotoX: photoX,
                        startPhotoY: photoY,
                        overflowXScreen: 0,
                        overflowYScreen: 0,
                        markClickOffsetX: e.clientX - (rect.left + rect.width / 2),
                        markClickOffsetY: e.clientY - (rect.top + rect.height / 2),
                        canvasRect,
                      };
                      setActiveDrag('mark');
                    }}
                    onTouchStart={(e) => {
                      if (!canvasRef.current) return;
                      e.stopPropagation();
                      const touch = e.touches[0];
                      const rect = e.currentTarget.getBoundingClientRect();
                      const canvasRect = canvasRef.current.getBoundingClientRect();
                      dragState.current = {
                        type: 'mark',
                        startMouseX: touch.clientX,
                        startMouseY: touch.clientY,
                        startPhotoX: photoX,
                        startPhotoY: photoY,
                        overflowXScreen: 0,
                        overflowYScreen: 0,
                        markClickOffsetX: touch.clientX - (rect.left + rect.width / 2),
                        markClickOffsetY: touch.clientY - (rect.top + rect.height / 2),
                        canvasRect,
                      };
                      setActiveDrag('mark');
                    }}
                  >
                    <WaveMark size={120} color={markColor} />
                  </div>
                )}

                {showQR && qrCodeDataUrl && (
                  <div
                    className={`absolute pointer-events-none ${photo ? 'shadow-md' : 'shadow-sm'}`}
                    style={{
                      top: 16,
                      right: 16,
                      width: qrBoxSize,
                      height: qrBoxSize,
                      background: '#FFFFFF',
                      border: '1px solid rgba(12,12,10,0.18)',
                      padding: qrPadding,
                      zIndex: 40,
                    }}
                    aria-label={t('getMark.qr.previewAlt')}
                  >
                    <img
                      src={qrCodeDataUrl}
                      alt={t('getMark.qr.previewAlt')}
                      style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Format picker below canvas */}
            <div className="flex gap-1.5 mt-5">
              {(['1:1', '9:16', '16:9'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className="px-4 h-8 border transition-all"
                  style={{
                    ...MONO, fontSize: '10px', fontWeight: 700,
                    borderColor: format === fmt ? '#DD3935' : '#ccc',
                    color: format === fmt ? '#DD3935' : '#888',
                    background: format === fmt ? '#fff5f5' : 'white',
                  }}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

            {/* ── MOBILE CONTROLS — shown below canvas on small screens ── */}
            <div className="md:hidden w-full mt-10 bg-white/95 rounded-lg border border-[#e8e8e8] divide-y divide-[#f0f0f0]">

              {/* How to use */}
              <div className="px-4 py-4">
                <HowToUseSection
                  open={howToOpen}
                  onToggle={() => setHowToOpen((v) => !v)}
                  label={t('getMark.howTo.label')}
                  steps={howToSteps}
                />
              </div>

              {/* Upload */}
              <div className="px-4 py-4">
                <SectionHeader step="01" label={t('getMark.section.uploadPhoto')} />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`w-full border-2 border-dashed transition-all flex items-center justify-center gap-2 py-3 ${
                    isDragging ? 'border-[#DD3935] bg-[#fff5f5]' : photo ? 'border-[#DD3935]/40' : 'border-[#ccc]'
                  }`}
                >
                  {photo ? (
                    <span style={{ ...MONO, fontSize: '11px', color: '#DD3935' }}>{t('getMark.photo.changeShort')}</span>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      <span style={{ ...MONO, fontSize: '11px', color: '#999' }}>{t('getMark.photo.tapToUpload')}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Your Details */}
              <div className="px-4 py-4">
                <SectionHeader step="02" label={t('getMark.section.yourDetails')} />
                <FieldInput label={t('getMark.fields.firstName')} placeholder={t('getMark.fields.namePlaceholder')} value={name} onChange={setName} />
                <FieldInput label={t('getMark.fields.city')} placeholder={t('getMark.fields.cityPlaceholder')} value={city} onChange={setCity} />
                <FieldInput label={t('getMark.fields.role')} placeholder={t('getMark.fields.rolePlaceholder')} value={role} onChange={setRole} />
              </div>

              {/* Frame selection */}
              <div className="px-4 py-4">
                <SectionHeader step="03" label={t('getMark.section.frame')} />
                <div className="grid grid-cols-6 gap-1.5">
                  {frames.map((frame) => (
                    <button
                      key={frame.id}
                      onClick={() => setSelectedFrame(frame.src)}
                      className="relative aspect-square border-2 overflow-hidden"
                      style={{ borderColor: selectedFrame === frame.src ? '#DD3935' : '#e0e0e0' }}
                    >
                      <img src={frame.src} alt={frame.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Mark Color */}
              <div className="px-4 py-4">
                <SectionHeader step="04" label={t('getMark.section.markColour')} />
                <div className="flex gap-3">
                  {markColors.map((swatch) => (
                    <button
                      key={swatch.color}
                      onClick={() => setMarkColor(swatch.color)}
                      className="w-8 h-8 rounded-full transition-all"
                      style={{
                        backgroundColor: swatch.color,
                        border: swatch.color === '#FFFFFF' ? '1.5px solid #ccc' : '1.5px solid transparent',
                        outline: markColor === swatch.color ? '2.5px solid #DD3935' : 'none',
                        outlineOffset: '2px',
                      }}
                      title={swatch.label}
                    />
                  ))}
                </div>
              </div>

              {/* Export */}
              <div className="px-4 py-4">
                <SectionHeader step="05" label={t('getMark.section.export')} />
                <div className="mb-3 border border-[#f0f0f0] px-3 py-2">
                  <Toggle checked={showQR} onChange={setShowQR} label={t('getMark.toggle.showQR')} />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleShare}
                    className="flex-1 h-11 bg-[#DD3935] text-white flex items-center justify-center gap-2"
                    style={{ ...MONO, fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}
                  >
                    {t('getMark.actions.share')}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex-1 h-11 bg-white border border-[#DD3935] flex items-center justify-center gap-2"
                    style={{ ...MONO, fontWeight: 700, fontSize: '11px', color: '#DD3935', textTransform: 'uppercase' }}
                  >
                    {t('getMark.actions.download')}
                  </button>
                </div>
                <button
                  onClick={handleDownloadAssets}
                  className="mt-2 w-full h-11 bg-white border border-[#0C0C0A] flex items-center justify-center gap-2"
                  style={{ ...MONO, fontWeight: 700, fontSize: '11px', color: '#0C0C0A', textTransform: 'uppercase', letterSpacing: '0.06em' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0C0C0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  {t('getMark.actions.downloadAssets')}
                </button>
              </div>

              {/* Share On */}
              <div className="px-4 py-4">
                <SectionHeader step="06" label={t('getMark.section.shareOn')} />
                <div className="grid grid-cols-2 gap-2">
                  {SHARE_PLATFORMS.map(({ platform, icon }) => (
                    <button
                      key={platform}
                      onClick={() => handlePlatformShare(platform)}
                      className="h-10 border border-[#e0e0e0] hover:border-[#DD3935] hover:text-[#DD3935] bg-white transition-all flex items-center justify-center gap-2 text-[#555]"
                      style={{ ...MONO, fontSize: '10px', letterSpacing: '0.04em' }}
                    >
                      {icon}
                      {platform}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          {/* ── RIGHT PANEL — desktop only ── */}
          <div className="hidden md:flex w-[220px] flex-shrink-0 bg-white/95 border-l border-[#e8e8e8] flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">

              {/* Primary actions */}
              <section>
                <SectionHeader label={t('getMark.section.export')} />
                <button
                  onClick={handleShare}
                  className="w-full h-11 bg-[#DD3935] hover:bg-[#C92F2B] text-white transition-colors mb-2 flex items-center justify-center gap-2"
                  style={{ ...MONO, fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                  {t('getMark.actions.share')}
                </button>
                <button
                  onClick={handleDownload}
                  className="w-full h-11 bg-white hover:bg-[#fff5f5] border border-[#DD3935] transition-colors flex items-center justify-center gap-2"
                  style={{ ...MONO, fontWeight: 700, fontSize: '11px', color: '#DD3935', textTransform: 'uppercase', letterSpacing: '0.08em' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DD3935" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  {t('getMark.actions.download')}
                </button>
                <button
                  onClick={handleDownloadAssets}
                  className="w-full h-11 mt-2 bg-white hover:bg-[#f5f5f5] border border-[#0C0C0A] transition-colors flex items-center justify-center gap-2"
                  style={{ ...MONO, fontWeight: 700, fontSize: '11px', color: '#0C0C0A', textTransform: 'uppercase', letterSpacing: '0.08em' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0C0C0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  {t('getMark.actions.downloadAssets')}
                </button>
              </section>

              <div className="border-t border-[#f0f0f0]" />

              {/* Platform share */}
              <section>
                <SectionHeader label={t('getMark.section.shareOn')} />
                <div className="flex flex-col gap-2">
                  {SHARE_PLATFORMS.map(({ platform, icon }) => (
                    <button
                      key={platform}
                      onClick={() => handlePlatformShare(platform)}
                      className="h-9 border border-[#e0e0e0] hover:border-[#DD3935] hover:text-[#DD3935] bg-white transition-all flex items-center justify-center gap-2 text-[#555]"
                      style={{ ...MONO, fontSize: '10px', letterSpacing: '0.04em' }}
                    >
                      {icon}
                      {platform}
                    </button>
                  ))}
                </div>
              </section>

              {/* Bottom hint */}
              <div className="mt-auto pt-4 border-t border-[#f0f0f0]">
                <p style={{ ...MONO, fontSize: '10px', color: '#bbb', lineHeight: '1.6' }}>
                  {t('getMark.hint')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <ScrollToTop />
      </div>
    </div>
  );
}
