import { Body, Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { Request } from 'express';

import { NewsletterService } from './newsletter.service';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletter: NewsletterService) {}

  @Post('subscribe')
  @HttpCode(200)
  subscribe(@Body() body: { email?: string; source?: string }, @Req() req: Request) {
    // Render sits behind a proxy: the client address is the first X-Forwarded-For entry.
    const forwarded = req.headers['x-forwarded-for'];
    const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0]?.trim() || req.ip || '';
    return this.newsletter.subscribe(body, ip);
  }

  @Post('unsubscribe')
  @HttpCode(200)
  unsubscribe(@Body() body: { token?: string }) {
    return this.newsletter.unsubscribe(body);
  }
}
