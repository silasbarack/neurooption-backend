import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export enum PaymentType { DEPOSIT = 'deposit', WITHDRAWAL = 'withdrawal' }
export enum PaymentStatus { PENDING = 'pending', PROCESSING = 'processing', COMPLETED = 'completed', FAILED = 'failed', CANCELLED = 'cancelled' }
export enum PaymentMethod { STRIPE = 'stripe', CRYPTO = 'crypto', BANK_WIRE = 'bank_wire', SKRILL = 'skrill', NETELLER = 'neteller', PERFECT_MONEY = 'perfect_money' }

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column({ type: 'enum', enum: PaymentType }) type: PaymentType;
  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING }) status: PaymentStatus;
  @Column({ type: 'enum', enum: PaymentMethod }) method: PaymentMethod;
  @Column({ type: 'decimal', precision: 20, scale: 2 }) amount: number;
  @Column({ default: 'USD' }) currency: string;
  @Column({ nullable: true }) txHash?: string;
  @Column({ nullable: true }) externalId?: string;
  @Column({ type: 'jsonb', nullable: true }) metadata?: any;
  @Column({ nullable: true }) walletAddress?: string;
  @Column({ nullable: true }) failureReason?: string;
  @Column({ nullable: true }) processedAt?: Date;
  @CreateDateColumn() createdAt: Date;
}
