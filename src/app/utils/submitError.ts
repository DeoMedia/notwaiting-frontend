// Translates a raw submit-time error into a user-friendly message and tells
// callers whether a Retry button is appropriate. Network-layer failures
// (Safari's "Load failed", Chrome's "Failed to fetch", TypeError from fetch)
// surface as raw browser strings — we replace them with a localized hint
// and mark them retryable. Server-side errors (ApiError with a status) keep
// their backend message and aren't auto-retried, since the same payload
// will hit the same rule.

import type { TFunction } from 'i18next'
import { ApiError } from './api'

export interface SubmitErrorInfo {
  message: string
  retryable: boolean
}

const NETWORK_ERROR_HINTS = [
  'load failed',
  'failed to fetch',
  'networkerror',
  'network error',
  'network request failed',
  'the internet connection appears to be offline',
  'the network connection was lost',
]

function looksLikeNetworkError(err: unknown): boolean {
  if (err instanceof ApiError) return false
  if (err instanceof TypeError) return true
  const msg = err instanceof Error ? err.message : String(err ?? '')
  const lower = msg.toLowerCase()
  return NETWORK_ERROR_HINTS.some(hint => lower.includes(hint))
}

export function formatSubmitError(err: unknown, t: TFunction, fallbackKey: string): SubmitErrorInfo {
  if (looksLikeNetworkError(err)) {
    return {
      message: t('common.networkError', {
        defaultValue: 'Network problem — check your connection and try again.',
      }),
      retryable: true,
    }
  }
  const msg = err instanceof Error ? err.message : ''
  return {
    message: msg || t(fallbackKey, { defaultValue: 'Something went wrong. Please try again.' }),
    retryable: false,
  }
}
