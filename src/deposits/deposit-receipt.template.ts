/** Branded, transactional deposit receipt; never render for PENDING payments. */
export interface DepositReceiptData {
  fullName: string;
  amount: number;
  currency: string;
  method: string;
  transactionId: string;
  depositId: string;
  paymentReference?: string | null;
  completedAt: Date;
}
type ReceiptTemplate = { subject: string; body: string; html: string };
const LOGO = '__NEUROOPTION_LOGO_SRC__';
const URL = 'https://neurooption-frontend.onrender.com';
function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
export function depositReceiptTemplate(data: DepositReceiptData): ReceiptTemplate {
  const amount = data.currency.toUpperCase() + ' ' + data.amount.toLocaleString('en-KE', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
  const completed = data.completedAt.toLocaleString('en-KE', {
    timeZone: 'Africa/Nairobi', dateStyle: 'long', timeStyle: 'medium',
  }) + ' EAT';
  const rows: [string, string][] = [
    ['Payment status', 'Completed'],
    ['Amount credited', amount],
    ['Payment method', data.method],
    ['Date and time', completed],
    ['Transaction ID', data.transactionId],
    ['Deposit ID', data.depositId],
    ...(data.paymentReference ? [['Payment reference', data.paymentReference] as [string, string]] : []),
  ];
  const subject = 'NeuroOption | Your deposit of ' + amount + ' is confirmed';
  const textDetails = rows.map(([k, v]) => k + ': ' + v).join('\n');
  const body = [
    'Hello ' + data.fullName + ',',
    'Your deposit was successfully processed and ' + amount +
      ' has been credited to your NeuroOption trading account.',
    textDetails,
    'Review your Finance history: ' + URL + '/finance?tab=history',
    'If you did not recognize this payment, contact Support immediately. ' +
      'Never disclose your password, M-Pesa PIN, or one-time verification codes.',
    'This is a transaction confirmation, not a tax invoice.',
    'The NeuroOption Team',
  ].join('\n\n');
  const rowHtml = rows.map(([label, value]) =>
    '<tr><td style="padding:12px 8px;border-bottom:1px solid #dce7ef;color:#526579;">' +
    escapeHtml(label) + '</td><td style="padding:12px 8px;border-bottom:1px solid #dce7ef;color:#182b43;text-align:right;font-weight:600;word-break:break-word;">' +
    escapeHtml(value) + '</td></tr>'
  ).join('');
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px 12px;background:#f6f9fc;font-family:Arial,Helvetica,sans-serif;color:#182b43;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #dce7ef;border-radius:16px;">
<tr><td height="4" style="background:#0879ad;"></td></tr>
<tr><td align="center" style="padding:26px 18px 22px;border-bottom:1px solid #dce7ef;">
<a href="${URL}" style="text-decoration:none;"><img src="${LOGO}" alt="NeuroOption" width="200" height="149" style="display:block;max-width:100%;height:auto;border:0;margin:auto;"></a>
</td></tr>
<tr><td style="padding:30px 28px;">
<p style="font-size:12px;font-weight:700;letter-spacing:1px;color:#0879ad;margin:0 0 12px;">PAYMENT CONFIRMATION</p>
<h1 style="font-size:27px;color:#0d315e;line-height:1.25;margin:0 0 16px;">Your deposit was successful</h1>
<p style="line-height:1.65;">Hello ${escapeHtml(data.fullName)},</p>
<p style="line-height:1.65;">We've verified the payment and credited your NeuroOption account.</p>
<div style="padding:20px;border:1px solid #dce7ef;border-left:4px solid #17adb4;border-radius:10px;background:#f6f9fc;margin:20px 0;">
<div style="font-size:12px;color:#526579;">AMOUNT CREDITED</div>
<div style="font-size:28px;font-weight:700;color:#0d315e;margin-top:8px;">${escapeHtml(amount)}</div>
<div style="margin-top:10px;color:#0b6e47;font-weight:700;">&#10003; Payment completed</div></div>
<h2 style="font-size:18px;color:#0d315e;margin:26px 0 10px;">Transaction details</h2>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-size:13px;">${rowHtml}</table>
<p style="margin:30px 0;text-align:center;"><a href="${URL}/finance?tab=history" style="display:inline-block;background:#0879ad;color:#fff;text-decoration:none;border-radius:8px;padding:13px 20px;font-weight:700;">View transaction history</a></p>
<div style="padding:14px 16px;background:#e7f3f9;border-radius:8px;line-height:1.6;font-size:13px;"><strong>Security notice:</strong> If you didn't authorize this deposit, contact Support immediately. Never share your password, payment PIN or verification codes.</div>
<p style="color:#526579;font-size:12px;line-height:1.6;margin:18px 0 0;">This email confirms a completed transaction and is not a tax invoice.</p>
</td></tr>
<tr><td style="padding:20px 28px;background:#f6f9fc;color:#526579;font-size:12px;line-height:1.6;">NeuroOption Account Notifications &bull; <a href="${URL}/help" style="color:#0879ad;">Support Center</a><br>&copy; ${new Date().getFullYear()} NeuroOption. All rights reserved.</td></tr>
</table></body></html>`;
  return { subject, body, html };
}
