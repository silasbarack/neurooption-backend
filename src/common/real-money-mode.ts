import { ServiceUnavailableException } from '@nestjs/common';

/**
 * Demo-only by default. Real-money availability requires legal and technical
 * review, not merely an environment variable toggle.
 */
export function requireRealMoneyAuthorization(): never {
  throw new ServiceUnavailableException('Real-money transactions are not available.');
}
