import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum PaymentMethod {
  CARD = 'CARD',
  EBPP = 'EBPP',
  BANK_TRANSFER = 'BANK_TRANSFER',
  WALLET = 'WALLET',
  DIRECT_DEBIT = 'DIRECT_DEBIT',
}

export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  MATCHED = 'MATCHED',
  UNMATCHED = 'UNMATCHED',
  DISCREPANCY = 'DISCREPANCY',
  IGNORED = 'IGNORED',
}

export enum TransactionSource {
  POS = 'POS',
  ECOM = 'ECOM',
  ATM = 'ATM',
  BANK_FILE = 'BANK_FILE',
  SWITCH = 'SWITCH',
  PSP = 'PSP',
  BILLING_SYSTEM = 'BILLING_SYSTEM',
}

/**
 * UnifiedTransaction is the canonical, normalized representation of a
 * transaction record regardless of its original source file/schema. Every
 * raw record ingested through the Normalization module is mapped into this
 * shape before entering the matching engine.
 */
@Entity('unified_transactions')
@Index(['tenantId', 'primaryMatchKey'])
@Index(['tenantId', 'status'])
@Index(['tenantId', 'source'])
export class UnifiedTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  tenantId: string;

  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  /**
   * The identifier used by the matching engine to pair this transaction
   * with its counterpart from another source. Computed during
   * normalization based on the tenant's configured matching strategy
   * (single_field, composite, hierarchical).
   */
  @Column({ type: 'varchar', length: 255 })
  primaryMatchKey: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  rrn: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  stan: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  billingNumber: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subscriberId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  bankTransactionId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ebppTransactionId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  bankReference: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  originalReference: string | null;

  @Column({ type: 'decimal', precision: 18, scale: 3 })
  amount: string;

  @Column({ type: 'varchar', length: 3 })
  currency: string;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'timestamp' })
  transactionDate: Date;

  @Column({ type: 'varchar', length: 32, nullable: true })
  cardBin: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  terminalId: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  merchantId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  billingCompany: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  payerName: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  payerAccount: string | null;

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @Column({ type: 'enum', enum: TransactionSource })
  source: TransactionSource;

  @Column({ type: 'varchar', length: 512 })
  sourceFileName: string;

  @Column({ type: 'timestamp' })
  ingestedAt: Date;

  /**
   * Optional raw payload snapshot (pre-normalization) retained for audit
   * and troubleshooting purposes. Stored as native JSON column in MySQL.
   */
  @Column({ type: 'json', nullable: true })
  rawPayload: Record<string, any> | null;

  @CreateDateColumn()
  createdAt: Date;
}
