import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity('audit_logs')
@Index(['userId', 'action'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ nullable: true }) userId?: string;
  @Column() action: string;
  @Column({ type: 'jsonb', nullable: true }) data?: any;
  @Column({ nullable: true }) ipAddress?: string;
  @Column({ nullable: true }) userAgent?: string;
  @CreateDateColumn() createdAt: Date;
}
