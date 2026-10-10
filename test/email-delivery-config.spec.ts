/// <reference types="jest" />
import { EmailsService } from '../src/emails/emails.service';

const keys = ['EMAIL_PROVIDER','SMTP_SERVICE','SMTP_HOST','SMTP_USER','SMTP_PASS','SMTP_FROM','EMAIL_FROM','SMTP_ALLOW_VERIFIED_ALIAS','BREVO_API_KEY','RESEND_API_KEY'];
const old = Object.fromEntries(keys.map(k => [k, process.env[k]]));
afterEach(() => {
  for (const k of keys) {
    if (old[k] === undefined) delete process.env[k];
    else process.env[k] = old[k];
  }
  jest.restoreAllMocks();
});

describe('email provider setup and privacy', () => {
  it('selects explicitly requested SMTP instead of shadowing it with an old API key', async () => {
    Object.assign(process.env,{EMAIL_PROVIDER:'smtp',SMTP_SERVICE:'gmail',SMTP_USER:'sender@gmail.com',SMTP_PASS:'app pass',BREVO_API_KEY:'an-unused-key'});
    const email = new EmailsService() as any;
    expect(email.getProvider()).toBe('smtp');
    expect(email.getFromAddress()).toContain('sender@gmail.com');
    expect(email.getTransporterConfig().auth.pass).toBe('apppass');
  });

  it('does not claim a misconfigured requested provider is available', () => {
    Object.assign(process.env,{EMAIL_PROVIDER:'smtp',SMTP_USER:'sender@gmail.com',SMTP_PASS:'pass',BREVO_API_KEY:'a-key'});
    delete process.env.SMTP_SERVICE;
    delete process.env.SMTP_HOST;
    expect((new EmailsService() as any).getProvider()).toBe('none');
  });

  it('ignores unverified Gmail From alias by default', () => {
    Object.assign(process.env,{EMAIL_PROVIDER:'smtp',SMTP_SERVICE:'gmail',SMTP_USER:'sender@gmail.com',SMTP_PASS:'pass',EMAIL_FROM:'"NeuroOption" <another@example.com>'});
    expect((new EmailsService() as any).getFromAddress()).toContain('sender@gmail.com');
  });

  it('does not expose a reset code in email preheader', () => {
    const html = new EmailsService().passwordRecoveryCode('123456','Test').html || '';
    expect(html).toContain('123456');
    expect(html).not.toContain('Your NeuroOption verification code is 123456');
  });

  it('never reports email accepted when no provider is configured', async () => {
    for (const k of keys) delete process.env[k];
    const email = new EmailsService();
    expect(await email.sendAccountCreatedEmail('person@example.com','Test')).toBe(false);
  });
});
