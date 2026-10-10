/**
 * Run on the actual hosting environment with one mailbox you control:
 *   EMAIL_TEST_TO=your-address@example.com npm run email:smoke
 * Uses the exact same provider selection, sender, transport and branded
 * template that registration, recovery and deletion use.
 * Does not create users or change account records.
 */
require('dotenv').config();
const recipient = String(process.env.EMAIL_TEST_TO || '').trim();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
  console.error('Set EMAIL_TEST_TO to a valid mailbox you control.');
  process.exit(2);
}
(async () => {
  let EmailsService;
  try {
    ({ EmailsService } = require('../dist/src/emails/emails.service'));
  } catch (_) {
    throw new Error('Build the backend first: npm run build');
  }
  const service = new EmailsService();
  const provider = await service.verifyDeliveryConfiguration(true);
  const accepted = await service.sendDeliveryTestEmail(recipient);
  if (!accepted) throw new Error('Provider did not accept the test email. Inspect server logs.');
  console.log('PASS: ' + provider + ' accepted a branded message for the designated test inbox.');
  console.log('Confirm receipt in Inbox and Spam. Acceptance is not proof of delivery.');
})().catch((error) => {
  console.error('FAIL: ' + String(error.message || error).slice(0,250));
  process.exitCode = 1;
});
