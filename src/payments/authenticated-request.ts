import type { Request } from 'express';

/** Request after JwtAuthGuard: `user` is the signed-in user record. */
export type AuthenticatedRequest = Request & { user: { id: string; role?: string } };
