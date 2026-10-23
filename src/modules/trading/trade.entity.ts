import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

export enum TradeDirection { CALL = 'CALL', PUT = 'PUT' }
export enum TradeStatus { OPEN = 'open', WIN = 'win', LOSS = 'loss', TIE = 'tie', CANCELLED = 'cancelled' }
export enum TradeMode { REAL = 'real', DEMO = 'demo' }

@Entity('trades')
@Index(['userId', 'status'])
@Index(['assetId', 'status'])
export class Trade {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column() assetId: string;
  @Column() assetName: string;
  @Column({ type: 'enum', enum: TradeDirection }) direction: TradeDirection;
  @Column({ type: 'enum', enum: TradeStatus, default: TradeStatus.OPEN }) status: TradeStatus;
  @Column({ type: 'enum', enum: TradeMode, default: TradeMode.DEMO }) mode: TradeMode;
  @Column({ type: 'decimal', precision: 20, scale: 8 }) amount: number;
  @Column({ type: 'decimal', precision: 5, scale: 2 }) payout: number;
  @Column({ type: 'decimal', precision: 20, scale: 8 }) openPrice: number;
  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true }) closePrice?: number;
  @Column({ type: 'int' }) durationSeconds: number;
  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 }) profitLoss: number;
  @Column() expiresAt: Date;
  @Column({ nullable: true }) signalId?: string;
  @Column({ type: 'jsonb', nullable: true }) metadata?: any;
  @CreateDateColumn() createdAt: Date;
  @Column({ nullable: true }) closedAt?: Date;
}
