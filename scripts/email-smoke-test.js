/**
 * Explicit outbound-mail smoke test. Run only with a mailbox you control.
 *   EMAIL_TEST_TO=you@example.com npm run email:smoke
 * Uses the same provider selection and branding as production.
 * No account is created, changed or deleted.
 */
require('dotenv').config();
const nodemailer = require('nodemailer');

const env = (key) => String(process.env[key] || '').trim();
const recipient = env('EMAIL_TEST_TO');
const sender = env('EMAIL_FROM') || env('SMTP_FROM') ||
  `"NeuroOption" <${env('SMTP_USER') || 'no-reply@neurooption.com'}>`;
const match = sender.match(/<([^>]+)>/);
const fromEmail = match ? match[1] : sender;
const subject = 'NeuroOption email delivery smoke test';
const body = `NeuroOption email delivery test at ${new Date().toISOString()}. This is a test; no account was changed.`;
if (!recipient || !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(recipient)) {
  console.error('Set EMAIL_TEST_TO to a real mailbox you control.');
  process.exit(2);
}
const timeout = AbortSignal.timeout(15000);
async function api(url, headers, payload) {
  const response = await fetch(url, {
    method: 'POST', headers: { 'Content-Type':'application/json', ...headers },
    body: JSON.stringify(payload), signal: timeout
  });
  if (!response.ok) throw Error(`Provider returned HTTP ${response.status}: ${(await response.text()).slice(0,300)}`);
}
(async () => {
  let provider;
  if (env('BREVO_API_KEY')) {
    provider = 'Brevo HTTPS';
    await api('https://api.brevo.com/v3/smtp/email', {'api-key': env('BREVO_API_KEY')}, {
      sender: {name:'NeuroOption',email:fromEmail}, to:[{email:recipient}],subject,
      textContent:body,htmlContent:`<p>${body}</p>`
    });
  } else if (env('RESEND_API_KEY')) {
    provider = 'Resend HTTPS';
    await api('https://api.resend.com/emails', {Authorization:`Bearer ${env('RESEND_API_KEY')}`}, {
      from:sender,to:[recipient],subject,text:body,html:`<p>${body}</p>`
    });
  } else if (env('SMTP_USER') && env('SMTP_PASS') && (env('SMTP_SERVICE') || env('SMTP_HOST'))) {
    provider = 'SMTP';
    const host = env('SMTP_HOST'),service = env('SMTP_SERVICE');
    const port = Number(env('SMTP_PORT') || 587);
    const config = {
      auth:{user:env('SMTP_USER'),pass:/gmail/i.test(service||host) ? env('SMTP_PASS').replace(/\\s+/g,'') : env('SMTP_PASS')},
      connectionTimeout:10000,greetingTimeout:10000,socketTimeout:20000,
      tls:{rejectUnauthorized:env('SMTP_REJECT_UNAUTHORIZED') !== 'false'}
    };
    if(host) Object.assign(config,{host,port,secure:env('SMTP_SECURE') ? env('SMTP_SECURE') === 'true':port===465,requireTLS:port!==465});
    else config.service = service;
    const transport=nodemailer.createTransport(config);
    try {
      await transport.verify();
      const receipt=await transport.sendMail({from:sender,to:recipient,subject,text:body});
      if(!receipt.accepted.some(a=>a.toLowerCase()===recipient.toLowerCase())) throw Error('Recipient not accepted by SMTP');
    } finally { transport.close(); }
  } else throw Error('Configure Brevo, Resend or SMTP credentials first.');
  console.log(`PASS: ${provider} accepted a test message addressed to ${recipient}.`);
  console.log('Provider acceptance is NOT proof of final inbox delivery; check Inbox and Spam.');
})().catch(error => { console.error('FAIL: '+error.message);process.exitCode=1; });
