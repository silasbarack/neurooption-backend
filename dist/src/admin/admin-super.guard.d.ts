import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class AdminSuperGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
