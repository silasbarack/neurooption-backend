import { EmailsService } from './emails.service';
type BrevoEvent = {
    event?: unknown;
    'message-id'?: unknown;
    messageId?: unknown;
};
export declare class EmailWebhooksController {
    private readonly emails;
    constructor(emails: EmailsService);
    brevo(token: string | undefined, body: BrevoEvent | BrevoEvent[]): Promise<{
        received: number;
        matched: number;
    }>;
}
export {};
