import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

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
const ONLOAD_CALLBACK = '__nwHcaptchaOnLoad'
const SCRIPT_SRC = `https://js.hcaptcha.com/1/api.js?render=explicit&onload=${ONLOAD_CALLBACK}`

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
    // Register the global onload callback BEFORE injecting the script.
    // With render=explicit, script.onload can fire before window.hcaptcha is
    // ready — only the onload query-param callback is guaranteed to run
    // after the API is fully initialized.
    ;(window as unknown as Record<string, () => void>)[ONLOAD_CALLBACK] = () => resolve()

    const baseSrc = SCRIPT_SRC.split('?')[0]
    const existing = document.querySelector<HTMLScriptElement>(`script[src^="${baseSrc}"]`)
    if (existing) {
      existing.addEventListener('error', () => reject(new Error('hcaptcha script load failed')), {
        once: true,
      })
      return
    }
    const s = document.createElement('script')
    s.src = SCRIPT_SRC
    s.async = true
    s.defer = true
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

export interface CaptchaHandle {
  /** Clears the widget and issues a fresh challenge for the user to solve. */
  reset: () => void
}

export const Captcha = forwardRef<CaptchaHandle, CaptchaProps>(function Captcha(
  { onToken, onError, className, theme = 'light' },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  // Keep the latest handlers in refs so re-renders don't tear down the widget.
  const onTokenRef = useRef(onToken)
  const onErrorRef = useRef(onError)
  onTokenRef.current = onToken
  onErrorRef.current = onError

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current && window.hcaptcha) {
        try {
          window.hcaptcha.reset(widgetIdRef.current)
        } catch {
          // Widget gone — silently ignore. The token state on the form is
          // already being cleared by the caller.
        }
      }
    },
  }), [])

  useEffect(() => {
    if (!SITE_KEY || !containerRef.current) return
    let cancelled = false
    let mounted = false

    loadScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.hcaptcha) return
        widgetIdRef.current = window.hcaptcha.render(containerRef.current, {
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
  return <div ref={containerRef} className={className} />
})

export function isCaptchaEnabled(): boolean {
  return Boolean(SITE_KEY)
}
