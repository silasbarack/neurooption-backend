import { Body, Controller, ForbiddenException, HttpCode, NotFoundException, Post, Query } from '@nestjs/common';
import { timingSafeEqual } from 'node:crypto';

import { EmailsService } from './emails.service';

type BrevoEvent = { event?: unknown; 'message-id'?: unknown; messageId?: unknown };

/**
 * Delivery events from Brevo (delivered, bounces, spam complaints).
 * Brevo transactional webhooks are not signed, so the URL carries a long
 * random secret: https://<backend>/emails/webhooks/brevo?token=<BREVO_WEBHOOK_TOKEN>
 */
@Controller('emails/webhooks')
export class EmailWebhooksController {
  constructor(private readonly emails: EmailsService) {}

  @Post('brevo')
  @HttpCode(200)
  async brevo(@Query('token') token: string | undefined, @Body() body: BrevoEvent | BrevoEvent[]) {
    const expected = (process.env.BREVO_WEBHOOK_TOKEN || '').trim();
    if (expected.length < 24) throw new NotFoundException();
    const given = Buffer.from(String(token || ''));
    const wanted = Buffer.from(expected);
    if (given.length !== wanted.length || !timingSafeEqual(given, wanted)) throw new ForbiddenException();

    const events = (Array.isArray(body) ? body : [body]).slice(0, 100);
    let matched = 0;
    for (const item of events) {
      const event = typeof item?.event === 'string' ? item.event : '';
      const id = typeof item?.['message-id'] === 'string' ? item['message-id'] : typeof item?.messageId === 'string' ? item.messageId : '';
      if (event && id && (await this.emails.applyProviderEvent(event, id.slice(0, 300)))) matched += 1;
    }
    return { received: events.length, matched };
  }
}
