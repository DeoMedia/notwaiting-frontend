import { useEffect, useRef } from 'react'

// hCaptcha widget — issues a one-time captchaToken that the backend
// re-verifies against api.hcaptcha.com using HCAPTCHA_SECRET.
//
// Behaviour:
//  - If VITE_HCAPTCHA_SITE_KEY is unset, this component renders nothing and
//    onToken is never called. The matching backend flag HCAPTCHA_SECRET also
//    being unset means abuseGuard silently skips captcha (honeypot stays
//    enforced). "No env vars on either side" is a valid dev config.
//  - The widget script is loaded once and reused across mounts. CSP must
//    allow hcaptcha.com + *.hcaptcha.com under script-src / frame-src /
//    connect-src / style-src.

const SITE_KEY = import.meta.env.VITE_HCAPTCHA_SITE_KEY as string | undefined
const SCRIPT_SRC = 'https://js.hcaptcha.com/1/api.js?render=explicit'

type HCaptchaGlobal = {
  render: (
    el: HTMLElement,
    opts: {
      sitekey: string
      callback?: (token: string) => void
      'error-callback'?: () => void
      'expired-callback'?: () => void
      'chalexpired-callback'?: () => void
      theme?: 'light' | 'dark'
      size?: 'normal' | 'compact' | 'invisible'
    },
  ) => string
  reset: (widgetId?: string) => void
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    hcaptcha?: HCaptchaGlobal
  }
}

let scriptPromise: Promise<void> | null = null
function loadScript(): Promise<void> {
  if (scriptPromise) return scriptPromise
  scriptPromise = new Promise<void>((resolve, reject) => {
    if (typeof document === 'undefined') {
      reject(new Error('document unavailable'))
      return
    }
    if (window.hcaptcha) {
      resolve()
      return
    }
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src^="${SCRIPT_SRC.split('?')[0]}"]`,
    )
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('hcaptcha script load failed')), {
        once: true,
      })
      return
    }
    const s = document.createElement('script')
    s.src = SCRIPT_SRC
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('hcaptcha script load failed'))
    document.head.appendChild(s)
  })
  return scriptPromise
}

interface CaptchaProps {
  onToken: (token: string) => void
  onError?: () => void
  className?: string
  theme?: 'light' | 'dark'
}

export function Captcha({ onToken, onError, className, theme = 'light' }: CaptchaProps) {
  const ref = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  // Keep the latest handlers in refs so re-renders don't tear down the widget.
  const onTokenRef = useRef(onToken)
  const onErrorRef = useRef(onError)
  onTokenRef.current = onToken
  onErrorRef.current = onError

  useEffect(() => {
    if (!SITE_KEY || !ref.current) return
    let cancelled = false
    let mounted = false

    loadScript()
      .then(() => {
        if (cancelled || !ref.current || !window.hcaptcha) return
        widgetIdRef.current = window.hcaptcha.render(ref.current, {
          sitekey: SITE_KEY,
          theme,
          callback: (token) => onTokenRef.current(token),
          'error-callback': () => onErrorRef.current?.(),
          'expired-callback': () => onErrorRef.current?.(),
          'chalexpired-callback': () => onErrorRef.current?.(),
        })
        mounted = true
      })
      .catch(() => onErrorRef.current?.())

    return () => {
      cancelled = true
      if (mounted && widgetIdRef.current && window.hcaptcha) {
        try {
          window.hcaptcha.remove(widgetIdRef.current)
        } catch {
          // widget already gone — ignore
        }
      }
    }
  }, [theme])

  if (!SITE_KEY) return null
  return <div ref={ref} className={className} />
}

export function isCaptchaEnabled(): boolean {
  return Boolean(SITE_KEY)
}
