import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum TxType { DEPOSIT = 'deposit', WITHDRAWAL = 'withdrawal', TRADE_WIN = 'trade_win', TRADE_LOSS = 'trade_loss', BONUS = 'bonus', REFUND = 'refund' }
export enum TxStatus { PENDING = 'pending', PROCESSING = 'processing', COMPLETED = 'completed', FAILED = 'failed', CANCELLED = 'cancelled' }
export { TxType as TransactionType, TxStatus as TransactionStatus };
export enum PaymentMethod { CARD = 'card', CRYPTO = 'crypto', SKRILL = 'skrill', NETELLER = 'neteller', PERFECT_MONEY = 'perfect_money', BANK_WIRE = 'bank_wire', NOWPAYMENTS = 'nowpayments' }

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete:'CASCADE' })
  user: User;

  @Column()
  userId: string;

  @Column({ type:'enum', enum: TxType })
  type: TxType;

  @Column({ type:'enum', enum: TxStatus, default: TxStatus.PENDING })
  status: TxStatus;

  @Column({ type:'enum', enum: PaymentMethod, nullable:true })
  paymentMethod: PaymentMethod;

  @Column({ type:'decimal', precision:20, scale:8 })
  amount: number;

  @Column({ type:'decimal', precision:20, scale:8, default:0 })
  fee: number;

  @Column({ default:'USD' })
  currency: string;

  @Column({ nullable:true })
  cryptoCurrency: string;

  @Column({ nullable:true })
  cryptoAmount: string;

  @Column({ nullable:true })
  walletAddress: string;

  @Column({ nullable:true })
  txHash: string;

  @Column({ nullable:true })
  externalId: string;

  @Column({ nullable:true })
  gatewayResponse: string;

  @Column({ nullable:true })
  notes: string;

  @Column({ nullable:true })
  processedAt: Date;

  @Column({ type:'decimal', precision:20, scale:8, nullable:true })
  balanceBefore: number;

  @Column({ type:'decimal', precision:20, scale:8, nullable:true })
  balanceAfter: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
