/// <reference types="jest" />
import * as nodemailer from 'nodemailer';
import { EmailsService } from '../src/emails/emails.service';

describe('account email contents and acceptance', () => {
  it('includes a detailed deletion receipt and escapes user-provided feedback in HTML', () => {
    const email = new EmailsService();
    const receipt = email.accountDeleted('Test <Trader>', {
      email: 'receipt@example.test', reference: 'NO-RECEIPT-TEST',
      deletedAt: new Date('2026-10-09T12:00:00Z'), reason: 'Other: <script>feedback</script>',
    });
    for (const value of ['receipt@example.test', 'NO-RECEIPT-TEST', 'October', 'Africa/Nairobi', 'Records that may be retained']) {
      expect(receipt.body).toContain(value);
      expect(receipt.html).toContain(value);
    }
    expect(receipt.body).toContain('Other: <script>feedback</script>');
    expect(receipt.html).toContain('&lt;script&gt;feedback&lt;/script&gt;');
    expect(receipt.html).not.toContain('<script>feedback</script>');
    expect(receipt.body).toContain('existing sessions have ended');
    expect(receipt.body).toContain('KYC, support and security records');
    expect(receipt.body).toContain('cannot be restored');
  });

  it('does not report SMTP delivery when the server accepts no recipients', async () => {
    const keys = ['BREVO_API_KEY','RESEND_API_KEY','SMTP_HOST','SMTP_SERVICE','SMTP_USER','SMTP_PASS'];
    const prior = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
    Object.assign(process.env, { BREVO_API_KEY: '', RESEND_API_KEY: '', SMTP_SERVICE: '',
      SMTP_HOST: 'smtp.example.test', SMTP_USER: 'test', SMTP_PASS: 'synthetic-password' });
    const transport = jest.spyOn(nodemailer, 'createTransport').mockReturnValue({
      sendMail: jest.fn().mockResolvedValue({ accepted: [] }),
    } as unknown as ReturnType<typeof nodemailer.createTransport>);
    try {
      const email = new EmailsService();
      expect(await email.sendTemplateEmail('recipient@example.test', email.passwordChanged('Test'))).toBe(false);
    } finally {
      transport.mockRestore();
      for (const key of keys) {
        if (prior[key] === undefined) delete process.env[key]; else process.env[key] = prior[key];
      }
    }
  });
});
