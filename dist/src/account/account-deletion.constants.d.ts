export declare const DELETION_REASONS: readonly [{
    readonly code: "NOT_TRADING";
    readonly label: "I'm no longer trading";
}, {
    readonly code: "SWITCHING";
    readonly label: "I'm switching to another platform";
}, {
    readonly code: "SAFETY";
    readonly label: "I'm worried about my data or the safety of my money";
}, {
    readonly code: "PAYMENTS";
    readonly label: "I had a problem with a deposit or withdrawal";
}, {
    readonly code: "EXPECTATIONS";
    readonly label: "Payouts or trading conditions weren't what I expected";
}, {
    readonly code: "FINANCES";
    readonly label: "I want to stop trading to protect my finances";
}, {
    readonly code: "USABILITY";
    readonly label: "The platform is hard to use";
}, {
    readonly code: "DUPLICATE";
    readonly label: "I have another NeuroOption account";
}, {
    readonly code: "BREAK";
    readonly label: "I'm taking a break and may come back";
}, {
    readonly code: "OTHER";
    readonly label: "Another reason";
}];
export declare const DELETION_REASON_CODES: string[];
export declare const DELETION_CONFIRMATION_WORD = "DELETE";
export declare const DUST = 0.01;
