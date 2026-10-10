import { ServiceUnavailableException } from '@nestjs/common';

/**
 * Demo-only mode is mandatory until audited transaction processing and legal
 * authorization have been approved. Configuration cannot silently enable it.
 */
export function requireRealMoneyAuthorization(): never {
  throw new ServiceUnavailableException('Real-money transactions are not available.');
}

export function assertDemoOnlyAccount(accountType: string): void {
  if (accountType === 'QT Real') requireRealMoneyAuthorization();
}
