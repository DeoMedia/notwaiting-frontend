// Mirror of the API-side manifesto confirmation email template.
// Keep this in sync with notwaiting-api/services/email/templates/manifestoConfirmation.js
// so that /email-preview reflects what users actually receive.

function escapeHtml(str = ''): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export interface ManifestoConfirmationInput {
  firstName: string
  frontendUrl?: string
  /** Optional signer id + token for the magic-link CTA preview. */
  signerId?: string
  signerToken?: string
  /** 'fresh' (first-time) vs 'returning' (already-signed) headline copy. */
  variant?: 'fresh' | 'returning'
}

export interface ManifestoConfirmationOutput {
  subject: string
  html: string
  text: string
}

export function buildManifestoConfirmation({
  firstName,
  frontendUrl = 'https://notwaiting.africa',
  signerId,
  signerToken,
  variant = 'fresh',
}: ManifestoConfirmationInput): ManifestoConfirmationOutput {
  const safeName = escapeHtml(firstName || 'Friend')
  const base = frontendUrl.replace(/\/$/, '')
  const waveMarkUrl = `${base}/get-mark`
  const storiesUrl = `${base}/stories`
  const manifestoUrl = `${base}/manifesto`
  // Magic-link CTA preview — only rendered when both id and token are
  // present. Mirrors the API-side template at
  // notwaiting-api/services/email/templates/manifestoConfirmation.js.
  const claimUrl = signerId && signerToken
    ? `${base}/welcome?t=${encodeURIComponent(signerToken)}&id=${encodeURIComponent(signerId)}`
    : null
  const isReturning = variant === 'returning'

  const subject = isReturning
    ? `Welcome back, ${firstName || 'Friend'}. Pick up where you left off.`
    : `${firstName || 'Friend'}, your signature is in. Welcome to #NotWaiting.`

  const text = [
    `Hi ${firstName || 'there'},`,
    '',
    `Thank you for signing the #NotWaiting manifesto. Your name now stands alongside thousands across the continent who refuse to wait for permission to build, lead, and shape the future of Africa.`,
    '',
    `This isn't just a signature. It's a commitment.`,
    '',
    `WHAT'S NEXT`,
    '',
    `01 / Share your story`,
    `Tell us what you're not waiting for. Your story lives on the Stories Wall.`,
    `${storiesUrl}`,
    '',
    `02 / Wear the wave`,
    `Add the wave mark to your photos and profiles — make the movement visible.`,
    `${waveMarkUrl}`,
    '',
    `We're not waiting — and now, neither are you.`,
    '',
    `— The #NotWaiting Team`,
    `${base}`,
  ].join('\n')

  const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${escapeHtml(subject)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
  <!--[if mso]>
  <style type="text/css">
    .display-font { font-family: 'Arial Black', Impact, sans-serif !important; }
    .mono-font { font-family: 'Courier New', monospace !important; }
  </style>
  <![endif]-->
  <style type="text/css">
    @media screen and (max-width: 480px) {
      .email-shell {
        padding: 18px 12px !important;
      }

      .email-container {
        width: 100% !important;
        max-width: 100% !important;
        table-layout: fixed !important;
      }

      .email-header {
        padding: 28px 24px 24px 24px !important;
      }

      .email-logo,
      .email-header-meta {
        display: block !important;
        width: 100% !important;
        text-align: left !important;
      }

      .email-logo {
        padding-bottom: 10px !important;
        font-size: 26px !important;
        line-height: 1.05 !important;
      }

      .email-header-meta {
        font-size: 9px !important;
        line-height: 1.5 !important;
      }

      .email-section-pad {
        padding-left: 24px !important;
        padding-right: 24px !important;
      }

      .email-hero {
        padding-top: 40px !important;
      }

      .email-title {
        font-size: 35px !important;
        line-height: 1.05 !important;
      }

      .email-paragraph {
        font-size: 14px !important;
        line-height: 1.65 !important;
      }

      .email-quote-text {
        font-size: 18px !important;
      }

      .email-card-pad {
        padding: 20px 18px !important;
      }

      .email-card-eyebrow,
      .email-footer-links {
        letter-spacing: 0.1em !important;
      }

      .email-card-title {
        font-size: 17px !important;
      }

      .email-card-copy {
        font-size: 13px !important;
      }

      .email-cta-link {
        display: block !important;
        padding: 16px 22px !important;
        text-align: center !important;
        white-space: normal !important;
      }

      .email-footer {
        padding: 24px !important;
      }

      .email-footer-links {
        line-height: 1.8 !important;
        word-break: break-word !important;
      }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#F5F5F5;font-family:'Space Mono','Courier New',monospace;color:#0C0C0A;-webkit-font-smoothing:antialiased;mso-line-height-rule:exactly;">
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#F5F5F5;opacity:0;">
    Your name is on the #NotWaiting manifesto. Here's what's next.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="email-shell" style="background-color:#F5F5F5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="email-container" style="max-width:600px;background-color:#FFFFFF;">

          <!-- Header — black bar -->
          <tr>
            <td class="email-header" style="background-color:#0C0C0A;padding:32px 36px 28px 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="email-logo" style="font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:bold;color:#FFFFFF;letter-spacing:-0.5px;line-height:1;">
                    #NotWaiting
                  </td>
                  <td align="right" valign="middle" class="mono-font email-header-meta" style="font-family:'Space Mono','Courier New',monospace;font-size:10px;letter-spacing:0.22em;color:#FFFFFF;text-transform:uppercase;">
                    <span style="opacity:0.6;">Manifesto&nbsp;/&nbsp;Signed</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Pan-African tri-color strip -->
          <tr>
            <td style="padding:0;line-height:0;font-size:0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="33%" height="6" style="background-color:#DD3935;font-size:0;line-height:0;">&nbsp;</td>
                  <td width="34%" height="6" style="background-color:#EBBD06;font-size:0;line-height:0;">&nbsp;</td>
                  <td width="33%" height="6" style="background-color:#027A4F;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Big headline block -->
          <tr>
            <td class="email-section-pad email-hero" style="padding:48px 36px 8px 36px;background-color:#FFFFFF;">
              <div class="mono-font" style="font-family:'Space Mono','Courier New',monospace;font-size:11px;letter-spacing:0.22em;color:#DD3935;text-transform:uppercase;margin-bottom:18px;font-weight:bold;">
                Signature&nbsp;·&nbsp;Confirmed
              </div>
              <h1 class="display-font email-title" style="margin:0;font-family:'Helvetica Neue','Arial Black',Impact,Arial,sans-serif;font-weight:900;font-size:42px;line-height:1.02;color:#0C0C0A;text-transform:uppercase;letter-spacing:-0.015em;">
                You're in,<br />${safeName}.
              </h1>
            </td>
          </tr>

          <!-- Body copy -->
          <tr>
            <td class="email-section-pad" style="padding:24px 36px 8px 36px;">
              <p class="mono-font email-paragraph" style="margin:0 0 18px 0;font-family:'Space Mono','Courier New',monospace;font-size:15px;line-height:1.7;color:#0C0C0A;">
                Thank you for signing the <strong>#NotWaiting</strong> manifesto. Your name now stands alongside others across the continent who refuse to wait for permission to build, lead, and shape the future of Africa.
              </p>
              <p class="mono-font email-paragraph" style="margin:0 0 8px 0;font-family:'Space Mono','Courier New',monospace;font-size:15px;line-height:1.7;color:#0C0C0A;">
                This isn't just a signature. It's a commitment — and the movement grows louder every time one of us shows up.
              </p>
            </td>
          </tr>

          <!-- Tri-bar quote pull -->
          <tr>
            <td class="email-section-pad" style="padding:24px 36px 36px 36px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td width="6" valign="top" style="padding:0;line-height:0;font-size:0;width:6px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="6">
                      <tr><td width="6" height="44" style="background-color:#DD3935;font-size:0;line-height:0;">&nbsp;</td></tr>
                      <tr><td width="6" height="44" style="background-color:#EBBD06;font-size:0;line-height:0;">&nbsp;</td></tr>
                      <tr><td width="6" height="44" style="background-color:#027A4F;font-size:0;line-height:0;">&nbsp;</td></tr>
                    </table>
                  </td>
                  <td valign="middle" class="display-font email-quote-text" style="padding:4px 0 4px 22px;font-family:'Helvetica Neue','Arial Black',Impact,Arial,sans-serif;font-weight:900;font-size:20px;line-height:1.3;color:#0C0C0A;text-transform:uppercase;letter-spacing:-0.01em;">
                    We're not waiting<br />for permission.<br />We're already moving.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- What's next caption -->
          <tr>
            <td class="email-section-pad" style="padding:0 36px;">
              <div style="border-top:1px solid #EAE5DC;padding-top:28px;">
                <div class="mono-font" style="font-family:'Space Mono','Courier New',monospace;font-size:11px;letter-spacing:0.22em;color:#0C0C0A;text-transform:uppercase;font-weight:bold;margin-bottom:18px;">
                  What's next
                </div>
              </div>
            </td>
          </tr>

          <!-- Step 01 — Share your story -->
          <tr>
            <td class="email-section-pad" style="padding:0 36px 14px 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F5F5F5;">
                <tr>
                  <td width="4" style="background-color:#DD3935;font-size:0;line-height:0;">&nbsp;</td>
                  <td class="email-card-pad" style="padding:22px 24px;">
                    <div class="mono-font email-card-eyebrow" style="font-family:'Space Mono','Courier New',monospace;font-size:11px;font-weight:bold;color:#DD3935;letter-spacing:0.18em;margin-bottom:10px;">
                      01&nbsp;/&nbsp;Share your story
                    </div>
                    <div class="display-font email-card-title" style="font-family:'Helvetica Neue','Arial Black',Impact,Arial,sans-serif;font-weight:900;font-size:18px;line-height:1.2;color:#0C0C0A;text-transform:uppercase;letter-spacing:-0.01em;margin-bottom:10px;">
                      Tell us what you're not waiting for.
                    </div>
                    <div class="mono-font email-card-copy" style="font-family:'Space Mono','Courier New',monospace;font-size:14px;line-height:1.65;color:#0C0C0A;margin-bottom:14px;">
                      Your story lives on the Stories Wall and inspires others to act.
                    </div>
                    <a href="${storiesUrl}" class="mono-font" style="font-family:'Space Mono','Courier New',monospace;font-size:13px;font-weight:bold;color:#DD3935;text-decoration:none;border-bottom:2px solid #DD3935;padding-bottom:2px;">
                      Share your story →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Step 02 — Wear the wave -->
          <tr>
            <td class="email-section-pad" style="padding:0 36px 32px 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F5F5F5;">
                <tr>
                  <td width="4" style="background-color:#EBBD06;font-size:0;line-height:0;">&nbsp;</td>
                  <td class="email-card-pad" style="padding:22px 24px;">
                    <div class="mono-font email-card-eyebrow" style="font-family:'Space Mono','Courier New',monospace;font-size:11px;font-weight:bold;color:#0C0C0A;letter-spacing:0.18em;margin-bottom:10px;">
                      02&nbsp;/&nbsp;Wear the wave
                    </div>
                    <div class="display-font email-card-title" style="font-family:'Helvetica Neue','Arial Black',Impact,Arial,sans-serif;font-weight:900;font-size:18px;line-height:1.2;color:#0C0C0A;text-transform:uppercase;letter-spacing:-0.01em;margin-bottom:10px;">
                      Make the movement visible.
                    </div>
                    <div class="mono-font email-card-copy" style="font-family:'Space Mono','Courier New',monospace;font-size:14px;line-height:1.65;color:#0C0C0A;margin-bottom:14px;">
                      Add the wave mark to your photos and profiles — one face, one feed at a time.
                    </div>
                    <a href="${waveMarkUrl}" class="mono-font" style="font-family:'Space Mono','Courier New',monospace;font-size:13px;font-weight:bold;color:#0C0C0A;text-decoration:none;border-bottom:2px solid #0C0C0A;padding-bottom:2px;">
                      Open the wave mark tool →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Primary CTA -->
          <tr>
            <td align="center" class="email-section-pad" style="padding:0 36px 44px 36px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#DD3935;">
                    <a href="${waveMarkUrl}" class="display-font email-cta-link" style="display:inline-block;padding:18px 36px;font-family:'Helvetica Neue','Arial Black',Impact,Arial,sans-serif;font-size:14px;font-weight:900;color:#FFFFFF;text-decoration:none;text-transform:uppercase;letter-spacing:0.08em;">
                      Get your wave mark →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Sign-off -->
          <tr>
            <td class="email-section-pad" style="padding:0 36px 44px 36px;">
              <div style="border-top:1px solid #EAE5DC;padding-top:28px;">
                <p class="mono-font email-paragraph" style="margin:0 0 8px 0;font-family:'Space Mono','Courier New',monospace;font-size:15px;line-height:1.7;color:#0C0C0A;">
                  We're not waiting — and now, neither are you.
                </p>
                <p class="mono-font" style="margin:0;font-family:'Space Mono','Courier New',monospace;font-size:13px;color:#666666;">
                  — The #NotWaiting Team
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer — black -->
          <tr>
            <td class="email-footer" style="background-color:#0C0C0A;padding:24px 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td class="mono-font" style="font-family:'Space Mono','Courier New',monospace;font-size:11px;line-height:1.7;color:#FFFFFF;">
                    <span style="opacity:0.65;">
                      You received this email because you signed the #NotWaiting manifesto. If this wasn't you, you can safely ignore this message.
                    </span>
                  </td>
                </tr>
                <tr>
                  <td class="mono-font email-footer-links" style="padding-top:14px;font-family:'Space Mono','Courier New',monospace;font-size:11px;color:#FFFFFF;letter-spacing:0.18em;text-transform:uppercase;">
                    <a href="${base}" style="color:#FFFFFF;text-decoration:none;opacity:0.55;">notwaiting.africa</a>
                    &nbsp;·&nbsp;
                    <a href="${manifestoUrl}" style="color:#FFFFFF;text-decoration:none;opacity:0.55;">Manifesto</a>
                    &nbsp;·&nbsp;
                    <a href="${storiesUrl}" style="color:#FFFFFF;text-decoration:none;opacity:0.55;">Stories</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Bottom tri-color strip -->
          <tr>
            <td style="padding:0;line-height:0;font-size:0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="33%" height="8" style="background-color:#DD3935;font-size:0;line-height:0;">&nbsp;</td>
                  <td width="34%" height="8" style="background-color:#EBBD06;font-size:0;line-height:0;">&nbsp;</td>
                  <td width="33%" height="8" style="background-color:#027A4F;font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  return { subject, html, text }
}
