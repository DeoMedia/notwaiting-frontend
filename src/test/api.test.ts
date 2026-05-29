import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  signManifesto,
  getSignerCount,
  generateCaption,
  fetchStories,
  publishStory,
  resendVerificationEmail,
  trackAction,
  fetchDashboard,
  createAdminSession,
} from '../app/utils/api'

// Mock global fetch for all tests
const mockFetch = vi.fn()
globalThis.fetch = mockFetch

function mockOk(body: unknown) {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve(body),
  } as Response)
}

function mockError(status: number, body: unknown) {
  return Promise.resolve({
    ok: false,
    status,
    json: () => Promise.resolve(body),
  } as Response)
}

describe('signManifesto', () => {
  beforeEach(() => mockFetch.mockClear())

  it('POSTs to /api/manifesto with correct payload', async () => {
    mockFetch.mockReturnValue(mockOk({ success: true, signerId: 'uuid-1' }))

    const result = await signManifesto({ firstName: 'Amara', country: 'ghana', wave: 'fintech' })

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/manifesto'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ firstName: 'Amara', country: 'ghana', wave: 'fintech' }),
      })
    )
    expect(result.signerId).toBe('uuid-1')
  })

  it('throws with server error message on failure', async () => {
    mockFetch.mockReturnValue(mockError(422, { error: 'First name is required' }))

    await expect(signManifesto({ firstName: '', country: 'ghana' }))
      .rejects.toThrow('First name is required')
  })

  it('throws generic message when server returns no error field', async () => {
    mockFetch.mockReturnValue(mockError(500, {}))

    await expect(signManifesto({ firstName: 'Test', country: 'nigeria' }))
      .rejects.toThrow('Request failed: 500')
  })

  it('sends Content-Type: application/json header', async () => {
    mockFetch.mockReturnValue(mockOk({ success: true, signerId: 'x' }))

    await signManifesto({ firstName: 'A', country: 'B' })

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
      })
    )
  })
})

describe('getSignerCount', () => {
  beforeEach(() => mockFetch.mockClear())

  it('GETs /api/manifesto/count', async () => {
    mockFetch.mockReturnValue(mockOk({ total_signers: 5000, total_countries: 40 }))

    const result = await getSignerCount()

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/manifesto/count'),
      expect.anything()
    )
    expect(result.total_signers).toBe(5000)
    expect(result.total_countries).toBe(40)
  })
})

describe('generateCaption', () => {
  beforeEach(() => mockFetch.mockClear())

  it('POSTs to /api/claude with correct payload', async () => {
    mockFetch.mockReturnValue(mockOk({ caption: 'Building Africa now. #NotWaiting' }))

    const result = await generateCaption({ waveTag: 'fintech', subject: 'me' })

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/claude'),
      expect.objectContaining({ method: 'POST' })
    )
    expect(result.caption).toContain('#NotWaiting')
  })

  it('includes detail and customPrompt when provided', async () => {
    mockFetch.mockReturnValue(mockOk({ caption: 'Custom. #NotWaiting' }))

    await generateCaption({
      waveTag: 'tech',
      subject: 'someone',
      detail: 'Building a payment app',
      customPrompt: 'Write something about payments',
    })

    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.detail).toBe('Building a payment app')
    expect(body.customPrompt).toBe('Write something about payments')
  })

  it('throws on API error', async () => {
    mockFetch.mockReturnValue(mockError(503, { error: 'Claude is temporarily unavailable. Try again shortly.' }))

    await expect(generateCaption({ waveTag: 'health', subject: 'me' }))
      .rejects.toThrow(/temporarily unavailable/i)
  })
})

describe('fetchStories', () => {
  beforeEach(() => mockFetch.mockClear())

  it('GETs /api/stories', async () => {
    mockFetch.mockReturnValue(mockOk({ stories: [] }))

    await fetchStories()

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/stories'),
      expect.anything()
    )
  })

  it('appends page and limit query params', async () => {
    mockFetch.mockReturnValue(mockOk({ stories: [] }))

    await fetchStories({ page: 2, limit: 24 })

    const url = mockFetch.mock.calls[0][0]
    expect(url).toContain('page=2')
    expect(url).toContain('limit=24')
  })

  it('appends wave filter', async () => {
    mockFetch.mockReturnValue(mockOk({ stories: [] }))

    await fetchStories({ wave: 'fintech' })

    const url = mockFetch.mock.calls[0][0]
    expect(url).toContain('wave=fintech')
  })

  it('appends country filter', async () => {
    mockFetch.mockReturnValue(mockOk({ stories: [] }))

    await fetchStories({ country: 'nigeria' })

    const url = mockFetch.mock.calls[0][0]
    expect(url).toContain('country=nigeria')
  })

  it('does not append wave or country when not provided', async () => {
    mockFetch.mockReturnValue(mockOk({ stories: [] }))

    await fetchStories({ page: 0 })

    const url = mockFetch.mock.calls[0][0]
    expect(url).not.toContain('wave=')
    expect(url).not.toContain('country=')
  })

  it('returns stories array from response', async () => {
    const fakeStory = { id: '1', caption: 'Hello', wave_tag: 'tech', country: 'nigeria', first_name: 'Ade', created_at: '2026-01-01' }
    mockFetch.mockReturnValue(mockOk({ stories: [fakeStory] }))

    const result = await fetchStories()

    expect(result.stories).toHaveLength(1)
    expect(result.stories[0].id).toBe('1')
  })
})

describe('publishStory', () => {
  beforeEach(() => mockFetch.mockClear())

  it('POSTs to /api/stories with correct payload', async () => {
    mockFetch.mockReturnValue(mockOk({ success: true, storyId: 'story-1' }))

    const result = await publishStory({ signerId: 'signer-1', caption: 'My story', waveTag: 'tech' })

    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.signerId).toBe('signer-1')
    expect(body.caption).toBe('My story')
    expect(body.waveTag).toBe('tech')
    expect(result.storyId).toBe('story-1')
  })

  it('throws when server rejects with 422', async () => {
    mockFetch.mockReturnValue(mockError(422, { error: 'Caption too long (max 600 characters)' }))

    await expect(publishStory({ signerId: 's1', caption: 'x'.repeat(601), waveTag: 'tech' }))
      .rejects.toThrow(/too long/i)
  })
})

describe('resendVerificationEmail', () => {
  beforeEach(() => mockFetch.mockClear())

  it('POSTs signerId and email to /api/manifesto/resend-verification', async () => {
    mockFetch.mockReturnValue(mockOk({ success: true }))

    await resendVerificationEmail({ signerId: 'signer-1', email: 'test@example.com' })

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/manifesto/resend-verification'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ signerId: 'signer-1', email: 'test@example.com' }),
      })
    )
  })
})

describe('trackAction', () => {
  beforeEach(() => mockFetch.mockClear())

  it('POSTs to /api/actions', async () => {
    mockFetch.mockReturnValue(mockOk({ success: true }))

    await trackAction({ signerId: 'uuid-1', action: 'got_mark' })

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/actions'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('does NOT throw on failure (non-blocking fire-and-forget)', async () => {
    mockFetch.mockReturnValue(mockError(500, { error: 'DB error' }))

    // Should resolve without throwing
    await expect(
      trackAction({ signerId: 'uuid-1', action: 'got_mark' })
    ).resolves.toBeUndefined()
  })

  it('includes metadata in the request body', async () => {
    mockFetch.mockReturnValue(mockOk({ success: true }))

    await trackAction({
      signerId: 'uuid-1',
      action: 'shared_social',
      metadata: { platform: 'twitter' },
    })

    const body = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(body.metadata).toEqual({ platform: 'twitter' })
  })
})

describe('fetchDashboard', () => {
  beforeEach(() => mockFetch.mockClear())

  it('GETs /api/dashboard with credentials:include (cookie auth)', async () => {
    mockFetch.mockReturnValue(mockOk({ stats: {}, waves: [], countries: [], recent: [], last7Days: {} }))

    await fetchDashboard()

    const [url, opts] = mockFetch.mock.calls[0]
    expect(url).toContain('/api/dashboard')
    // Cookies, not Authorization headers, carry the admin session now.
    expect(opts.credentials).toBe('include')
    expect(opts.headers?.Authorization).toBeUndefined()
  })

  it('throws when auth fails (401)', async () => {
    mockFetch.mockReturnValue(mockError(401, { error: 'Unauthorized' }))

    await expect(fetchDashboard()).rejects.toThrow('Unauthorized')
  })
})

describe('createAdminSession', () => {
  beforeEach(() => mockFetch.mockClear())

  it('POSTs admin credentials to the backend session endpoint', async () => {
    mockFetch.mockReturnValue(mockOk({ success: true, role: 'super_admin', email: 'admin@test.com', expiresInSeconds: 3600 }))

    await createAdminSession({ email: 'admin@test.com', password: 'secret' })

    const [url, opts] = mockFetch.mock.calls[0]
    expect(url).toContain('/api/admin/session')
    expect(opts.method).toBe('POST')
    expect(opts.credentials).toBe('include')
    expect(JSON.parse(opts.body)).toEqual({ email: 'admin@test.com', password: 'secret' })
  })
})

describe('API base URL', () => {
  it('uses VITE_API_URL env var when set', async () => {
    // import.meta.env.VITE_API_URL is set to http://localhost:3001 in test setup
    mockFetch.mockReturnValue(mockOk({ total_signers: 0, total_countries: 0 }))

    await getSignerCount()

    const url = mockFetch.mock.calls[0][0]
    expect(url).toMatch(/^http:\/\/localhost:3001/)
  })
})
