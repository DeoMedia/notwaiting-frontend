// Frontend Sentry init. Imported by main.tsx before React renders so that
// every render error, unhandled promise rejection, and explicit captureException
// reaches Sentry. If VITE_SENTRY_DSN is unset, this no-ops — local dev and
// the CI build don't need a DSN.

import * as Sentry from '@sentry/react'

const DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined

if (DSN) {
  Sentry.init({
    dsn: DSN,
    environment: import.meta.env.MODE,

    // Errors are always captured; performance traces are sampled to stay
    // inside the free tier. Bump for short windows if you're investigating
    // a perf regression.
    tracesSampleRate: Number.parseFloat(
      (import.meta.env.VITE_SENTRY_TRACES_SAMPLE_RATE as string | undefined) ?? '0.1',
    ),

    // Common noise that isn't a real defect.
    ignoreErrors: [
      // ResizeObserver loop notification fired by browsers on rapid layout
      // changes — harmless but spammy.
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      // User aborted navigation while a fetch was in flight.
      'AbortError',
      // Extension-injected fetches (Brave, ad-blockers) sometimes throw here.
      'Non-Error promise rejection captured',
    ],

    // Strip query strings before sending — the /welcome page receives a
    // signer magic-link token in the URL that must never leave the client.
    beforeSend(event) {
      if (event.request?.url) {
        try {
          const u = new URL(event.request.url)
          u.search = ''
          event.request.url = u.toString()
        } catch { /* not a URL — ignore */ }
      }
      return event
    },
  })

  // eslint-disable-next-line no-console
  console.log(`[sentry] initialised (env=${import.meta.env.MODE})`)
}

export { Sentry }
