import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { I18nextProvider } from 'react-i18next'

// Spies for the API. Hoisted so the vi.mock factory below can close over them.
const api = vi.hoisted(() => ({
  publishStory: vi.fn(),
  signManifesto: vi.fn(),
  resendVerificationEmail: vi.fn(),
  trackAction: vi.fn(),
}))

// Keep the real ApiError (the component branches on `err instanceof ApiError`)
// and override just the network calls.
vi.mock('../app/utils/api', async (importActual) => {
  const actual = await importActual<typeof import('../app/utils/api')>()
  return {
    ...actual,
    publishStory: api.publishStory,
    signManifesto: api.signManifesto,
    resendVerificationEmail: api.resendVerificationEmail,
    trackAction: api.trackAction,
  }
})

// Captcha off so handleShare doesn't gate on a token; render nothing.
vi.mock('../app/components/Captcha', async () => {
  const React = await import('react')
  return { isCaptchaEnabled: () => false, Captcha: React.forwardRef(() => null) }
})

import i18n from '../app/i18n'
import { ApiError } from '../app/utils/api'
import { ManifestoSignForm } from '../app/components/ManifestoSignForm'

function renderForm() {
  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter>
        <ManifestoSignForm onSuccess={() => {}} />
      </MemoryRouter>
    </I18nextProvider>,
  )
}

// Fill the manifesto form with valid values and advance to the share options.
function fillAndReveal(container: HTMLElement) {
  const setInput = (selector: string, value: string) => {
    const el = container.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement
    fireEvent.change(el, { target: { value } })
  }
  const setSelect = (name: string) => {
    const sel = container.querySelector(`select[name="${name}"]`) as HTMLSelectElement
    // option[0] is the placeholder; pick the first real, non-"other" option.
    const opt = Array.from(sel.options).find((o) => o.value && o.value !== 'other')!
    fireEvent.change(sel, { target: { value: opt.value } })
  }

  setInput('input[name="firstName"]', 'Test User')
  setSelect('country')
  setInput('input[name="email"]', 'test@example.com')
  setSelect('wave')
  setInput('textarea[name="story"]', 'This is my not-waiting story.')

  fireEvent.click(screen.getByRole('button', { name: i18n.t('signForm.publish') }))
}

describe('ManifestoSignForm — resend verification is gated after an auto-send', () => {
  beforeEach(() => {
    api.publishStory.mockReset()
    api.signManifesto.mockReset().mockResolvedValue({ success: true })
    api.resendVerificationEmail.mockReset().mockResolvedValue({ success: true })
    api.trackAction.mockReset().mockResolvedValue({})
  })

  it('disables resend (cooldown) when publishing while unverified, so no second email can be sent', async () => {
    // The /api/stories endpoint sends a verification email itself, then rejects
    // with email_not_verified — this is the source of the "first" email.
    api.publishStory.mockRejectedValue(new ApiError('Email is not verified', 403, 'email_not_verified'))

    const { container } = renderForm()
    fillAndReveal(container)

    // Publish to the story-wall (the path in the bug report).
    fireEvent.click(await screen.findByRole('button', { name: i18n.t('signForm.shareToWall') }))

    // The publish call happened exactly once (the single legitimate send).
    await waitFor(() => expect(api.publishStory).toHaveBeenCalledTimes(1))

    // The resend control now reflects "already sent" and is disabled by the
    // cooldown, so the user cannot fire a duplicate the instant the error shows.
    const resendBtn = (await screen.findByText(/resend in \d+s/i)).closest('button')!
    expect(resendBtn).toBeDisabled()

    // Even if a click slips through, the cooldown guard blocks the network call.
    fireEvent.click(resendBtn)
    await new Promise((r) => setTimeout(r, 0))
    expect(api.resendVerificationEmail).not.toHaveBeenCalled()
  })

  it('does not send any verification email from the frontend itself on publish', async () => {
    api.publishStory.mockRejectedValue(new ApiError('Email is not verified', 403, 'email_not_verified'))
    const { container } = renderForm()
    fillAndReveal(container)
    fireEvent.click(await screen.findByRole('button', { name: i18n.t('signForm.shareToWall') }))
    await waitFor(() => expect(api.publishStory).toHaveBeenCalled())
    // The frontend must not call resend on its own — only the backend's
    // publish-time send produces the (single) email.
    expect(api.resendVerificationEmail).not.toHaveBeenCalled()
  })
})
