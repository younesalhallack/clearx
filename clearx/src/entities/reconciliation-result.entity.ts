import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { UnifiedTransaction } from './unified-transaction.entity';

export enum ReconciliationStatus {
  MATCHED = 'MATCHED',
  PARTIAL_MATCH = 'PARTIAL_MATCH',
  DISCREPANCY_AMOUNT = 'DISCREPANCY_AMOUNT',
  DISCREPANCY_MISSING = 'DISCREPANCY_MISSING',
  MANUALLY_MATCHED = 'MANUALLY_MATCHED',
}

/**
 * ReconciliationResult captures the outcome of comparing two (or one
 * unmatched) UnifiedTransaction records during a reconciliation cycle.
 */
@Entity('reconciliation_results')
@Index(['tenantId', 'status'])
export class ReconciliationResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'uuid' })
  transactionAId: string;

  @ManyToOne(() => UnifiedTransaction, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'transactionAId' })
  transactionA: UnifiedTransaction;

  @Column({ type: 'uuid', nullable: true })
  transactionBId: string | null;

  @ManyToOne(() => UnifiedTransaction, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'transactionBId' })
  transactionB: UnifiedTransaction | null;

  @Column({ type: 'enum', enum: ReconciliationStatus })
  status: ReconciliationStatus;

  @Column({ type: 'decimal', precision: 18, scale: 3, default: 0 })
  amountDifference: string;

  @Column({ type: 'varchar', length: 3, nullable: true })
  differenceCurrency: string | null;

  @Column({ type: 'varchar', length: 64, default: 'SYSTEM' })
  matchedBy: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
