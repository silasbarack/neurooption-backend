import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';

export enum UserRole { TRADER = 'trader', ADMIN = 'admin', AFFILIATE = 'affiliate' }
export enum KycStatus { PENDING = 'pending', VERIFIED = 'verified', REJECTED = 'rejected' }

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) email: string;
  @Column() passwordHash: string;
  @Column() name: string;
  @Column({ nullable: true }) phone?: string;
  @Column({ nullable: true }) country?: string;
  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 }) balance: number;
  @Column({ type: 'decimal', precision: 20, scale: 8, default: 10000 }) demoBalance: number;
  @Column({ type: 'enum', enum: UserRole, default: UserRole.TRADER }) role: UserRole;
  @Column({ type: 'enum', enum: KycStatus, default: KycStatus.PENDING }) kycStatus: KycStatus;
  @Column({ nullable: true }) referralCode?: string;
  @Column({ nullable: true }) referredBy?: string;
  @Column({ nullable: true }) avatarUrl?: string;
  @Column({ default: false }) twoFactorEnabled: boolean;
  @Column({ nullable: true }) twoFactorSecret?: string;
  @Column({ type: 'int', default: 0 }) totalTrades: number;
  @Column({ type: 'int', default: 0 }) winTrades: number;
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }) totalPnl: number;
  @Column({ nullable: true }) lastLoginAt?: Date;
  @Column({ default: true }) isActive: boolean;
  @Column({ default: false }) isPublicTrader: boolean;
  @Column({ nullable: true }) bio?: string;
  @Column({ nullable: true, select: false }) resetCodeHash?: string;
  @Column({ nullable: true, select: false }) resetCodeExpiresAt?: Date;
  @Column({ type: 'int', default: 0, select: false }) resetCodeAttempts: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
