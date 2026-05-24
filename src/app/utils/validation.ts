// Shared input validation for all forms.
// Limits and rules mirror the backend (notwaiting-api) so the client rejects
// the same inputs the server would, with friendlier messages.

import i18n from '../i18n'

type Translator = (key: string, opts?: Record<string, any>) => string

const defaultT: Translator = (key, opts) => i18n.t(key, opts) as string

export const LIMITS = {
  firstName: 60,
  country: 80,
  email: 254,
  wave: 120,
  waveOther: 60,
  story: 600,
  caption: 600,
  contactName: 80,
  contactOrg: 120,
  contactMessage: 2000,
  aiDetail: 120,
  aiPrompt: 500,
  aiQuestion: 120,
  password: 128,
} as const

// Matches the regex used by the backend manifesto route.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Mirrors the server-side sanitise(): trim, strip angle brackets, clamp length.
export function sanitize(value: string | undefined | null, max: number): string {
  if (!value) return ''
  return String(value).trim().replace(/[<>]/g, '').slice(0, max)
}

export function isEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim())
}

export type ValidationErrors<K extends string = string> = Partial<Record<K, string>>

export interface ValidationResult<K extends string = string> {
  valid: boolean
  errors: ValidationErrors<K>
}

function ok<K extends string>(errors: ValidationErrors<K>): ValidationResult<K> {
  return { valid: Object.keys(errors).length === 0, errors }
}

// ── Manifesto (inline + full form) ────────────────────────────────────────

export type ManifestoField = 'firstName' | 'country' | 'email' | 'wave' | 'waveOther' | 'story'

export interface ManifestoInput {
  firstName: string
  country: string
  email: string
  wave?: string
  waveOther?: string
  story?: string
}

export interface ManifestoOptions {
  requireWave?: boolean
  requireStory?: boolean
}

export function validateManifesto(
  data: ManifestoInput,
  opts: ManifestoOptions = {},
  t: Translator = defaultT,
): ValidationResult<ManifestoField> {
  const errors: ValidationErrors<ManifestoField> = {}

  const firstName = data.firstName.trim()
  if (!firstName) {
    errors.firstName = t('validation.fullNameRequired')
  } else if (firstName.length < 2) {
    errors.firstName = t('validation.fullNameShort')
  } else if (firstName.length > LIMITS.firstName) {
    errors.firstName = t('validation.fullNameLong', { n: LIMITS.firstName })
  }

  const country = data.country.trim()
  if (!country) {
    errors.country = t('validation.countryRequired')
  } else if (country.length > LIMITS.country) {
    errors.country = t('validation.countryLong', { n: LIMITS.country })
  }

  const email = data.email.trim()
  if (!email) {
    errors.email = t('validation.emailRequired')
  } else if (email.length > LIMITS.email) {
    errors.email = t('validation.emailLong', { n: LIMITS.email })
  } else if (!isEmail(email)) {
    errors.email = t('validation.emailInvalid')
  }

  if (opts.requireWave) {
    if (!data.wave) {
      errors.wave = t('validation.sectorRequired')
    } else if (data.wave === 'other') {
      const other = (data.waveOther ?? '').trim()
      if (!other) {
        errors.waveOther = t('validation.sectorDescribe')
      } else if (other.length > LIMITS.waveOther) {
        errors.waveOther = t('validation.sectorLong', { n: LIMITS.waveOther })
      }
    }
  }

  if (opts.requireStory) {
    const story = (data.story ?? '').trim()
    if (!story) {
      errors.story = t('validation.storyRequired')
    } else if (story.length < 10) {
      errors.story = t('validation.storyShort')
    } else if (story.length > LIMITS.story) {
      errors.story = t('validation.storyLong', { n: LIMITS.story })
    }
  }

  return ok(errors)
}

// ── Contact form ──────────────────────────────────────────────────────────

export type ContactField = 'name' | 'email' | 'organization' | 'inquiryType' | 'message'

export interface ContactInput {
  name: string
  email: string
  organization?: string
  inquiryType: string
  message: string
}

export function validateContact(data: ContactInput, t: Translator = defaultT): ValidationResult<ContactField> {
  const errors: ValidationErrors<ContactField> = {}

  const name = data.name.trim()
  if (!name) {
    errors.name = t('validation.nameRequired')
  } else if (name.length < 2) {
    errors.name = t('validation.nameShort')
  } else if (name.length > LIMITS.contactName) {
    errors.name = t('validation.nameLong', { n: LIMITS.contactName })
  }

  const email = data.email.trim()
  if (!email) {
    errors.email = t('validation.emailRequired')
  } else if (email.length > LIMITS.email) {
    errors.email = t('validation.emailLong', { n: LIMITS.email })
  } else if (!isEmail(email)) {
    errors.email = t('validation.emailInvalid')
  }

  const org = (data.organization ?? '').trim()
  if (org && org.length > LIMITS.contactOrg) {
    errors.organization = t('validation.orgLong', { n: LIMITS.contactOrg })
  }

  if (!data.inquiryType) {
    errors.inquiryType = t('validation.inquiryRequired')
  }

  const message = data.message.trim()
  if (!message) {
    errors.message = t('validation.messageRequired')
  } else if (message.length < 10) {
    errors.message = t('validation.messageShort')
  } else if (message.length > LIMITS.contactMessage) {
    errors.message = t('validation.messageLong', { n: LIMITS.contactMessage })
  }

  return ok(errors)
}

// ── AI caption / story inputs ─────────────────────────────────────────────

export type AiCaptionField = 'category' | 'customCategory' | 'name' | 'detail' | 'prompt'

export interface AiCaptionInput {
  category: string
  customCategory?: string
  about: 'me' | 'someone' | 'organisation' | string
  name?: string
  detail?: string
  prompt: string
}

export function validateAiCaption(data: AiCaptionInput, t: Translator = defaultT): ValidationResult<AiCaptionField> {
  const errors: ValidationErrors<AiCaptionField> = {}

  if (!data.category) {
    errors.category = t('validation.sectorChoose')
  } else if (data.category === 'other') {
    const cc = (data.customCategory ?? '').trim()
    if (!cc) errors.customCategory = t('validation.sectorDescribe')
    else if (cc.length > LIMITS.waveOther) errors.customCategory = t('validation.sectorLong', { n: LIMITS.waveOther })
  }

  if (data.about !== 'me') {
    const name = (data.name ?? '').trim()
    if (!name) {
      errors.name = data.about === 'someone' ? t('validation.enterTheirName') : t('validation.enterOrgName')
    } else if (name.length > LIMITS.firstName) {
      errors.name = t('validation.nameLong', { n: LIMITS.firstName })
    }
  }

  if (data.detail && data.detail.length > LIMITS.aiDetail) {
    errors.detail = t('validation.detailLong', { n: LIMITS.aiDetail })
  }

  const prompt = data.prompt.trim()
  if (!prompt) {
    errors.prompt = t('validation.promptEmpty')
  } else if (prompt.length < 5) {
    errors.prompt = t('validation.promptShort')
  } else if (prompt.length > LIMITS.aiPrompt) {
    errors.prompt = t('validation.promptLong', { n: LIMITS.aiPrompt })
  }

  return ok(errors)
}

export function validateAiAnswer(answer: string, required: boolean, t: Translator = defaultT): string | undefined {
  const trimmed = answer.trim()
  if (required && !trimmed) return t('validation.answerRequired')
  if (trimmed.length > LIMITS.aiQuestion) return t('validation.answerLong', { n: LIMITS.aiQuestion })
  return undefined
}

// ── Dashboard sign-in ─────────────────────────────────────────────────────

export type SignInField = 'email' | 'password'

export function validateSignIn(email: string, password: string, t: Translator = defaultT): ValidationResult<SignInField> {
  const errors: ValidationErrors<SignInField> = {}
  const e = email.trim()
  if (!e) errors.email = t('validation.emailRequired')
  else if (!isEmail(e)) errors.email = t('validation.emailInvalid')
  else if (e.length > LIMITS.email) errors.email = t('validation.emailLong', { n: LIMITS.email })

  if (!password) errors.password = t('validation.passwordRequired')
  else if (password.length > LIMITS.password) errors.password = t('validation.passwordLong', { n: LIMITS.password })

  return ok(errors)
}

// ── Helpers ───────────────────────────────────────────────────────────────

export function firstError(errors: ValidationErrors): string | undefined {
  for (const k of Object.keys(errors)) {
    const v = errors[k]
    if (v) return v
  }
  return undefined
}
