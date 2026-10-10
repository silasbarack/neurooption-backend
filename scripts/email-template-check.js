/** Offline template and sender checks (never connects to SMTP). Run after npm run build. */
require('dotenv').config();
const assert = require('node:assert/strict');

const { EmailsService } = require('../dist/src/emails/emails.service');
const old = {
  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER,
  SMTP_SERVICE: process.env.SMTP_SERVICE,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM,
};
try {
  process.env.EMAIL_PROVIDER = 'smtp';
  process.env.SMTP_SERVICE = 'gmail';
  delete process.env.SMTP_HOST;
  process.env.SMTP_USER = 'silasbarack5@gmail.com';
  process.env.SMTP_PASS = 'NOT_A_REAL_CREDENTIAL';
  process.env.EMAIL_FROM = '"NeuroOption" <silasbarack5@gmail.com>';

  const emails = new EmailsService();
  emails.assertRequiredSender();

  const welcome = emails.accountCreated('sample@example.com', 'Test Customer');
  const reset = emails.passwordRecoveryCode('123456', 'Test Customer');
  const changed = emails.passwordChanged('Test Customer');
  const deleted = emails.accountDeletionConfirmed({
    email: 'sample@example.com',
    fullName: 'Test Customer',
    reference: 'DEL-TEST1234',
    deletedAt: new Date('2026-10-10T06:00:00Z'),
    reasonLabel: 'I no longer need my account',
  });
  for (const [name, template] of Object.entries({ welcome, reset, changed, deleted })) {
    assert.ok(template.subject.startsWith('Welcome') || template.subject.startsWith('Your NeuroOption'));
    assert.ok(template.body && template.html, name + ' needs text and HTML');
    assert.ok(template.html.includes('NeuroOption'), name + ' missing brand');
  }
  assert.ok(reset.body.includes('123456'));
  assert.ok(reset.body.includes('10 minutes'));
  assert.ok(deleted.body.includes('DEL-TEST1234'));
  assert.ok(deleted.body.includes('I no longer need my account'));
  assert.ok(deleted.body.includes('UTC'));
  assert.ok(deleted.body.includes('EAT'));
  assert.ok(deleted.body.includes('What we keep'));
  assert.ok(emails.getFromAddress().includes('silasbarack5@gmail.com'));

  process.env.SMTP_USER = 'wrong@example.com';
  assert.throws(() => emails.assertRequiredSender(), /must be configured/);

  console.log('PASS: transactional HTML/text templates and required Gmail sender');
  console.log('No network requests or actual emails were sent.');
} finally {
  for (const [key, value] of Object.entries(old)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}
