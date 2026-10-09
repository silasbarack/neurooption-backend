/// <reference types="jest" />
import { createServer, Socket } from 'net';
import { AddressInfo } from 'net';
import { EmailsService } from '../src/emails/emails.service';

// A loopback-only SMTP sink with synthetic credentials and recipients.
// No provider API or external inbox is contacted.
describe('account email delivery over SMTP', () => {
  it('receives all four branded account messages with a company sender and reply address', async () => {
    const messages: Array<{ from: string; to: string[]; raw: string }> = [];
    const sockets = new Set<Socket>();
    const server = createServer((socket) => {
      sockets.add(socket);
      socket.on('close', () => sockets.delete(socket));
      let buffer = '';
      let inData = false;
      let from = '';
      let to: string[] = [];
      socket.write('220 localhost test SMTP\r\n');
      socket.on('data', (chunk) => {
        buffer += chunk.toString();
        for (;;) {
          if (inData) {
            const end = buffer.indexOf('\r\n.\r\n');
            if (end < 0) break;
            messages.push({ from, to: [...to], raw: buffer.slice(0, end).replace(/^\.\./gm, '.') });
            buffer = buffer.slice(end + 5); inData = false;
            socket.write('250 Message accepted\r\n');
            continue;
          }
          const end = buffer.indexOf('\r\n');
          if (end < 0) break;
          const line = buffer.slice(0, end); buffer = buffer.slice(end + 2);
          if (/^EHLO/i.test(line)) socket.write('250-localhost\r\n250 AUTH PLAIN\r\n');
          else if (/^HELO/i.test(line)) socket.write('250 localhost\r\n');
          else if (/^AUTH PLAIN /i.test(line)) {
            const credentials = Buffer.from(line.slice(11), 'base64').toString();
            socket.write(credentials === '\0smtp-test-user\0smtp-test-password' ? '235 Authenticated\r\n' : '535 Authentication failed\r\n');
          } else if (/^MAIL FROM:/i.test(line)) {
            from = line.match(/<([^>]+)>/)?.[1] || ''; to = [];
            socket.write('250 Sender accepted\r\n');
          } else if (/^RCPT TO:/i.test(line)) {
            to.push(line.match(/<([^>]+)>/)?.[1] || '');
            socket.write('250 Recipient accepted\r\n');
          } else if (/^DATA$/i.test(line)) {
            inData = true; socket.write('354 End with dot\r\n');
          } else if (/^QUIT$/i.test(line)) socket.end('221 Bye\r\n');
          else if (/^RSET$/i.test(line)) { from = ''; to = []; socket.write('250 Reset\r\n'); }
          else socket.write('250 OK\r\n');
        }
      });
    });
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject); server.listen(0, '127.0.0.1', resolve);
    });
    const overrides: Record<string, string> = {
      BREVO_API_KEY: '', RESEND_API_KEY: '', SMTP_SERVICE: '', SMTP_HOST: '127.0.0.1',
      SMTP_PORT: String((server.address() as AddressInfo).port), SMTP_SECURE: 'false',
      SMTP_USER: 'smtp-test-user', SMTP_PASS: 'smtp-test-password',
      EMAIL_FROM: '"NeuroOption" <company@example.test>', EMAIL_REPLY_TO: 'support@example.test',
      FRONTEND_URL: 'https://frontend.example.test',
    };
    const prior = Object.fromEntries(Object.keys(overrides).map((key) => [key, process.env[key]]));
    Object.assign(process.env, overrides);
    try {
      const email = new EmailsService();
      const templates = [
        email.accountCreated('recipient@example.test', 'Test Trader'),
        email.passwordRecoveryCode('123456', 'Test Trader'),
        email.passwordChanged('Test Trader'),
        email.accountDeletionConfirmed({ fullName: 'Test Trader',
          email: 'recipient@example.test', reference: 'NO-LOCAL-SMTP-TEST',
          deletedAt: new Date('2026-10-09T12:00:00Z'), reasonLabel: 'I no longer use NeuroOption',
        }),
      ];
      for (const template of templates) {
        expect(await email.sendTemplateEmail('recipient@example.test', template)).toBe(true);
      }
      expect(messages).toHaveLength(4);
      for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        const decoded = message.raw.replace(/=\r?\n/g, '').replace(/=([0-9A-F]{2})/gi,
          (_, hex) => String.fromCharCode(parseInt(hex, 16)));
        expect(message.from).toBe('company@example.test');
        expect(message.to).toEqual(['recipient@example.test']);
        expect(message.raw).toContain('From: NeuroOption <company@example.test>');
        expect(message.raw).toContain('Reply-To: support@example.test');
        expect(message.raw).toContain('Subject: ' + templates[i].subject);
        expect(message.raw).toContain('Content-Type: text/plain');
        expect(message.raw).toContain('Content-Type: text/html');
        expect(decoded).toContain('<html');
        expect(decoded).not.toContain('smtp-test-password');
      }
      const rawDeletion = messages[3].raw.replace(/=\r?\n/g, '');
      expect(rawDeletion).toContain('NO-LOCAL-SMTP-TEST');
      expect(rawDeletion).toContain('What we keep, and why');
      expect(messages[1].raw).toContain('123456');
    } finally {
      for (const key of Object.keys(overrides)) {
        if (prior[key] === undefined) delete process.env[key]; else process.env[key] = prior[key];
      }
      for (const socket of sockets) socket.destroy();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });
});
