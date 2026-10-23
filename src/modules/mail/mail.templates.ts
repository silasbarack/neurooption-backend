export interface MailContent { subject: string; html: string; text: string; }

/** Content-ID of the inline logo attachment added by MailService. */
export const LOGO_CID = 'neurooption-logo';

const BRAND = {
  bg: '#ffffff', card: '#ffffff', ink: '#111827', muted: '#6b7280',
  cyan: '#00d4ff', purple: '#7c4dff', soft: '#f3f6fb', border: '#e5e9f2',
};

const escapeHtml = (s: string) =>
  String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/**
 * Shared email shell: dark brand header with the NeuroOption logo, white content card, footer.
 * Table-based with inline styles so it renders consistently in Gmail, Outlook and Apple Mail.
 */
function layout(preheader: string, bodyHtml: string, logoSrc = `cid:${LOGO_CID}`): string {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only"><title>NeuroOption</title></head>
<body style="margin:0;padding:0;background:${BRAND.soft};-webkit-text-size-adjust:100%;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.soft};padding:32px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;border-radius:14px;overflow:hidden;border:1px solid ${BRAND.border};">
        <tr><td style="background:#ffffff;padding:28px 32px 22px;" align="center">
          <img src="${logoSrc}" width="190" height="142" alt="NeuroOption" style="display:block;margin:0 auto;border:0;outline:none;width:190px;height:142px;color:#0b2a5b;font:bold 24px Arial,sans-serif;">
        </td></tr>
        <tr><td style="height:3px;line-height:3px;font-size:0;background:${BRAND.cyan};background-image:linear-gradient(90deg,${BRAND.cyan},${BRAND.purple});">&nbsp;</td></tr>
        <tr><td style="background:${BRAND.card};padding:36px 32px 28px;font-family:Arial,Helvetica,sans-serif;color:${BRAND.ink};font-size:15px;line-height:1.6;">
          ${bodyHtml}
        </td></tr>
        <tr><td style="background:${BRAND.card};padding:0 32px 28px;font-family:Arial,Helvetica,sans-serif;">
          <p style="margin:0;padding-top:20px;border-top:1px solid ${BRAND.border};color:${BRAND.muted};font-size:12px;line-height:1.6;">
            You received this email because of activity on your NeuroOption account.
            If this wasn't you, please contact support immediately.<br>
            &copy; ${new Date().getFullYear()} NeuroOption &middot; <a href="https://www.neurooption.com" style="color:${BRAND.muted};">www.neurooption.com</a>
          </p>
        </td></tr>
      </table>
      <p style="margin:16px 0 0;font-family:Arial,Helvetica,sans-serif;color:#9aa3b2;font-size:11px;">Trading involves risk. Only trade with money you can afford to lose.</p>
    </td></tr>
  </table>
</body></html>`;
}

const heading = (t: string) =>
  `<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:${BRAND.ink};">${escapeHtml(t)}</h1>`;

const button = (href: string, label: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;"><tr>
     <td style="border-radius:8px;background:${BRAND.cyan};background-image:linear-gradient(135deg,${BRAND.cyan},${BRAND.purple});">
       <a href="${escapeHtml(href)}" style="display:inline-block;padding:13px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:8px;">${escapeHtml(label)}</a>
     </td></tr></table>`;

const notice = (html: string) =>
  `<p style="margin:20px 0 0;padding:14px 16px;background:${BRAND.soft};border-radius:8px;color:${BRAND.muted};font-size:13px;line-height:1.55;">${html}</p>`;

export interface TemplateOptions { logoSrc?: string; }

export function welcomeEmail(name: string, appUrl: string, opts: TemplateOptions = {}): MailContent {
  const n = escapeHtml(name);
  return {
    subject: 'Welcome to NeuroOption – your account is ready',
    html: layout('Your NeuroOption account has been created.', `
      ${heading(`Welcome aboard, ${n}!`)}
      <p style="margin:0 0 12px;">Your NeuroOption account has been created successfully.</p>
      <p style="margin:0;">Your demo account has been credited with <strong>$10,000</strong> in virtual funds so you can practise risk-free before trading live.</p>
      ${button(appUrl, 'Start trading')}
      <p style="margin:0;">Happy trading,<br><strong>The NeuroOption Team</strong></p>`, opts.logoSrc),
    text: `Welcome aboard, ${name}!\n\nYour NeuroOption account has been created successfully. Your demo account has been credited with $10,000 in virtual funds so you can practise risk-free.\n\nStart trading: ${appUrl}\n\nThe NeuroOption Team`,
  };
}

export function passwordResetCodeEmail(name: string, code: string, ttlMinutes: number, opts: TemplateOptions = {}): MailContent {
  const n = escapeHtml(name);
  const digits = escapeHtml(code).split('').map(d =>
    `<td style="width:44px;height:56px;background:${BRAND.soft};border:1px solid ${BRAND.border};border-radius:8px;font-family:'Courier New',Courier,monospace;font-size:30px;font-weight:bold;color:${BRAND.ink};text-align:center;vertical-align:middle;">${d}</td>`,
  ).join('<td style="width:8px;">&nbsp;</td>');
  return {
    subject: `${code} is your NeuroOption verification code`,
    html: layout(`Your password reset code is ${code}. It expires in ${ttlMinutes} minutes.`, `
      ${heading('Reset your password')}
      <p style="margin:0 0 4px;">Hi ${n},</p>
      <p style="margin:0;">Use this verification code to reset your NeuroOption password:</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:26px 0 10px;"><tr>${digits}</tr></table>
      <p style="margin:0 0 4px;color:${BRAND.muted};font-size:13px;">This code expires in <strong style="color:${BRAND.ink};">${ttlMinutes} minutes</strong> and can only be used once.</p>
      ${notice(`<strong style="color:${BRAND.ink};">Didn't request this?</strong> You can safely ignore this email – your password won't change. Never share this code with anyone, including NeuroOption staff.`)}`, opts.logoSrc),
    text: `Hi ${name},\n\nYour NeuroOption password reset verification code is:\n\n    ${code}\n\nThis code expires in ${ttlMinutes} minutes and can only be used once.\n\nIf you didn't request this, ignore this email – your password won't change. Never share this code with anyone.`,
  };
}

export function passwordChangedEmail(name: string, appUrl: string, opts: TemplateOptions = {}): MailContent {
  const n = escapeHtml(name);
  return {
    subject: 'Your NeuroOption password was changed',
    html: layout('The password for your NeuroOption account was just changed.', `
      ${heading('Password changed')}
      <p style="margin:0 0 12px;">Hi ${n},</p>
      <p style="margin:0 0 12px;">The password for your NeuroOption account was changed on <strong>${escapeHtml(new Date().toUTCString())}</strong>.</p>
      <p style="margin:0;">If you made this change, no further action is needed.</p>
      ${notice(`<strong style="color:${BRAND.ink};">Wasn't you?</strong> Reset your password immediately from the login page and contact support so we can secure your account.`)}
      ${button(appUrl, 'Go to NeuroOption')}`, opts.logoSrc),
    text: `Hi ${name},\n\nThe password for your NeuroOption account was just changed.\nIf you did not make this change, reset your password immediately and contact support.\n\n${appUrl}`,
  };
}

export function accountDeletedEmail(name: string, opts: TemplateOptions = {}): MailContent {
  const n = escapeHtml(name);
  return {
    subject: 'Your NeuroOption account has been deleted',
    html: layout('Your NeuroOption account has been permanently deleted.', `
      ${heading('Account deleted')}
      <p style="margin:0 0 12px;">Hi ${n},</p>
      <p style="margin:0 0 12px;">This confirms that your NeuroOption account and its associated personal data have been <strong>permanently deleted</strong> at your request.</p>
      <p style="margin:0;">We're sorry to see you go. You're welcome to create a new account at any time.</p>
      ${notice(`<strong style="color:${BRAND.ink};">Didn't request this?</strong> Contact support immediately.`)}`, opts.logoSrc),
    text: `Hi ${name},\n\nThis confirms that your NeuroOption account has been permanently deleted at your request.\nIf you did not request this, please contact support immediately.`,
  };
}
