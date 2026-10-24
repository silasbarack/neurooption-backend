import { ServiceUnavailableException } from '@nestjs/common';

/**
 * Real-money flows (M-Pesa deposits, withdrawal requests and real-account
 * trades) are on. Set REAL_MONEY_DISABLED=true to switch them all off at
 * once without a deploy, e.g. during an incident.
 */
export function realMoneyEnabled(): boolean {
  return (process.env.REAL_MONEY_DISABLED || '').trim().toLowerCase() !== 'true';
}

export function requireRealMoneyAuthorization(): void {
  if (!realMoneyEnabled()) {
    throw new ServiceUnavailableException('Real-money transactions are not available.');
  }
}

export function assertAccountTypeAllowed(accountType: string): void {
  if (accountType === 'QT Real') requireRealMoneyAuthorization();
}
