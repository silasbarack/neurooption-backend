import { Request } from 'express';
import { UserRole } from '@prisma/client';

export type AuthenticatedRequest = Request & { user: { id: string; role: UserRole } };
