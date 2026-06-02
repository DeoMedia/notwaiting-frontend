// src/app/utils/api.ts
// All calls to the backend API go through this file.
// The base URL is supplied by the environment for each deployment.

const API_BASE = String(import.meta.env.VITE_API_URL ?? '').trim().replace(/\/$/, '')

function getApiBaseUrl() {
  if (!API_BASE) {
    throw new Error('VITE_API_URL is not configured')
  }
  return API_BASE
}

// Email verification is stored server-side. The frontend submits the email with
// story requests; the API decides whether that address has already been verified.

// Error thrown when a request fails. Carries the HTTP status so callers can
// branch on it (e.g. 401 → sign out) without brittle string-matching on the
// message body.
export class ApiError extends Error {
  status: number
  code?: string
  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = (data as { error?: string }).error ?? `Request failed: ${res.status}`
    const code = (data as { code?: string }).code
    throw new ApiError(message, res.status, code)
  }
  return data as T
}

// ── Manifesto ─────────────────────────────────────────────────
// The response is intentionally bare `{ success: true }` regardless of
// whether this email was a fresh signup or already existed.
export async function signManifesto(payload: {
  firstName: string
  country: string
  email: string
  wave?: string
  newsletterOptIn?: boolean
  /** Honeypot — must remain empty for real users. */
  company?: string
  /** Optional hCaptcha token if the site has it enabled. */
  captchaToken?: string
}) {
  return request<{ success: true }>('/api/manifesto', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// Redeem the magic-link token from the confirmation email. On success the
// server sets the HttpOnly `nw_signer` cookie.
export async function claimSignerSession(payload: { signerId: string; token: string }) {
  return request<{ success: true; signerId: string; firstName: string }>(
    '/api/manifesto/claim',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  )
}

// Trigger a fresh verification email. The server always responds 200 — we
// can't distinguish "sent" from "no such signer".
export async function resendVerificationEmail(payload: { signerId?: string | null; email?: string | null }) {
  return request<{ success: true }>('/api/manifesto/resend-verification', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getSignerCount() {
  return request<{ total_signers: number; total_countries: number }>('/api/manifesto/count')
}

// ── Claude AI ─────────────────────────────────────────────────
export async function generateCaption(payload: {
  waveTag: string
  subject: 'me' | 'someone' | 'organisation'
  detail?: string
  customPrompt?: string
}) {
  return request<{ caption: string }>('/api/claude', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// ── Stories ───────────────────────────────────────────────────
export async function fetchStories(params?: {
  page?: number
  limit?: number
  wave?: string
  country?: string
}) {
  const qs = new URLSearchParams()
  if (params?.page !== undefined) qs.set('page', String(params.page))
  if (params?.limit !== undefined) qs.set('limit', String(params.limit))
  if (params?.wave) qs.set('wave', params.wave)
  if (params?.country) qs.set('country', params.country)
  return request<{ stories: Story[]; total: number; page: number; limit: number }>(`/api/stories?${qs}`)
}

export async function publishStory(payload: {
  firstName: string
  country: string
  email: string
  wave?: string
  caption: string
  waveTag: string
  /** Honeypot — must remain empty for real users. */
  company?: string
  /** Optional hCaptcha token if the site has it enabled. */
  captchaToken?: string
}) {
  return request<{ success: boolean; storyId: string }>('/api/stories', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// ── Actions ───────────────────────────────────────────────────
export async function trackAction(payload: {
  action: 'got_mark' | 'shared_social' | 'shared_story'
  metadata?: Record<string, unknown>
}) {
  return request<{ success: boolean }>('/api/actions', {
    method: 'POST',
    body: JSON.stringify(payload),
  }).catch(() => { /* non-blocking — don't break UX if tracking fails */ })
}

// ── Contact ───────────────────────────────────────────────────
export async function submitContact(payload: {
  name: string
  email: string
  subject?: string
  message: string
  /** Honeypot — leave empty for real users. */
  company?: string
  captchaToken?: string
}) {
  return request<{ success: boolean }>('/api/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// ── Admin session ─────────────────────────────────────────────
// Admin authentication goes through the backend only. The API validates the
// credentials server-side and returns an HttpOnly session cookie.
export async function createAdminSession(payload: { email: string; password: string }) {
  return request<{ success: boolean; role: string; email: string | null; expiresInSeconds: number }>(
    '/api/admin/session',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  )
}

// Clear the admin session cookie. Idempotent — 204 on success even if no
// cookie was set.
export async function destroyAdminSession() {
  await fetch(`${getApiBaseUrl()}/api/admin/session`, {
    method: 'DELETE',
    credentials: 'include',
  }).catch(() => { /* best-effort */ })
}

// ── Dashboard ─────────────────────────────────────────────────
export async function fetchDashboard() {
  // The HttpOnly admin session cookie is auto-attached by the browser.
  return request<DashboardData>('/api/dashboard')
}

// ── Types ─────────────────────────────────────────────────────
export interface Story {
  id: string
  first_name: string
  country: string
  wave_tag: string
  caption: string
  created_at: string
}

export interface DashboardData {
  stats: {
    total_signers: number
    total_countries: number
    total_marks: number
    total_shares: number
    signed_today: number
    marks_today: number
    shares_today: number
  }
  waves: { wave_tag: string; signer_count: number }[]
  countries: { country: string; signer_count: number }[]
  recent: { first_name: string; country: string; wave_tag: string | null; created_at: string }[]
  last7Days: { signed: number; got_mark: number; shared_social: number; shared_story: number }
}
