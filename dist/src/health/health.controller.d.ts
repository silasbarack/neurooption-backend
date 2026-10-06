export declare class HealthController {
    check(): {
        status: string;
        service: string;
        database: string;
        smtp: string;
        timestamp: string;
    };
}
