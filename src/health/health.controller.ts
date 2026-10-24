import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    const databaseConfigured = Boolean(process.env.DATABASE_URL?.trim());
    const smtpConfigured = Boolean(
      process.env.SMTP_USER?.trim() &&
      process.env.SMTP_PASS?.trim() &&
      (process.env.SMTP_SERVICE?.trim() || process.env.SMTP_HOST?.trim()),
    );

    return {
      status: databaseConfigured ? 'ok' : 'degraded',
      service: 'neurooption-backend',
      database: databaseConfigured ? 'configured' : 'missing',
      smtp: smtpConfigured ? 'configured' : 'missing',
      timestamp: new Date().toISOString(),
    };
  }
}
