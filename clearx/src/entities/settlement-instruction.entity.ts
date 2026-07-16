import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum SettlementStatus {
  GENERATED = 'GENERATED',
  SENT = 'SENT',
  EXECUTED = 'EXECUTED',
  FAILED = 'FAILED',
}

/**
 * SettlementInstruction represents a single net-settlement payment
 * instruction produced by the Settlement module for a given cycle,
 * to be sent to the relevant financial rails for execution.
 */
@Entity('settlement_instructions')
@Index(['tenantId', 'settlementCycleId'])
@Index(['tenantId', 'status'])
export class SettlementInstruction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'varchar', length: 128 })
  settlementCycleId: string;

  @Column({ type: 'date' })
  settlementDate: string;

  @Column({ type: 'varchar', length: 255 })
  debtorName: string;

  @Column({ type: 'varchar', length: 255 })
  debtorAccount: string;

  @Column({ type: 'varchar', length: 255 })
  creditorName: string;

  @Column({ type: 'varchar', length: 255 })
  creditorAccount: string;

  @Column({ type: 'decimal', precision: 18, scale: 3 })
  netAmount: string;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  /**
   * JSON-serialized breakdown of the transactions/cycles contributing to
   * this net amount, stored as text for portability across DB engines.
   */
  @Column({ type: 'text', nullable: true })
  breakdown: string | null;

  @Column({ type: 'enum', enum: SettlementStatus, default: SettlementStatus.GENERATED })
  status: SettlementStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  externalReference: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  filePath: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
