import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { buildManifestoConfirmation } from '../utils/manifestoEmail'

type DeviceWidth = 'desktop' | 'mobile'
type PreviewView = 'rendered' | 'text' | 'html'

const DEVICE_CONFIG: Record<DeviceWidth, { label: string; width: number; fallbackHeight: number }> = {
  desktop: {
    label: 'Desktop',
    width: 680,
    fallbackHeight: 1420,
  },
  mobile: {
    label: 'Mobile',
    width: 390,
    fallbackHeight: 1760,
  },
}

const VIEW_OPTIONS: PreviewView[] = ['rendered', 'text', 'html']
const DEVICE_OPTIONS: DeviceWidth[] = ['desktop', 'mobile']

export default function EmailPreview() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialName = searchParams.get('name') || 'Amina'
  const [name, setName] = useState(initialName)
  const [device, setDevice] = useState<DeviceWidth>('desktop')
  const [view, setView] = useState<PreviewView>('rendered')
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [iframeHeight, setIframeHeight] = useState(DEVICE_CONFIG.desktop.fallbackHeight)

  const { subject, html, text } = useMemo(
    () => buildManifestoConfirmation({ firstName: name, frontendUrl: window.location.origin }),
    [name],
  )

  const resizeIframe = useCallback(() => {
    const iframe = iframeRef.current
    const doc = iframe?.contentDocument
    if (!iframe || !doc) return

    const bodyHeight = doc.body?.scrollHeight || 0
    const documentHeight = doc.documentElement?.scrollHeight || 0
    const measuredHeight = Math.max(bodyHeight, documentHeight)
    const nextHeight = measuredHeight || DEVICE_CONFIG[device].fallbackHeight
    setIframeHeight(nextHeight)
  }, [device])

  useEffect(() => {
    if (view !== 'rendered') return

    setIframeHeight(DEVICE_CONFIG[device].fallbackHeight)
    let resizeTimeout: number | undefined
    const frame = requestAnimationFrame(() => {
      resizeIframe()
      resizeTimeout = window.setTimeout(resizeIframe, 250)
    })

    window.addEventListener('resize', resizeIframe)

    return () => {
      cancelAnimationFrame(frame)
      if (resizeTimeout) window.clearTimeout(resizeTimeout)
      window.removeEventListener('resize', resizeIframe)
    }
  }, [device, html, resizeIframe, view])

  const updateName = (value: string) => {
    setName(value)
    const next = new URLSearchParams(searchParams)
    if (value) next.set('name', value)
    else next.delete('name')
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#0C0C0A]">
      {/* Top control bar */}
      <header className="sticky top-0 z-20 bg-[#0C0C0A] text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-custard normal-case text-xl leading-none">#NotWaiting</span>
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/60">
              Email&nbsp;/&nbsp;Preview
            </span>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] lg:ml-auto lg:w-auto lg:flex lg:flex-wrap lg:items-center">
            <label className="grid gap-1.5 font-mono text-xs sm:grid-cols-[auto_minmax(13rem,18rem)] sm:items-center">
              <span className="uppercase tracking-[0.18em] text-white/60">Name</span>
              <input
                value={name}
                onChange={(e) => updateName(e.target.value)}
                placeholder="Amina"
                className="w-full bg-white/10 border border-white/20 px-3 py-2 text-sm font-mono text-white placeholder-white/40 focus:outline-none focus:border-[#DD3935]"
              />
            </label>

            <div className="grid grid-cols-2 border border-white/20">
              {DEVICE_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDevice(d)}
                  className={`px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] transition-colors ${
                    device === d ? 'bg-[#DD3935] text-white' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {DEVICE_CONFIG[d].label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 border border-white/20">
              {VIEW_OPTIONS.map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-2 font-mono text-xs uppercase tracking-[0.12em] transition-colors ${
                    view === v ? 'bg-[#EBBD06] text-[#0C0C0A]' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Subject line strip */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
          <div className="grid gap-1 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-baseline sm:gap-3">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-white/50 leading-none">
              Subject
            </span>
            <span className="min-w-0 font-mono text-sm text-white sm:truncate">{subject}</span>
          </div>
        </div>

        {/* Tri-color strip */}
        <div className="grid grid-cols-3 h-[3px]">
          <div className="bg-[#DD3935]" />
          <div className="bg-[#EBBD06]" />
          <div className="bg-[#027A4F]" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
        {view === 'rendered' && (
          <div className="flex justify-center overflow-x-auto pb-4">
            <div
              className={`shrink-0 transition-all duration-300 ${
                device === 'mobile'
                  ? 'rounded-[2rem] bg-[#0C0C0A] p-2 shadow-2xl'
                  : 'bg-white shadow-lg'
              }`}
              style={{
                width: DEVICE_CONFIG[device].width,
                maxWidth: device === 'mobile' ? '100%' : undefined,
              }}
            >
              <iframe
                ref={iframeRef}
                title="Manifesto confirmation email preview"
                srcDoc={html}
                onLoad={resizeIframe}
                // Restrict the previewed HTML: no script execution, no form
                // submission, no top-frame navigation. The content today is
                // built locally with escapeHtml(), so this is belt-and-braces —
                // it also future-proofs against ever rendering raw API HTML here.
                sandbox=""
                referrerPolicy="no-referrer"
                className={`w-full block bg-[#F5F5F5] ${
                  device === 'mobile' ? 'rounded-[1.5rem]' : ''
                }`}
                style={{ height: iframeHeight, border: 'none' }}
              />
            </div>
          </div>
        )}

        {view === 'text' && (
          <div className="max-w-3xl mx-auto bg-white border border-[#EAE5DC] p-5 sm:p-8">
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#DD3935] mb-4">
              Plain-text fallback
            </div>
            <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-[#0C0C0A]">
              {text}
            </pre>
          </div>
        )}

        {view === 'html' && (
          <div className="max-w-5xl mx-auto bg-[#0C0C0A] text-[#F5F5F5] p-5 sm:p-8 overflow-auto">
            <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#EBBD06] mb-4">
              Raw HTML
            </div>
            <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap break-all">
              {html}
            </pre>
          </div>
        )}

        <p className="mt-8 sm:mt-10 max-w-3xl mx-auto text-center font-mono text-xs leading-relaxed text-[#0C0C0A]/60">
          This page renders the same template the API sends after a signer completes the manifesto.
          Source:{' '}
          <code className="inline-block bg-white px-2 py-0.5 border border-[#EAE5DC]">
            src/app/utils/manifestoEmail.ts
          </code>
          {' '}/{' '}
          <code className="inline-block bg-white px-2 py-0.5 border border-[#EAE5DC]">
            notwaiting-api/services/email/templates/manifestoConfirmation.js
          </code>
        </p>
      </main>
    </div>
  )
}
