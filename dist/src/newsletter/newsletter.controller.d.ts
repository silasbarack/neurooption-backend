import type { Request } from 'express';
import { NewsletterService } from './newsletter.service';
export declare class NewsletterController {
    private readonly newsletter;
    constructor(newsletter: NewsletterService);
    subscribe(body: {
        email?: string;
        source?: string;
    }, req: Request): Promise<{
        success: boolean;
        message: string;
    }>;
    unsubscribe(body: {
        token?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
}
