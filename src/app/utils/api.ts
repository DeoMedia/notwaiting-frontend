// src/app/utils/api.ts
// All calls to the backend API go through this file.
// The base URL reads from the Vite env variable so it works
// in dev (localhost:3001) and production (your deployed server URL).

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

// ── Signer ownership ──────────────────────────────────────────
// The signer session cookie (`nw_signer`) is HttpOnly and is now only
// minted by POST /api/manifesto/claim — after the user clicks the magic
// link in the confirmation email. This gates cookie issuance on email
// control and lets POST /api/manifesto return an identical 200 success
// response on both fresh and duplicate-email paths (anti-enumeration).
//
// signerId is remembered in sessionStorage because /api/stories and
// /api/actions require it in the body to bind the cookie to a specific
// signer. The id is only persisted *after* a successful /claim — the
// initial POST /api/manifesto response carries nothing.
const SIGNER_ID_KEY = 'nw_signer_id'

function safeSession() {
  try {
    return typeof window !== 'undefined' ? window.sessionStorage : null
  } catch {
    return null
  }
}

export function storeSignerCredentials(signerId: string) {
  const s = safeSession()
  if (!s) return
  s.setItem(SIGNER_ID_KEY, signerId)
}

export function clearSignerCredentials() {
  const s = safeSession()
  if (!s) return
  s.removeItem(SIGNER_ID_KEY)
}

export function getStoredSignerId(): string | null {
  return safeSession()?.getItem(SIGNER_ID_KEY) ?? null
}

// Error thrown when a request fails. Carries the HTTP status so callers can
// branch on it (e.g. 401 → sign out) without brittle string-matching on the
// message body.
export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = (data as { error?: string }).error ?? `Request failed: ${res.status}`
    throw new ApiError(message, res.status)
  }
  return data as T
}

// ── Manifesto ─────────────────────────────────────────────────
// The response is intentionally bare `{ success: true }` regardless of
// whether this email was a fresh signup or already existed. Anything that
// depends on signerId/signerToken (story posting, action tracking, the
// session cookie) happens after the user clicks the magic link in the
// confirmation email — see claimSignerSession() below.
export async function signManifesto(payload: {
  firstName: string
  country: string
  email: string
  wave?: string
  /** Optional inline story posted atomically with the signup. */
  caption?: string
  /** Required when `caption` is set. Must be a known wave tag. */
  waveTag?: string
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
// server sets the HttpOnly `nw_signer` cookie and returns the signerId so
// the SPA can remember it locally for subsequent /api/stories writes.
export async function claimSignerSession(payload: { signerId: string; token: string }) {
  const res = await request<{ success: true; signerId: string; firstName: string }>(
    '/api/manifesto/claim',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  )
  storeSignerCredentials(res.signerId)
  return res
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
  signerId: string
  caption: string
  waveTag: string
}) {
  // Signer token now rides as the HttpOnly `nw_signer` cookie set by
  // POST /api/manifesto. The `credentials: 'include'` in `request<T>`
  // makes the browser auto-attach it; no header to manage.
  return request<{ success: boolean; storyId: string }>('/api/stories', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// ── Actions ───────────────────────────────────────────────────
export async function trackAction(payload: {
  signerId: string
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
// Exchange a Supabase access token for an HttpOnly admin session cookie.
// After this returns, /api/admin/* requests authorise via the cookie alone
// and the Supabase token can be dropped.
export async function createAdminSession(accessToken: string) {
  return request<{ success: boolean; role: string; email: string | null; expiresInSeconds: number }>(
    '/api/admin/session',
    {
      method: 'POST',
      body: JSON.stringify({ accessToken }),
    },
  )
}

// Clear the admin session cookie. Idempotent — 204 on success even if no
// cookie was set.
export async function destroyAdminSession() {
  await fetch(`${BASE}/api/admin/session`, {
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
