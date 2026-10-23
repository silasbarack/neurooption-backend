import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('signals')
export class Signal {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() assetId: string;
  @Column() assetName: string;
  @Column({ type: 'varchar' }) direction: 'CALL' | 'PUT';
  @Column({ type: 'int' }) confidence: number;
  @Column() timeframe: string;
  @Column({ type: 'int' }) durationSeconds: number;
  @Column({ type: 'decimal', precision: 20, scale: 8 }) signalPrice: number;
  @Column({ type: 'jsonb' }) indicators: any;
  @Column({ type: 'jsonb', nullable: true }) reasons: string[];
  @Column({ nullable: true }) result?: 'win' | 'loss' | 'tie';
  @Column({ type: 'boolean', default: true }) isActive: boolean;
  @CreateDateColumn() createdAt: Date;
  @Column() expiresAt: Date;
}
