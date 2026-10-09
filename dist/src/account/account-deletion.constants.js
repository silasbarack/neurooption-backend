"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DUST = exports.DELETION_CONFIRMATION_WORD = exports.DELETION_REASON_CODES = exports.DELETION_REASONS = void 0;
exports.DELETION_REASONS = [
    { code: 'NOT_TRADING', label: "I'm no longer trading" },
    { code: 'SWITCHING', label: "I'm switching to another platform" },
    { code: 'SAFETY', label: "I'm worried about my data or the safety of my money" },
    { code: 'PAYMENTS', label: 'I had a problem with a deposit or withdrawal' },
    { code: 'EXPECTATIONS', label: "Payouts or trading conditions weren't what I expected" },
    { code: 'FINANCES', label: 'I want to stop trading to protect my finances' },
    { code: 'USABILITY', label: 'The platform is hard to use' },
    { code: 'DUPLICATE', label: 'I have another NeuroOption account' },
    { code: 'BREAK', label: "I'm taking a break and may come back" },
    { code: 'OTHER', label: 'Another reason' },
];
exports.DELETION_REASON_CODES = exports.DELETION_REASONS.map((reason) => reason.code);
exports.DELETION_CONFIRMATION_WORD = 'DELETE';
exports.DUST = 0.01;
//# sourceMappingURL=account-deletion.constants.js.map