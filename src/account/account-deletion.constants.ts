/** Why people leave: suggested on the deletion screen, stored with the request. */
export const DELETION_REASONS = [
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
] as const;

export const DELETION_REASON_CODES: string[] = DELETION_REASONS.map((reason) => reason.code);

/** The word the person must type to confirm. */
export const DELETION_CONFIRMATION_WORD = 'DELETE';

/** Smaller balances cannot be withdrawn and count as empty. */
export const DUST = 0.01;
