import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { copyToClipboard } from '../app/utils/clipboard'

// jsdom doesn't implement execCommand — define it so spyOn works
if (!document.execCommand) {
  Object.defineProperty(document, 'execCommand', {
    value: () => true,
    writable: true,
    configurable: true,
  })
}

describe('copyToClipboard', () => {
  let execCommandSpy: ReturnType<typeof vi.spyOn>
  let appendChildSpy: ReturnType<typeof vi.spyOn>
  let removeChildSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    execCommandSpy = vi.spyOn(document, 'execCommand').mockReturnValue(true)
    appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((el) => el as any)
    removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((el) => el as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns true when execCommand copy succeeds', async () => {
    execCommandSpy.mockReturnValue(true)
    const result = await copyToClipboard('Hello #NotWaiting')
    expect(result).toBe(true)
  })

  it('returns false when execCommand copy fails', async () => {
    execCommandSpy.mockReturnValue(false)
    const result = await copyToClipboard('test')
    expect(result).toBe(false)
  })

  it('appends and removes textarea from DOM', async () => {
    await copyToClipboard('test text')
    expect(appendChildSpy).toHaveBeenCalled()
    expect(removeChildSpy).toHaveBeenCalled()
  })

  it('returns false (not throws) when execCommand throws', async () => {
    execCommandSpy.mockImplementation(() => { throw new Error('execCommand not available') })
    const result = await copyToClipboard('test')
    expect(result).toBe(false)
  })

  it('removes textarea from DOM even when execCommand throws', async () => {
    execCommandSpy.mockImplementation(() => { throw new Error('exec failed') })
    await copyToClipboard('test')
    expect(removeChildSpy).toHaveBeenCalled()
  })

  it('copies empty string without throwing', async () => {
    const result = await copyToClipboard('')
    expect(typeof result).toBe('boolean')
  })

  it('copies long text (600 characters) and returns true', async () => {
    const longText = 'A'.repeat(600)
    execCommandSpy.mockReturnValue(true)
    const result = await copyToClipboard(longText)
    expect(result).toBe(true)
  })

  it('calls execCommand with "copy" command', async () => {
    await copyToClipboard('some text')
    expect(execCommandSpy).toHaveBeenCalledWith('copy')
  })
})
